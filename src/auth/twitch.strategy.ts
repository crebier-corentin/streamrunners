import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-twitch-new';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';

@Injectable()
export class TwitchStrategy extends PassportStrategy(Strategy, 'twitch') {
    constructor(
        private readonly config: ConfigService,
        private readonly userService: UserService,
    ) {
        super(
            {
                clientID: config.get('TWITCH_CLIENT_ID'),
                clientSecret: config.get('TWITCH_CLIENT_SECRET'),
                callbackURL: config.get('HOSTNAME') + '/auth/twitch/callback',
                scope: 'user_read',
            },
            async function(accessToken, refreshToken, profile, done) {
                done(null, await userService.updateFromTwitch(profile));
            },
        );
    }
}
