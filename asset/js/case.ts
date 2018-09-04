import * as createjs from 'createjs-module';

createjs.Ticker.framerate = 60;

const shapeWidth = 100;
let stage = new createjs.Stage("canvas");

function randomIntFromInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

(() => {

    let timeline = new createjs.Timeline([], "spin", {});
    let container = new createjs.Container();

    stage.addChild(container);

    //Create shapes
    for (let i = 0; i < 56; i++) {
        //Color
        let r = randomIntFromInterval(0, 255);
        let g = randomIntFromInterval(0, 255);
        let b = randomIntFromInterval(0, 255);

        let shape = new createjs.Shape();
        shape.graphics.beginFill(`rgba(${r}, ${g}, ${b}, 1)`).drawRect(0, 0, shapeWidth, 100);

        let text = new createjs.Text();
        text.text = i.toString();

        shape.x = -shapeWidth * i;
        text.x = -shapeWidth * i;

        container.addChild(shape);
        container.addChild(text);

    }


    const totalDistance = stage.canvas["width"] / 2 + shapeWidth * 50 + randomIntFromInterval(5, shapeWidth - 5);
    timeline.addTween(createjs.Tween.get(container).to({x: totalDistance}, 5000, createjs.Ease.quadInOut));

    //Middle
    let middle = new createjs.Shape();
    middle.graphics.beginFill("#000000").drawRect(stage.canvas["width"] / 2, 0, 5, stage.canvas["height"]);
    stage.addChild(middle);


    createjs.Ticker.addEventListener("tick", function (event) {


        stage.update();
    });
})();