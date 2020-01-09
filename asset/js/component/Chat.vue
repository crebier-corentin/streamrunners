<template>

    <section class="row justify-content-center">
        <div style="background-color: lightgrey; height: 500px; border-radius: .3rem; margin-top: .3rem;" class="col-9">
            <!-- Chat -->
            <ul class="d-flex flex-column-reverse">
                <li v-for="msg in cMessages">
                    <em class="small">{{msg.createdAt}}</em>
                    <strong>{{msg.author.display_name}} : </strong>
                    <p>{{msg.message}}</p>
                </li>
            </ul>

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
        <input id="text"
               class="col-9"
               style="border-radius: .3rem; margin-top: .3rem;"
               type="text"
               placeholder=" Votre message..."
               v-model="message" />
        <button style="margin-top: .3rem; margin-left: .6rem; width:15%;"
                class="btn btn-outline-success sub col-2"
                :disabled="!messageValid"
                @click="sendMessage">
            Envoyer&nbsp;&nbsp;&nbsp;<i class="fas fa-paper-plane"></i></button>

    </section>

</template>

<script lang="ts">
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
                message: ""
            }
        },

        computed: {
            cMessages() {
                return this.messages;
            },

            trimmedMessage(): string {
                return this.message.trim();
            },

            messageValid(): boolean {
                const length = this.trimmedMessage.length;
                return length > 0 && length < 200;
            }
        },

        methods: {
            sendMessage() {

                //Ignore invalid message
                if (!this.messageValid) return;

                this.$emit('send', this.message);

                //Clear field
                this.message = "";
            }
        },
    };
</script>

<style scoped>

</style>
