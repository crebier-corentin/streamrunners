#!/bin/bash

# Daily MySQL backup tool
#
# Author: Farzad FARID <ffarid@pragmatic-source.com>
# Date: 04/11/2010


#####################################################################
# PARAMETRAGE BASH
#####################################################################

# Arrête le script dès qu'il y a une erreur non interceptée
set -e
# Intercepte les variables non initialisées
set -u


#####################################################################
# CONFIGURATION
#####################################################################

# Répertoire destination (mappé en NFS)
BACKUP_DIR=/root/mysql_backup/
# Fichier de configuration MySQL avec login/pw d'un compte avec les
# droits suffisants pour lancer mysqldump
MY_CONF=/root/.my.cnf
# Durée de rétention des backups
RETENTION=7
# Bases à exclure séparées par des espaces
DB_EXCLUDE="information_schema"
# Crée ou pas un sous-répertoire par serveur
FOLDER_PER_HOST=1
# Crée ou pas un sous-répertoire par base
FOLDER_PER_BASE=1
# Options mysqldump
MY_OPTS="--opt --complete-insert --routines --single-transaction --max_allowed_packet=32M"

# Variables qu'il n'est pas nécessaire de modifier
# ------------------------------------------------

# Date du jour (format YYYYMMDD-HHMM) précision à la minute
DATE=`date +%Y%m%d-%H%M`
# Préfixe des backups
PREFIX=${HOSTNAME%%.*}_mysql_backup

PROGNAME=mysql-backup
LOCKFILE=/var/tmp/${PROGNAME}.lock

# Commandes mysql (il ne sera généralement pas nécessaire de les modifier)
# Chemin du client mysql
MYSQL="/usr/bin/mysql"
# Chemin de l'outil de dump mysql
MYSQLDUMP="/usr/bin/mysqldump"

# Commande d'écriture dans syslog
# Paramètres d'entrée :
#  - Niveau de syslog (info, warning, error...)
#  - Message à logger
function log() {
  loglevel=$1
  shift
  msg="$*"

  logger -p user.${loglevel} -t "${PROGNAME}[$$]" ${msg}
}

#################################
# Clean old backups
# Arguments :
# - Folder to clean
# - File prefix
# - Retention (days)
#################################
function clean_backups() {
  local dir=$1 prefix=$2 retention=$3

  # Set backup file's date according to the date in the filename
  find "${dir}" -name .snapshot -prune -o -type f -name "${prefix}*" -print0 | while read -d $'\0' file ; do
    # Extract file date as YYYYMMDDhhmm
    file_date=$(echo ${file} | sed -e 's/^.*\.\([0-9]\{8\}\)-\([0-9]\{4\}\).*$/\1\2/')
    # and set
    touch -t ${file_date} ${file}
  done
  ## Suppression des dumps plus vieux que la durée de rétention définie dans la configuration
  find "${dir}" -type f -name "${prefix}*" -mtime +${retention} -exec rm -f "{}" \; 2>/dev/null
}

#####################################################################
# Fonction principale
#####################################################################

function main() {
  log info "Début de la sauvegarde MySQL"

  ## Interrogation de mysql pour obtenir le nom de chaque base
  databases=`${MYSQL} --defaults-extra-file=${MY_CONF} -Bse "show databases"`
  if [ $? -ne 0 ]; then
    # Une erreur s'est produite
    log error "ERREUR d'accès au serveur MySQL. La requête 'show databases' a échoué."
    exit 1
  fi
  # Exclut les bases de la liste
  if [ -n "${DB_EXCLUDE}" ]; then
      # On construit une expression régulière au format "sed" de la liste
      # d'exclusion.
      reg=$(echo ${DB_EXCLUDE} | sed -e 's/ /\\\|/')
      reg="\(${reg}\)"
      # puis on nettoie
      databases=$(echo ${databases} | sed -e "s/${reg}//g")
  fi

  ## Pour chacune des bases
  for base in ${databases}
  do
    # Choix du répertoire à utiliser
    DUMP_DIR=${BACKUP_DIR}
    if [ ${FOLDER_PER_HOST} -eq 1 ]; then
        DUMP_DIR=${DUMP_DIR}/${HOSTNAME%%.*}
    fi
    if [ ${FOLDER_PER_BASE} -eq 1 ]; then
        DUMP_DIR=${DUMP_DIR}/${base}
    fi
    mkdir -p ${DUMP_DIR}
    ## On la dumpe
    log info "Dump de la base ${base}..."
    ${MYSQLDUMP} --defaults-extra-file=${MY_CONF} ${MY_OPTS} ${base} \
      | bzip2 -9 > ${DUMP_DIR}/${PREFIX}_${base}.${DATE}.sql.bz2
    if [ $? -ne 0 ]; then
      log error "ERREUR lors du dump de la base ${base}."
    fi
  done

  # Clean old backups for this server
  clean_backups ${BACKUP_DIR} ${PREFIX} ${RETENTION}

  log info "Fin de la sauvegarde MySQL"
}


#####################################################################
# Point d'entrée du programme et gestion de verrou pour éviter le lancement multiple
#####################################################################
# C'est ici qu'on fait tout le nettoyage (fichiers temporaires par exemple).
if ( set -o noclobber; echo "$$" > "$LOCKFILE") 2> /dev/null;
then
   trap 'rm -f "$LOCKFILE"; exit $?' INT TERM EXIT

   # Appelle la fonction principale
   main

   rm -f "$LOCKFILE"
   trap - INT TERM EXIT
   exit 0
else
   (
     echo "Failed to acquire lockfile: $LOCKFILE."
     echo "Held by following process:"
     ps -p $(cat $LOCKFILE) uww
   ) | log error
   exit 1
fi
