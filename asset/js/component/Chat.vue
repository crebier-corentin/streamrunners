<template>
    <div>
        <section class="chat-grid">
            <!-- Messages -->
            <div class="messages rounded chat-container scrollbar chat-scrollbar" ref="chat">
                <div class="d-flex flex-column p-0 m-0 force-overflow">
                    <div class="chat-message" v-for="msg in cMessages" :key="msg.id">

                        <img class="avatar" :src="msg.author.avatar" :alt="msg.author.displayName">

                        <ChatUsername class="username"
                                      :name="msg.author.displayName"
                                      :rank="msg.author.chatRank"
                                      :sparkle="msg.author.sparkle"
                                      @click.native="addMention(msg.author.username)" />

                        <small class="timestamp">{{msg.createdAt}} </small>

                        <span class="message"><ChatMessage :message="msg" />
                        <button class="text-danger"
                                :style="{opacity: showDelete ? 1 : 0}"
                                @click="deleteMessage(msg.id)"><i class="fas fa-times" /></button>
                    </span>


                    </div>
                </div>

            </div>

            <!-- Active users -->
            <div class="users rounded chat-container d-flex flex-column scrollbar chat-scrollbar"
                 style="position:relative;">
                <i class="fas fa-question-circle whoishelp"
                   aria-hidden="true"
                   data-placement="right"
                   data-html="true"
                   data-toggle="popover"
                   data-title="Les rôles"
                   data-content='



        <div class="d-flex flex-column p-0 m-0">
            <span class="text-align chat-username chat-name-admin"><i class="fas fa-user-secret" aria-hidden="true"></i> Administrateurs</span>
            <span class="text-align chat-username chat-name-moderator"><i class="fas fa-user-shield" aria-hidden="true"></i> Modérateurs</span>
            <span class="text-align chat-username chat-name-partner"><i class="fas fa-handshake" aria-hidden="true"></i> Partenaires</span>
            <span class="text-align chat-username chat-name-diamond"><i class="fas fa-gem" aria-hidden="true"></i> Diamants</span>
            <span class="text-align chat-username chat-name-vip"><i class="fas fa-star" aria-hidden="true"></i> VIPs</span>
            <span class="text-align chat-username chat-name-member"><i class="fas fa-user" aria-hidden="true"></i> Membres</span>
        </div>





            '></i>
                <div class="d-flex flex-column p-0 m-0 force-overflow">
                    <ChatUsername :name="user.displayName"
                                  :rank="user.chatRank"
                                  :sparkle="user.sparkle"
                                  v-for="user in cActiveUsers"
                                  :key="user.displayName"
                                  @click.native="addMention(user.username)" />
                </div>
            </div>

            <!-- Input-->
            <input id="text"
                   class="input rounded border"
                   style="border-color: #8c6dc5!important;"
                   type="text"
                   placeholder=" Votre message..."
                   v-model="message"
                   autocomplete="off"
                   @keyup.enter="sendMessage" />
            <!-- Emoji toggle -->
            <button class="emoji btn btn-primary w-100 h-100" v-popover:emoji.top><i class="far fa-smile"></i></button>


            <button class="btn btn-outline-success sub" @click="sendMessage">
                Envoyer&nbsp;&nbsp;&nbsp;<i class="fas fa-paper-plane" /></button>

        </section>

        <popover name="emoji">
            <Picker :native="true"
                    :data="emojiIndex"
                    @select="addEmoji"
                    :i18n="emojiPickerI18n"
                    title="Emojis"
                    emoji="joy" />
        </popover>

    </div>

</template>

<script lang="ts">
    import axios from 'axios';
    import ChatUsername from './ChatUsername.vue';
    import ChatMessage from './ChatMessage.vue';
    import { UserEntity } from '../../../src/user/user.entity';
    import * as emojiData from 'emoji-mart-vue-fast/data/all.json';
    import { EmojiIndex, Picker } from 'emoji-mart-vue-fast';
    import 'emoji-mart-vue-fast/css/emoji-mart.css';

    const emojiIndex = new EmojiIndex(emojiData);

    const BSN = window['BSN'];

    export default {
        name: 'Chat',
        components: { ChatUsername, ChatMessage, Picker },
        props: {
            messages: {
                type: Array,
                required: true,
            },
            activeUsers: {
                type: Array,
                required: true,
            },
            showDelete: {
                type: Boolean,
                default: false,
            },
        },

        data() {
            return {
                emojiIndex,
                emojiPickerI18n: {
                    search: 'Recherche', notfound: 'Aucun resultat', categories: {
                        search: 'Résultats de recherche',
                        recent: 'Récents',
                        smileys: 'Smileys & Emotions',
                        people: 'Smileys & Personnes',
                        nature: 'Animaux & Nature',
                        foods: 'Nourritures & Boissons',
                        activity: 'Activités',
                        places: 'Voyage & endroits',
                        objects: 'Objets',
                        symbols: 'Symboles',
                        flags: 'Drapeaux',
                        custom: 'Custom',
                    },
                },

                message: '',

                chatAddUrl: '/chat/add',
                chatDeleteUrl: '/chat/delete',
                sending: false,
            };
        },

        computed: {
            cMessages() {
                return this.messages.reverse();
            },

            cActiveUsers() {
                return this.activeUsers.sort((a: UserEntity, b: UserEntity) => b.chatRank - a.chatRank);
            },

            trimmedMessage(): string {
                return this.message.trim();
            },

            messageValid(): boolean {
                const length = this.trimmedMessage.length;
                return length > 0 && length < 700;
            },
        },

        watch: {
            cMessages(newValue: any[], oldValue: any[]) {

                const newId = newValue[newValue.length - 1]?.id;
                const oldId = oldValue[oldValue.length - 1]?.id;

                if (newId !== oldId) {
                    this.$nextTick(() => {
                        this.scrollToBottom();
                    });
                }
            },
        },

        methods: {
            scrollToBottom() {
                const chat = this.$refs.chat;
                chat.scrollTo({ top: chat.scrollHeight, behavior: 'smooth' });
            },

            addMention(username) {
                this.message += ` @${username}`;
            },

            addEmoji(emoji) {
                this.message += emoji.native;
            },

            sendMessage() {
                //Ignore invalid message or while already sending another message
                if (!this.messageValid || this.sending) return;

                this.sending = true;

                axios.post(this.chatAddUrl, { message: this.message })
                    .then(() => {
                        this.sending = false;

                        //Clear message
                        this.message = '';
                    })
                    .catch(reason => {
                        this.sending = false;
                        return reason;
                    });


            },

            deleteMessage(messageId: number) {
                if (!this.showDelete) return;

                axios.post(this.chatDeleteUrl, { messageId });
            },
        },

        mounted() {
            this.scrollToBottom();
            BSN.initCallback(this.$el);
        },

    };
</script>

<style scoped>

</style>
