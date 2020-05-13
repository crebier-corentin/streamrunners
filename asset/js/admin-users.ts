import axios, { AxiosError } from 'axios';
import swal from 'sweetalert2';

(() => {

    //Set points
    const elements = document.getElementsByClassName('js-points');
    for (let i = 0; i < elements.length; i++) {
        const element = elements[i] as HTMLElement;
        element.addEventListener('click', async () => {
            const { value: newPoints } = await swal.fire({
                title: `Modifier la solde de points de ${element.dataset.displayName}`,
                input: 'number',
                inputValue: element.dataset.points,
                inputAttributes: { min: '0' },
                inputValidator(value: string | number) {
                    if (value < 0) {
                        return 'Pas de valeur en dessous de 0.';
                    }

                    return null;
                },
                showCancelButton: true,
                cancelButtonText: 'Annuler',
                confirmButtonText: 'Modifier',
            });

            if (newPoints == undefined) return;

            try {

                await axios.post('/admin/set-points', { userId: element.dataset.userId, value: newPoints });

                await swal.fire({
                    icon: 'success',
                    title: `Solde de ${element.dataset.displayName} modifié !`,
                    timer: 2000,
                });

                location.reload();
            }
            catch (e) {
                const error = e as AxiosError;

                await swal.fire({
                    icon: 'error',
                    title: error.response.data.message,
                });

            }

        });

    }

    /**
     * Add a click event listener, shows a confirm modal, if the user accepts sends a POST request to url with userId in body.
     * Shows a success or error modal depending on request's result.
     *
     * @param classSelector Css class used to find target elements
     * @param url Url to send post request with userId as body to
     * @param confirmTitle Title to be shown in the pre-request modal
     * @param successTitle Title to be shown in the after-request success modal
     */
    function bindElementsToAction(classSelector: string, url: string, confirmTitle: (displayName: string) => string, successTitle: (displayName: string) => string) {
        const elements = document.getElementsByClassName(classSelector);
        for (let i = 0; i < elements.length; i++) {
            const element = elements[i] as HTMLElement;
            element.addEventListener('click', async () => {

                const swalRes = await swal.fire({
                    icon: 'question',
                    title: confirmTitle(element.dataset.displayName),
                    showCancelButton: true,
                    cancelButtonText: 'Non',
                    confirmButtonText: 'Oui',
                });

                if (swalRes.value == undefined) return;
                try {

                    await axios.post(url, { userId: element.dataset.userId });

                    await swal.fire({
                        icon: 'success',
                        title: successTitle(element.dataset.displayName),
                        timer: 2000,
                    });

                    location.reload();
                }
                catch (e) {
                    const error = e as AxiosError;

                    await swal.fire({
                        icon: 'error',
                        title: error.response.data.message,
                    });

                }

            });
        }
    }

    //Partner
    bindElementsToAction('js-partner', '/admin/partner', (name) => `Rendre partenaire ${name} ?`, (name) => `${name} rendu partenaire !`);
    bindElementsToAction('js-remove-partner', '/admin/partner', (name) => `Enlever des partenaires ${name} ?`, (name) => `${name} enlevé des partenaires !`);

    //Ban & Unban
    bindElementsToAction('js-ban', '/admin/ban', (name) => `Bannir ${name} ?`, (name) => `${name} banni !`);
    bindElementsToAction('js-unban', '/admin/unban', (name) => `Débannir ${name} ?`, (name) => `${name} débanni !`);

    //Mod & Unmod
    bindElementsToAction('js-mod', '/admin/moderator', (name) => `Passer modérateur ${name} ?`, (name) => `${name} est maintenant un modérateur !`);
    bindElementsToAction('js-unmod', '/admin/moderator', (name) => `Enlever ${name} des modérateurs ?`, (name) => `${name} enlevé des modérateurs !`);

})();
