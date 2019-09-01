import axios, {AxiosError} from 'axios';
import swal from 'sweetalert2';

window['swal'] = swal;

let button = <HTMLButtonElement>document.getElementById("submit");
let coupon = <HTMLInputElement>document.getElementById("coupon");

//Onclick
button.addEventListener("click", evt => {
    evt.preventDefault();

    axios.post("coupon/add", {coupon: coupon.value})
        .then((response) => {

            swal({
                text: response.data.message,
                type: response.data.error ? "error" : "success"
            });

        })
        .catch((error : AxiosError) => {
            swal({
                title: "Erreur",
                text: error.message,
                type: "error"
            });
        });

});