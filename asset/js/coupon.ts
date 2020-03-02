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

        swal.fire({
            text: response.data.message,
            icon: "success"
        });

    } catch (e) {

        swal.fire({
            text: e.response.data.message,
            icon: "error"
        });
    }

});
