<template>
    <div>
    <section>
            <!-- Messages -->
            <div id="sr-chat-area" class="bg-secondary py-3 px-5 chat-container scrollbar chat-scrollbar rounded-top" ref="chat">
                <div class="row chat-message my-2" v-for="msg in cMessages" :key="msg.id">
                <img :src="msg.author.avatar"
                     class="rounded-circle z-depth-0 p-0 col profile-pic"
                     :alt="msg.author.displayName"
                     height="40px"
                     width="40px">
                <div class="col">
                    <span class="user-span">
                        <b><ChatUsername class="username"
                                         :name="msg.author.displayName"
                                         :rank="msg.author.chatRank"
                                         :sparkle="msg.author.sparkle"
                                         @click.native="addMention(msg.author.username)" /></b> - <small>{{msg.createdAt}}</small>
                        </span><br>
                    <ChatMessage :message="msg" />
                    <a class="badge badge-pill chat-delete-message"
                       href="#"
                       :style="{opacity: showDelete ? 1 : 0}"
                       @click="deleteMessage(msg.id)"><i class="fas fa-fw fa-trash"></i> SUPPRIMER</a>
                </div>
            </div>
        </div>

        <div class="input-group mb-3">
            <!-- Member modal button-->
            <div class="input-group-prepend">
                <button class="btn btn-secondary radius-0 px-4 bl-radius shadow-none"
                        type="button"
                        data-toggle="modal"
                        data-target="#membersModal"><i class="fas fa-fw fa-users"></i></button>
                </div>

            <!-- Input -->
            <input type="text"
                   class="form-control radius-0 bg-secondary text-white border-0 px-3 shadow-none h-auto"
                   placeholder="Votre message"
                   aria-label="Votre message"
                   aria-describedby="button-addon2"
                   v-model="message"
                   @keyup.enter="sendMessage">

            <!-- Emoji toggle -->
            <div class="input-group-append">
                <button class="btn btn-secondary radius-0 px-4 shadow-none"
                        type="button"
                        v-popover:emoji.top><i class="far fa-smile"></i></button>
            </div>

            <!-- Send -->
            <div class="input-group-append">
                <button class="btn btn-secondary radius-0 br-radius px-4 shadow-none"
                        type="button"
                        id="button-addon2"
                        @click="sendMessage"><i class="fas fa-fw fa-paper-plane"></i></button>
            </div>
        </div>

        <div class="modal fade"
             id="membersModal"
             tabindex="-1"
             role="dialog"
             aria-labelledby="exampleModalLabel"
             aria-hidden="true">
            <div class="modal-dialog" role="document">
                <div class="modal-content bg-secondary">
                    <div class="modal-header border-0">
                        <!-- <h5 class="modal-title" id="exampleModalLabel">7 membres connectés</h5> -->
                        <button type="button" class="close px-4 text-white" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body border-0">
                        <div class="row">
                            <div class="col members-online-list">
                                <template v-for="user in cActiveUsers">
                                    <ChatUsername :name="user.displayName"
                                                  :rank="user.chatRank"
                                                  :sparkle="user.sparkle"
                                                  :key="user.displayName"
                                                  @click.native="addMention(user.username)" />
                                    <br>
                                </template>
                            </div>
                            <!-- Role list-->
                            <div class="col roles-help-list text-right">
                            <span class="user-span user-admin">
                                <i class="fas fa-fw fa-user-secret"></i> <b>Administrateurs</b>
                            </span><br>
                                <span class="user-span user-moderator">
                                <i class="fas fa-fw fa-user-shield"></i> <b>Modérateurs</b>
                            </span><br>
                                <span class="user-span user-partner">
                                <i class="fas fa-fw fa-handshake"></i> <b>Partenaires</b>
                            </span><br>
                                <span class="user-span user-diamond">
                                <i class="fas fa-fw fa-gem"></i> <b>Diamants</b>
                            </span><br>
                                <span class="user-span user-vip">
                                <i class="fas fa-fw fa-star"></i> <b>VIPs</b>
                            </span><br>
                                <span class="user-span user-member">
                                <i class="fas fa-fw fa-user"></i> <b>Membres</b>
                            </span><br>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer border-0">
                        <button type="button" class="btn btn-secondary" data-dismiss="modal">Fermer</button>
                    </div>
                </div>
            </div>
        </div>

        </section>

        <popover name="emoji">
            <Picker :native="true"
                    :data="emojiIndex"
                    @select="addEmoji"
                    :i18n="emojiPickerI18n"
                    title="Emojis"
                    emoji="joy" />
        </popover>

    </div>

