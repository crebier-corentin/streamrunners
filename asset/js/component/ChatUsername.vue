<template>
    <span class="text-align chat-username" :class="rankClass">
        <span :class="{'chat-sparkle' : sparkle}"><i class="fas" :class="pawn" /> {{name}}</span>
    </span>
</template>

<script lang="ts">
    import { ChatRank } from '../../../src/shared/types';

    export default {
        name: 'ChatUsername',

        props: {
            name: {
                type: String,
                required: true,
            },
            rank: {
                type: Number,
                required: true,
            },
            sparkle: {
                type: Boolean,
                required: true,
            },
        },

        computed: {
            rankClass(): string {
                switch (this.rank as ChatRank) {
                    case ChatRank.Member:
                        return 'user-member';
                    case ChatRank.VIP:
                        return 'user-vip';
                    case ChatRank.Diamond:
                        return 'user-diamond';
                    case ChatRank.Partner:
                        return 'user-partner';
                    case ChatRank.Birthday:
                        return 'user-birthday';
                    case ChatRank.Moderator:
                        return 'user-moderator';
                    case ChatRank.Admin:
                        return 'user-admin';

                }
            },
            pawn(): string {
                switch (this.rank as ChatRank) {
                    case ChatRank.Member:
                        return 'fa-user';
                    case ChatRank.VIP:
                        return 'fa-star';
                    case ChatRank.Diamond:
                        return 'fa-gem';
                    case ChatRank.Partner:
                        return 'fa-handshake';
                    case ChatRank.Birthday:
                        return 'fa-horse-head';
                    case ChatRank.Moderator:
                        return 'fa-user-shield';
                    case ChatRank.Admin:
                        return 'fa-user-secret';

                }

            },
        },
    };
</script>

<style scoped>

</style>
