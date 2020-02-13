import { TwitchService } from './twitch.service';
import { Test, TestingModule } from '@nestjs/testing';
import nock = require('nock');
import { ConfigModule } from '@nestjs/config';

describe('TwitchService', () => {
    let service: TwitchService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [ConfigModule.forRoot()],
            providers: [TwitchService],
        }).compile();

        service = module.get<TwitchService>(TwitchService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('isStreamOnline', () => {
        it('should return true if stream is online', () => {
            nock('https://api.twitch.tv')
                .get('/helix/streams')
                .query({ user_id: 123 })
                .reply(200, {
                    data: [
                        {
                            id: '123',
                            user_id: '123',
                            user_name: 'test',
                            game_id: '21779',
                            type: 'live',
                            title: 'title',
                            viewer_count: 4110,
                            started_at: '2020-02-13T07:44:52Z',
                            language: 'fr',
                            thumbnail_url:
                                'https://static-cdn.jtvnw.net/previews-ttv/live_user_test-{width}x{height}.jpg',
                            tag_ids: ['6f655045-9989-4ef7-8f85-1edcec42d648'],
                        },
                    ],
                    pagination: {
                        cursor: 'IA',
                    },
                });

            return expect(service.isStreamOnline('123')).resolves.toBe(true);
        });

        it('should return false if stream is offline', () => {
            nock('https://api.twitch.tv')
                .get('/helix/streams')
                .query({ user_id: 123 })
                .reply(200, {
                    data: [],
                    pagination: {},
                });

            return expect(service.isStreamOnline('123')).resolves.toBe(false);
        });
    });

    describe('getUsers', () => {
        it('should return the users info', () => {
            const replyData = {
                data: [
                    {
                        id: '123',
                        login: 'a',
                        display_name: 'a',
                        type: '',
                        broadcaster_type: '',
                        description: '',
                        profile_image_url:
                            'https://static-cdn.jtvnw.net/user-default-pictures-uv/13e5fa74-defa-11e9-809c-784f43822e80-profile_image-300x300.png',
                        offline_image_url: '',
                        view_count: 49,
                    },
                    {
                        id: '456',
                        login: 'b',
                        display_name: 'b',
                        type: '',
                        broadcaster_type: 'partner',
                        description: '',
                        profile_image_url:
                            'https://static-cdn.jtvnw.net/jtv_user_pictures/fbc5661c-7812-4b43-bf5e-16c3ba536d5d-profile_image-300x300.png',
                        offline_image_url:
                            'https://static-cdn.jtvnw.net/jtv_user_pictures/b7fb5e6e-a8f7-40fb-98de-d9180d052665-channel_offline_image-1920x1080.png',
                        view_count: 92613450,
                    },
                ],
            };

            nock('https://api.twitch.tv')
                .filteringPath(path => '/helix/users')
                .get('/helix/users')
                .reply(200, replyData);

            return expect(service.getUsers(['123', '456'])).resolves.toHaveProperty('data', replyData);
        });
    });
});
