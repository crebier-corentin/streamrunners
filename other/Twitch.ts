import * as moment from "moment";
import axios, {AxiosRequestConfig, AxiosResponse} from "axios";
import {Semaphore} from "./Semaphore";
import {sleep} from "./utils";
import CacheService from "./CacheService";

export class Twitch {
    private static readonly clientId: string = process.env.TWITCH_CLIENT_ID;

    private static remaining: number = 30;
    private static reset: moment.Moment = moment().add(1, "minute");
    private static readonly lock = new Semaphore(1);

    private static readonly cache = new CacheService(120);

    public static async isStreamOnline(twitchId: string) {
        return await this.cache.get(twitchId, async () => {

            const request: AxiosRequestConfig = {
                method: "GET",
                url: "https://api.twitch.tv/helix/streams",
                params: {"user_id": twitchId}
            };

            const res = await this.makeRequest(request);
            return res.data.data.length > 0;
        });
    }

    private static async makeRequest<T = any>(request: AxiosRequestConfig): Promise<AxiosResponse<T>> {

        await this.lock.acquire();

        try {
            //Check rate limit
            if (this.remaining === 0) {
                //Wait for refill
                const timeToReset = this.reset.diff(moment());
                await sleep(Math.max(timeToReset, 0));
            }

            //Add client Id
            request.headers = {...request.headers, ...{"Client-ID": this.clientId}};

            const res = await axios.request(request);

            //Update ratelimit properties
            this.remaining = Number(res.headers["ratelimit-remaining"]);
            this.reset = moment.unix(Number(res.headers["ratelimit-reset"]));

            return res;
        }
        finally {
            this.lock.release();
        }


    }
}
