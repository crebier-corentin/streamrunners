import axios, { AxiosError } from 'axios';
import swal from 'sweetalert2';

(() => {

    /**
     * Add a click event listener, shows a confirm modal, if the user accepts sends a POST request to url with userId in body.
     * Shows a success or error modal depending on request's result.
     *
     * @param classSelector Css class used to find target elements
     * @param url Url to send post request with userId as body to
     * @param confirmTitle Title to be shown in the pre-request modal
     * @param successTitle Title to be shown in the after-request success modal
     */
    function bindElementsToEvent(classSelector: string, url: string, confirmTitle: (displayName: string) => string, successTitle: (displayName: string) => string) {
        const elements = document.getElementsByClassName(classSelector);
        for (let i = 0; i < elements.length; i++) {
            const eleme = elements[i] as HTMLElement;
            eleme.addEventListener('click', async () => {

                const swalRes = await swal.fire({
                    icon: 'question',
                    title: confirmTitle(eleme.dataset.displayName),
                });

                if (swalRes.value == undefined) return;
                try {

                    await axios.post(url, { userId: eleme.dataset.userId });

                    await swal.fire({
                        icon: 'success',
                        title: successTitle(eleme.dataset.displayName),
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
    bindElementsToEvent('js-partner', '/admin/partner', (name) => `Rendre partenaire ${name} ?`, (name) => `${name} rendu partenaire !`);
    bindElementsToEvent('js-remove-partner', '/admin/partner', (name) => `Enlever des partenaires ${name} ?`, (name) => `${name} enlevé des partenaires !`);

    //Ban & Unban
    bindElementsToEvent('js-ban', '/admin/ban', (name) => `Bannir ${name} ?`, (name) => `${name} banni !`);
    bindElementsToEvent('js-unban', '/admin/unban', (name) => `Débannir ${name} ?`, (name) => `${name} débanni !`);

})();
