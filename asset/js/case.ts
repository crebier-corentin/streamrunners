import { Bitmap, Container, Ease, Shadow, Shape, Stage, Text, Ticker, Tween } from 'createjs-module';
import swal from 'sweetalert2';
import axios from 'axios';
import { randomIntFromInterval } from '../../src/shared/shared-utils';

interface Spin {
    name: string,
    color: string,
    image: string
}

//Constants
Ticker.framerate = 60;
const shapeWidth = 160;

//Stage
let stage = new Stage('canvas');

//Button open
const button = <HTMLButtonElement>document.getElementById('open');
button.addEventListener('click', evt => {
    evt.preventDefault();
    spin();
});

//Toggle disable on button
function toggleButton() {
    button.disabled = !button.disabled;
}

//Get result and launchAnimation
async function spin() {

    const swalRes = await swal.fire({
        icon: 'question',
        title: 'Ouvrir la caisse ?',
        showCancelButton: true,
        confirmButtonText: 'Oui',
        cancelButtonText: 'Non',

    });

    if (!swalRes.value) return;

    try {
        toggleButton();

        const result = await axios.post('/case/open', { caseId: window['caseId'] });

        launchAnimation(result.data.spin, result.data.winning);
    }
    catch (e) {
        //If error
        await swal.fire({
            icon: 'error',
            title: 'Un erreur c\'est produite',
            timer: 5000,
        });

        document.location.href = '/inventory';

    }

}

//Animation function
async function launchAnimation(spin: Spin[], winning: Spin) {

    //Show result modal
    async function showResult() {

        await swal.fire({
            icon: 'success',
            title: 'Vous avez gagné :',
            imageUrl: winning.image,
            text: winning.name,
            timer: 5000,
        });

        document.location.href = '/inventory';
    }

    //The animation stops on spin[51], so put the won content there
    spin[51] = winning;

    let container = new Container();

    stage.addChild(container);

    //Create shapes
    for (let i = 0; i < spin.length; i++) {

        //Color
        let shape = new Shape();
        shape.graphics.beginLinearGradientFill(['#00000000' /* transparent */, spin[i].color], [0, 1], 0, 0, 0, 180).drawRect(0, 0, shapeWidth, 180).beginStroke('black').drawRect(0, 0, shapeWidth, 180);

        let image = new Bitmap(spin[i].image);

        let text = new Text();
        text.font = '15px serif';
        text.text = spin[i].name;
        text.color = 'white';
        text.shadow = new Shadow('#000000', 1, 1, 1);

        shape.x = -shapeWidth * i;
        image.x = -shapeWidth * i;
        image.y = (180 - image.image.height) / 2; //Vertical center
        text.x = -shapeWidth * i + (shapeWidth - text.getMeasuredWidth()) / 2;
        text.y = 10;

        container.addChild(shape);
        container.addChild(image);
        container.addChild(text);

    }

    //Create animation
    const totalDistance = stage.canvas['width'] / 2 + shapeWidth * 50 + randomIntFromInterval(5, shapeWidth - 5);
    Tween.get(container).to({ x: totalDistance }, 5000, Ease.quadInOut).call(showResult);

    //Ticker
    let ticker = new Bitmap('/img/case/ticker.png');
    await (new Promise(resolve => ticker.image.addEventListener('load', resolve))); //Wait for ticker.png to load
    ticker.x = stage.canvas['width'] / 2 - ticker.image.width / 2;
    ticker.y = 0;
    stage.addChild(ticker);

    //Start animation
    Ticker.addEventListener('tick', event => {
        stage.update();
    });


}
