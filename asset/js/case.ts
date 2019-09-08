import {Stage, Container, Bitmap, Text, Shadow, Ticker, Tween, Shape, Ease} from 'createjs-module';

import swal from 'sweetalert2/dist/sweetalert2';
import axios from 'axios';

interface Spin {
    name: string,
    color: string,
    image: string
}

function randomIntFromInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

//Constants
Ticker.framerate = 60;
const shapeWidth = 180;

//Stage
let stage = new Stage("canvas");

//Button open
const button = <HTMLButtonElement> document.getElementById("open");
button.addEventListener("click", evt => {
    evt.preventDefault();
    spin();
});

//Toggle disable on button
function toggleButton() {
    button.disabled = !button.disabled;
}

//Get result and launchAnimation
function spin() {

    swal({
        type: "question",
        title: window["steamKeyAvailable"] ? "Ouvrir la caisse ?" : "Il n'y as actuellement plus de clé Steam, souhaitez vous quand même ouvrir la caisse ?",
        showCancelButton: true,
        confirmButtonText: 'Oui',
        cancelButtonText: 'Non'

    }).then((result) => {

        if (result.value) {
            toggleButton();
            return axios.post("/case/open", {uuid: window['uuid']});
        }
        else {
            return Promise.reject("cancel");
        }

    }).then((result) => {
        //If redirect
        if (result.status !== 200) {
            return Promise.reject("status");
        }

        launchAnimation(result.data);

    }).catch((err) => {

        if (err !== "cancel") {

            //If error
            swal({
                type: "error",
                title: "Un erreur c'est produite",
                timer: 5000
            }).then(() => {
                document.location.href = "/case/inventory";
            });

        }

    });
}


//Animation function
function launchAnimation(spin: Array<Spin>) {

    //Show result modal
    function showResult() {

        swal({
            type: "success",
            title: "Vous avez gagné :",
            imageUrl: spin[51].image,
            text: spin[51].name,
            timer: 5000
        }).then(() => {
            document.location.href = "/case/inventory";
        });
    }

    let container = new Container();

    stage.addChild(container);

    //Create shapes
    for (let i = 0; i < spin.length; i++) {
        //Color

        let shape = new Shape();
        shape.graphics.beginFill(spin[i].color).drawRect(0, 0, shapeWidth, 180).beginStroke("black").drawRect(0, 0, shapeWidth, 180);
        //   .beginRadialGradientFill([spin[i].color, "white"], [0.5, 1], shapeWidth / 2, shapeWidth / 2, 0, shapeWidth / 2, shapeWidth / 2, shapeWidth).drawRect(0, 0, shapeWidth, 180);


        let image = new Bitmap(spin[i].image);

        let text = new Text();
        text.font = '15px serif';
        text.text = spin[i].name;
        text.color = "white";
        text.shadow = new Shadow("#000000", 1, 1, 1);

        shape.x = -shapeWidth * i;
        image.x = -shapeWidth * i;
        text.x = -shapeWidth * i + (shapeWidth - text.getMeasuredWidth()) / 2;
        text.y = 10;

        container.addChild(shape);
        container.addChild(image);
        container.addChild(text);

    }


    //Create animation
    const totalDistance = stage.canvas["width"] / 2 + shapeWidth * 50 + randomIntFromInterval(5, shapeWidth - 5);
    Tween.get(container).to({x: totalDistance}, 5000, Ease.quadInOut).call(showResult);

    //Middle
    let middle = new Shape();
    middle.graphics.beginFill("#000000").drawRect(stage.canvas["width"] / 2, 0, 5, stage.canvas["height"]);
    stage.addChild(middle);

    //Start animation
    Ticker.addEventListener("tick", event => {
        stage.update();
    });
}