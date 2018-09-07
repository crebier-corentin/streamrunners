import {CaseInterface} from "../database/entity/Case";

export const casesContent: CaseInterface[] = [
    {
        name: "Beta",
        openImage: "img/case/Beta/open.png",
        closeImage: "img/case/Beta/close.png",
        content: [
            {
                name: "Points 3 000",
                chance: 25 * 100,
                amount: 3000,
                special: null
            },
            {
                name: "Points 5 000",
                chance: 23 * 100,
                amount: 5000,
                special: null
            },
            {
                name: "Points 8 000",
                chance: 20 * 100,
                amount: 8000,
                special: null
            },
            {
                name: "Points 10 000",
                chance: 15 * 100,
                amount: 10000,
                special: null
            },
            {
                name: "Points 12 000",
                chance: 10 * 100,
                amount: 12000,
                special: null
            },
            {
                name: "Points 15 000",
                chance: 3 * 100,
                amount: 15000,
                special: null
            },
            {
                name: "Points 20 000",
                chance: 2 * 100,
                amount: 20000,
                special: null
            },
            {
                name: "Logo sur la bannière",
                chance: 1.99 * 100,
                amount: null,
                special: "logo_banniere"
            },
            {
                name: "Jeux Steam Aléatoire",
                chance: 0.01 * 100,
                amount: null,
                special: "steam"
            },
        ]
    }
];