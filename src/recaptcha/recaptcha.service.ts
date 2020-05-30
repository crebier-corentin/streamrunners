import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class RecaptchaService {
    public constructor(private readonly secretKey: string) {}

    public async validate(response: string): Promise<boolean> {
        try {
            const res = await axios.post(
                'https://www.google.com/recaptcha/api/siteverify',
                {
                    secret: this.secretKey,
                    response,
                },
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    //To x-www-form-urlencoded
                    transformRequest: (jsonData: { [key: string]: string }) =>
                        Object.entries(jsonData)
                            .map(x => `${encodeURIComponent(x[0])}=${encodeURIComponent(x[1])}`)
                            .join('&'),
                }
            );
            return res.data.success;
        } catch (e) {
            console.error(e);
            return false;
        }
    }
}
