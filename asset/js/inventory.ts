import swal from 'sweetalert2';
import axios from 'axios';

//Button buy
const button = <HTMLButtonElement>document.getElementById("buy");
button.addEventListener("click", evt => {
    evt.preventDefault();
    buy("buy", "Beta");
});

//Button buy
const buttonHalloween = <HTMLButtonElement>document.getElementById("buyh");
buttonHalloween.addEventListener("click", evt => {
    evt.preventDefault();
    buy("buyh", "Halloween");
});

//Toggle disable on button
function toggleButton() {
    button.disabled = !button.disabled;
    buttonHalloween.disabled = !buttonHalloween.disabled;
}

function buy(url: string, caseName: string) {

    swal({
        type: "question",
        title: `Acheter une caisse ${caseName} ?`,
        imageUrl: `/img/case/${caseName}/close.png`,
        showCancelButton: true,
        confirmButtonText: 'Oui',
        cancelButtonText: 'Non'

    }).then((result) => {

        if (result.value) {
            toggleButton();
            return axios.post(`/case/${url}`);
        }
        else {
            return Promise.reject("cancel");
        }

    }).then((result) => {
        //If redirect
        if (result.status !== 200) {
            return Promise.reject("status");
        }

        //Check if auth
        if (result.data.auth) {

            //Check if enough points
            if (result.data.enough) {
                //Success
                swal({
                    title: "Vous avez acheté une caisse !",
                    type: "success"
                });

                location.reload();

            }
            else {
                //Error
                swal({
                    title: "Vous n'avez pas assez de points.",
                    text: `Vous avez ${result.data.points} points. \n La caisse coûte ${result.data.cost} points.`,
                    type: "error"
                });

                toggleButton();

            }


        }
        else {
            return Promise.reject();
        }

    }).catch((err) => {

        if (err !== "cancel") {

            //If error
            swal({
                type: "error",
                title: "Un erreur c'est produite",
                timer: 5000
            }).then(() => {
                location.reload();
            });

        }

    });


}
