<template>
    <div>
        <!-- Products -->
        <div class="grid-container">

            <div class="card m-2" v-for="product in products">
                <div class="card-body text-center">

                    <img v-if="product.image !== '' && product.image != null"
                         class="card-img-top"
                         :src=" product.image "
                         :alt=" product.displayName ">

                    <h5 class="card-title">{{ product.displayName }}</h5>
                    <p class="card-text">{{ product.description }}</p>
                    <p class="card-text">
                        {{ product.amount }}€ </p>
                    <button class="btn btn-primary" @click="addToCart(product.name)">Ajouter au Panier</button>
                </div>
            </div>


        </div>

        <!-- Cart -->
        <h3>Panier</h3>


        <template v-if="cart.length > 0">
            <ul class="list-group">
                <li v-for="(c, index) in cart"
                    :key="index"
                    class="list-group-item d-flex justify-content-between align-items-center">
                    <span>{{c.displayName}} : {{c.amount}}€</span>
                    <button class=" btn btn-danger" @click="removeFromCart(index)"><i class="fas fa-times-circle"></i>
                    </button>
                </li>
            </ul>
            Total : {{total}}€
        </template>
        <p v-else>Votre panier est vide</p>


    </div>
</template>

<script lang="ts">
    import Vue from "vue";

    export default {
        name: "Shop",

        data() {
            return {
                products: window['products'],
                cart: []
            }
        },

        methods: {
            getProduct(name: string) {
                for (const product of this.products) {
                    if (product.name === name) {
                        return product;
                    }
                }

            },

            addToCart(name: string) {
                this.cart.push(this.getProduct(name));
            },

            removeFromCart(index: Number) {
                this.cart.splice(index, 1);
            }
        },

        computed: {
            total(): string {
                let total = 0;
                for (const c of this.cart) {
                    total += Number(c.amount);
                }

                return total.toFixed(2);

            }
        },
    }
</script>

<style scoped>

</style>