</template>

<script lang="ts">
    import axios from 'axios';
    import ChatUsername from './ChatUsername.vue';
    import ChatMessage from './ChatMessage.vue';
    import { UserEntity } from '../../../src/user/user.entity';
    import * as emojiData from 'emoji-mart-vue-fast/data/all.json';
    import { EmojiIndex, Picker } from 'emoji-mart-vue-fast';
    import 'emoji-mart-vue-fast/css/emoji-mart.css';

    const emojiIndex = new EmojiIndex(emojiData);

    const BSN = window['BSN'];

    export default {
        name: 'Chat',
        components: { ChatUsername, ChatMessage, Picker },
        props: {
            messages: {
                type: Array,
                required: true,
            },
            activeUsers: {
                type: Array,
                required: true,
            },
            showDelete: {
                type: Boolean,
                default: false,
            },
        },

        data() {
            return {
                emojiIndex,
                emojiPickerI18n: {
                    search: 'Recherche', notfound: 'Aucun resultat', categories: {
                        search: 'Résultats de recherche',
                        recent: 'Récents',
                        smileys: 'Smileys & Emotions',
                        people: 'Smileys & Personnes',
                        nature: 'Animaux & Nature',
                        foods: 'Nourritures & Boissons',
                        activity: 'Activités',
                        places: 'Voyage & endroits',
                        objects: 'Objets',
                        symbols: 'Symboles',
                        flags: 'Drapeaux',
                        custom: 'Custom',
                    },
                },

                message: '',

                chatAddUrl: '/chat/add',
                chatDeleteUrl: '/chat/delete',
                sending: false,
            };
        },

        computed: {
            cMessages() {
                return this.messages.reverse();
            },

            cActiveUsers() {
                return this.activeUsers.sort((a: UserEntity, b: UserEntity) => b.chatRank - a.chatRank);
            },

            trimmedMessage(): string {
                return this.message.trim();
            },

            messageValid(): boolean {
                const length = this.trimmedMessage.length;
                return length > 0 && length < 700;
            },
        },

        watch: {
            cMessages(newValue: any[], oldValue: any[]) {

                const newId = newValue[newValue.length - 1]?.id;
                const oldId = oldValue[oldValue.length - 1]?.id;

                if (newId !== oldId) {
                    this.$nextTick(() => {
                        this.scrollToBottom();
                    });
                }
            },
        },

        methods: {
            scrollToBottom() {
                const chat = this.$refs.chat;
                chat.scrollTo({ top: chat.scrollHeight, behavior: 'smooth' });
            },

            addMention(username) {
                this.message += ` @${username}`;
            },

            addEmoji(emoji) {
                this.message += emoji.native;
            },

            sendMessage() {
                //Ignore invalid message or while already sending another message
                if (!this.messageValid || this.sending) return;

                this.sending = true;

                axios.post(this.chatAddUrl, { message: this.message })
                    .then(() => {
                        this.sending = false;

                        //Clear message
                        this.message = '';
                    })
                    .catch(reason => {
                        this.sending = false;
                        return reason;
                    });


            },

            deleteMessage(messageId: number) {
                if (!this.showDelete) return;

                axios.post(this.chatDeleteUrl, { messageId });
            },
        },

        mounted() {
            this.scrollToBottom();
            BSN.initCallback(this.$el);
        },

    };
</script>

<style scoped>

</style>
