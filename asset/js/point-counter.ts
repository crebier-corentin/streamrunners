import { intervalWait } from '../../src/shared/shared-utils';

const pointsEl = document.getElementById('points-counter');

export function updatePointsCounter(value: number) {
    pointsEl.innerText = value.toString();
}

export function disablePointsCounterRequests() {

}
