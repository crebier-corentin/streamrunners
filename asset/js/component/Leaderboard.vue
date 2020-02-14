<template>

    <div class="table-responsive">
        <table class="table table-bordered table-striped">
            <thead>
            <tr>
                <th scope="col" v-text="cHeading1"></th>
                <th scope="col" v-text="cHeading2">First</th>
            </tr>
            </thead>
            <tbody>

            <tr v-for="d in cData">
                <td><a :href="'https://www.twitch.tv/' + d.username" target="_blank" v-text="d.displayName"></a></td>
                <td v-text="d[cFieldName]"></td>
            </tr>

            </tbody>
        </table>
    </div>

</template>

<script lang="ts">
    export default {
        name: "Leaderboard",

        props: {
            heading1: {type: String, required: true},
            heading2: {type: String, required: true},

            fieldName: {type: String, required: true},

            data: {type: Array, required: true}


        },

        computed: {

            cHeading1() {
                return this.heading1;
            },

            cHeading2() {
                return this.heading2;
            },

            cFieldName() {
                return this.fieldName;
            },

            cData() {
                return this.data;
            }
        }
    };
</script>

<style scoped>

</style>
