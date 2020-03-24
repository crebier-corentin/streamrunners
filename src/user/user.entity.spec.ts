import { ChatRank } from '../shared/types';
import { SubscriptionLevel } from '../subscription/subscription.interfaces';
import { UserEntity } from './user.entity';

describe('UserEntity', () => {
    let user: UserEntity;

    beforeEach(() => {
        user = new UserEntity();
    });

    describe('chatRank', () => {
        beforeEach(() => {
            user.admin = false;
            user.moderator = false;
            user.subscriptionLevel = SubscriptionLevel.None;
        });

        it('should return ChatRank.Admin if the user is an admin', () => {
            user.admin = true;

            expect(user.chatRank).toBe(ChatRank.Admin);
        });

        it('should return ChatRank.Moderator if the user is a moderator', () => {
            user.moderator = true;

            expect(user.chatRank).toBe(ChatRank.Moderator);
        });

        it.each([
            [ChatRank.Member, SubscriptionLevel.None],
            [ChatRank.VIP, SubscriptionLevel.VIP],
            [ChatRank.Diamond, SubscriptionLevel.Diamond],
        ])('should return ChatRank (%i) depending on the subscriptionLevel (%s)', (chatRank, lvl) => {
            user.subscriptionLevel = lvl;

            expect(user.chatRank).toBe(chatRank);
        });
    });
});
