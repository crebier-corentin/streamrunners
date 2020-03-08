const pointsEl = document.getElementById('points-counter');

window.addEventListener('updatePoints', (ev: CustomEvent) => {

    pointsEl.innerText = (ev.detail as { value: number }).value.toString();
});

