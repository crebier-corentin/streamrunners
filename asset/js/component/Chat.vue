<template>

    <section class="row justify-content-center">
        <!-- Messages -->
        <div class="col-9 rounded mt-1 chat" ref="chat">
            <div class="chat-messages p-0 m-0">
                <template v-for="msg in cMessages">
                    <small class="font-italic text-center mr-1">{{msg.createdAt}}</small>
                    <span><i class="fas fa-user-shield"></i>{{msg.author.display_name}}</span>
                    <span>: {{msg.message}}</span>
                </template>
            </div>

        </div>

        <div style="background-color: lightgrey; height: 500px; border-radius: .3rem; margin-top: .3rem; margin-left: .6rem;"
             class="col-2">
            <span><font color="red"><i class="fas fa-user-shield"></i> Omnes</font></span>
            <br>
            <span><font color="blue">Membre lambda</font></span>
            <br>
            <span><font color="blue">Membre lambda</font></span>
            <br>
            <span><font color="blue">Membre lambda</font></span>
        </div>

        <!-- Input-->
        <input id="text"
               class="col-9 rounded mt-1 form-control"
               type="text"
               placeholder=" Votre message..."
               v-model="message"
               @keyup.enter="sendMessage" />
        <button class="btn btn-outline-success sub col-2 mt-1 ml-1"
                :disabled="!messageValid || sending"
                @click="sendMessage">
            Envoyer&nbsp;&nbsp;&nbsp;<i class="fas fa-paper-plane"></i></button>

    </section>

</template>

<script lang="ts">
    import axios from "axios";

    export default {
        name: "Chat",

        props: {
            messages: {
                type: Array,
                required: true
            },
        },

        data() {
            return {
                message: "",

                chatAddUrl: "/watch/chat/add",
                sending: false
            }
        },

        computed: {
            cMessages() {
                return this.messages.reverse();
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


            }
        },

        mounted() {
            this.scrollToBottom();
        }
    };
</script>

<style scoped>

</style>
