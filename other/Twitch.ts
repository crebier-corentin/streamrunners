import * as moment from "moment";
import axios, {AxiosRequestConfig, AxiosResponse} from "axios";
import {Semaphore} from "./Semaphore";
import {sleep} from "./utils";
import CacheService from "./CacheService";

export interface TwitchUser {
    broadcaster_type: "partner" | "affiliate" | "";
    description: string;
    display_name: string;
    email?: string;
    id: string;
    login: string;
    offline_image_url: string;
    profile_image_url: string;
    type: "staff" | "admin" | "global_mod" | "";
    view_count: number;
}

export interface TwitchResponse<T> {
    data: T[];
}

export class Twitch {
    private static readonly clientId: string = process.env.TWITCH_CLIENT_ID;

    private static remaining: number = 30;
    private static reset: moment.Moment = moment().add(1, "minute");
    private static readonly lock = new Semaphore(1);

    private static readonly cache = new CacheService(120);

    private static async makeRequest<T = any>(request: AxiosRequestConfig): Promise<AxiosResponse<TwitchResponse<T>>> {

        await Twitch.lock.acquire();

        try {
            //Check rate limit
            if (Twitch.remaining === 0) {
                //Wait for refill
                const timeToReset = Twitch.reset.diff(moment());
                await sleep(Math.max(timeToReset, 0));
            }

            //Add client Id
            request.headers = {...request.headers, ...{"Client-ID": Twitch.clientId}};

            const res = await axios.request(request);

            //Update ratelimit properties
            Twitch.remaining = Number(res.headers["ratelimit-remaining"]);
            Twitch.reset = moment.unix(Number(res.headers["ratelimit-reset"]));

            return res;
        }
        finally {
            Twitch.lock.release();
        }


    }

    public static async isStreamOnline(twitchId: string): Promise<boolean> {
        return await Twitch.cache.get(twitchId, async () => {

            const request: AxiosRequestConfig = {
                method: "GET",
                url: "https://api.twitch.tv/helix/streams",
                params: {"user_id": twitchId}
            };

            const res = await Twitch.makeRequest(request);
            return res.data.data.length > 0;
        });
    }

    public static getUsers(ids: string[]): Promise<AxiosResponse<TwitchResponse<TwitchUser>>> {
        const request: AxiosRequestConfig = {
            method: "GET",
            url: "https://api.twitch.tv/helix/users",
            params: {"id": ids}
        };

        return Twitch.makeRequest<TwitchUser>(request);
    }


}
