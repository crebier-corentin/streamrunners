import * as createjs from 'createjs-module';
import swal from 'sweetalert2';

//Constant
createjs.Ticker.framerate = 60;
const shapeWidth = 180;

//Stage and result
let stage = new createjs.Stage("canvas");
const spin: Array<{ name: string, color: string, image: string }> = window['spin'];

function randomIntFromInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

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

//Animation function
(() => {
    let container = new createjs.Container();

    stage.addChild(container);

    //Create shapes
    for (let i = 0; i < spin.length; i++) {
        //Color

        let shape = new createjs.Shape();
        shape.graphics.beginFill(spin[i].color).drawRect(0, 0, shapeWidth, 180).beginStroke("black").drawRect(0, 0, shapeWidth, 180);
        //   .beginRadialGradientFill([spin[i].color, "white"], [0.5, 1], shapeWidth / 2, shapeWidth / 2, 0, shapeWidth / 2, shapeWidth / 2, shapeWidth).drawRect(0, 0, shapeWidth, 180);


        let image = new createjs.Bitmap(spin[i].image);

        let text = new createjs.Text();
        text.font = '15px serif';
        text.text = spin[i].name;
        text.color = "white";
        text.shadow = new createjs.Shadow("#000000", 1, 1, 1);

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
    createjs.Tween.get(container).to({x: totalDistance}, 5000, createjs.Ease.quadInOut).call(showResult);

    //Middle
    let middle = new createjs.Shape();
    middle.graphics.beginFill("#000000").drawRect(stage.canvas["width"] / 2, 0, 5, stage.canvas["height"]);
    stage.addChild(middle);

    //Start animation
    createjs.Ticker.addEventListener("tick", event => {
        stage.update();
    });
})();