export function updatePoints(points: number): void {
    const event = new CustomEvent('updatePoints', {
        detail: {
            value: points,
        },
    });

    window.dispatchEvent(event);
}

