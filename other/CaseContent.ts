import {CaseInterface} from "../database/entity/Case";

export const casesContent: CaseInterface[] = [
    {
        name: "Beta",
        openImage: "/img/case/Beta/open.png",
        closeImage: "/img/case/Beta/close.png",
        content: [
            {
                name: "Points 1 500",
                chance: 25 * 100,
                amount: 1500,
                special: null,
                image: "/img/case/coin1.png"
            },
            {
                name: "Points 2 500",
                chance: 23 * 100,
                amount: 2500,
                special: null,
                image: "/img/case/coin2.png"
            },
            {
                name: "Points 4 000",
                chance: 20 * 100,
                amount: 4000,
                special: null,
                image: "/img/case/coin2.png"
            },
            {
                name: "Points 5 000",
                chance: 15 * 100,
                amount: 5000,
                special: null,
                image: "/img/case/coin3.png"
            },
            {
                name: "Points 6 000",
                chance: 10 * 100,
                amount: 6000,
                special: null,
                image: "/img/case/coin3.png"
            },
            {
                name: "Points 7 500",
                chance: 3 * 100,
                amount: 7500,
                special: null,
                image: "/img/case/coin4.png"
            },
            {
                name: "Badge Beta",
                chance: 2 * 100,
                amount: null,
                special: "badge_beta",
                image: "/img/case/badge.png"
            },
            {
                name: "Logo sur la bannière",
                chance: 1.99 * 100,
                amount: null,
                special: "logo_banniere",
                image: "/img/case/banniere.png"
            },
            {
                name: "Jeux Steam Aléatoire",
                chance: 0.01 * 100,
                amount: null,
                special: "steam",
                image: "/img/case/steam.png"
            },
        ]
    }
];