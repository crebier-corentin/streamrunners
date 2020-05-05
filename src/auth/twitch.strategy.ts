import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-twitch';
import { UserService } from '../user/user.service';

@Injectable()
export class TwitchStrategy extends PassportStrategy(Strategy, 'twitch') {
    public constructor(private readonly config: ConfigService, private readonly userService: UserService) {
        super(
            {
                clientID: config.get('TWITCH_CLIENT_ID'),
                clientSecret: config.get('TWITCH_CLIENT_SECRET'),
                callbackURL: config.get('HOSTNAME') + '/auth/twitch/callback',
                scope: 'user_read',
            },
            async function(accessToken, refreshToken, profile, done) {
                done(null, await userService.updateFromTwitch(profile));
            }
        );
    }
}
