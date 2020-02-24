import axios, {AxiosResponse} from 'axios';
import swal from 'sweetalert2';

window['swal'] = swal;

let button = <HTMLButtonElement>document.getElementById("submit");
let coupon = <HTMLInputElement>document.getElementById("coupon");

//Onclick
button.addEventListener("click", async evt => {
    evt.preventDefault();

    try {

        const response = await axios.post("coupon/add", {coupon: coupon.value});

        swal({
            text: response.data.message,
            type: "success"
        });

    } catch (e) {

        swal({
            text: e.response.data.message,
            type: "error"
        });
    }

});