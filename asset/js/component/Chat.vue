<template>

    <section class="chat-grid">
        <!-- Messages -->
        <div class="messages rounded chat-container" ref="chat">
            <div class="chat-messages p-0 m-0">
                <template v-for="msg in cMessages">
                    <small class="font-italic text-center mr-1">{{msg.createdAt}} </small>

                    <ChatUsername class="mr-1" :name="msg.author.displayName" :rank="msg.author.chatRank" />
                    <span :class="{'font-italic': msg.deleted}"> : {{msg.message}}</span>
                    <button class="text-danger" :style="{opacity: showDelete ? 1 : 0}" @click="deleteMessage(msg.id)"><i
                            class="fas fa-times" /></button>

                </template>
            </div>

        </div>

        <!-- Active users -->
        <div class="users rounded chat-container d-flex flex-column">
            <ChatUsername :name="user.displayName" :rank="user.chatRank" v-for="user in cActiveUsers" :key="user.displayName" />
        </div>

        <!-- Input-->
        <input id="text"
               class="input rounded border"
               style="border-color: #8c6dc5!important;"
               type="text"
               placeholder=" Votre message..."
               v-model="message"
               @keyup.enter="sendMessage" />
        <button class="button btn btn-outline-success sub m-0"
                :disabled="!messageValid || sending"
                @click="sendMessage">
            Envoyer&nbsp;&nbsp;&nbsp;<i class="fas fa-paper-plane" /></button>

    </section>

</template>

<script lang="ts">
    import axios from "axios";
    import ChatUsername from "./ChatUsername.vue";

    export default {
        name: "Chat",
        components: {ChatUsername},
        props: {
            messages: {
                type: Array,
                required: true
            },
            activeUsers: {
                type: Array,
                required: true
            },
            showDelete: {
                type: Boolean,
                default: false
            }
        },

        data() {
            return {
                message: "",

                chatAddUrl: "/chat/add",
                chatDeleteUrl: "/chat/delete",
                sending: false
            }
        },

        computed: {
            cMessages() {
                return this.messages.reverse();
            },

            cActiveUsers() {
                return this.activeUsers;
            },

            trimmedMessage(): string {
                return this.message.trim();
            },

            messageValid(): boolean {
                const length = this.trimmedMessage.length;
                return length > 0 && length < 200;
            }
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
            }
        },

        methods: {
            scrollToBottom() {
                const chat = this.$refs.chat;
                chat.scrollTo({top: chat.scrollHeight, behavior: "smooth"});
            },

            sendMessage() {
                //Ignore invalid message or while already sending another message
                if (!this.messageValid || this.sending) return;

                this.sending = true;

                axios.post(this.chatAddUrl, {message: this.message})
                    .then(() => {
                        this.sending = false;

                        //Clear message
                        this.message = "";
                    })
                    .catch(reason => {
                        this.sending = false;
                        return reason;
                    });


            },

            deleteMessage(messageId: number) {
                if (!this.showDelete) return;

                axios.post(this.chatDeleteUrl, {messageId});
            },
        },

        mounted() {
            this.scrollToBottom();
        }
    };
</script>

<style scoped>

</style>
