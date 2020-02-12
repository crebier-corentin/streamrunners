let moment = require("moment");
if ("default" in moment) {
    moment = moment["default"];
}

import {formatDuration} from "../../src/shared/shared-utils";

const countdownsAndDate = Array.from(document.getElementsByClassName("countdown")).map(el => ({
    el: <HTMLElement>el,
    date: moment((<HTMLElement>el).dataset.endingDate)
}));

const updateCountdowns = () => {
    for (const {el, date} of countdownsAndDate) {
        const duration = moment.duration(date.diff(moment()));
        el.innerText = formatDuration(duration);
    }
};

setInterval(updateCountdowns, 1000);
