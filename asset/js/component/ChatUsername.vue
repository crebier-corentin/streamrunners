<template>
    <span class="text-align" :class="rankClass"><i class="fas" :class="pawn" />{{name}}</span>
</template>

<script lang="ts">
    import {ChatRank} from "../../../shared/Types";

    export default {
        name: "ChatUsername",

        props: {
            name: {
                type: String,
                required: true
            },
            rank: {
                type: Number,
                required: true
            },
        },

        computed: {
            rankClass(): string {
                switch (this.rank as ChatRank) {
                    case ChatRank.Member:
                        return "chat-name-member";
                    case ChatRank.VIP:
                        return "chat-name-vip";
                    case ChatRank.Diamond:
                        return "chat-name-diamond";
                    case ChatRank.Partner:
                        return "chat-name-partner";
                    case ChatRank.Moderator:
                        return "chat-name-moderator";
                    case ChatRank.Admin:
                        return "chat-name-admin";

                }
            },
            pawn(): string {
                switch (this.rank as ChatRank) {
                    case ChatRank.Member:
                        return "fa-user";
                    case ChatRank.VIP:
                        return "fa-star";
                    case ChatRank.Diamond:
                        return "fa-gem";
                    case ChatRank.Partner:
                        return "fa-handshake";
                    case ChatRank.Moderator:
                        return "fa-user-shield";
                    case ChatRank.Admin:
                        return "fa-user-secret";

                }

            }
        },
    }
</script>

<style scoped>

</style>
