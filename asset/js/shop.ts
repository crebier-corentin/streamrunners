const braintree = window['braintree'];
const paypal = window['paypal'];

(async () => {

    braintree.client.create({
        authorization: window['clientToken']
    }, function (clientErr, clientInstance) {

        // Stop if there was a problem creating the client.
        // This could happen if there is a network error or if the authorization
        // is invalid.
        if (clientErr) {
            console.error('Error creating client:', clientErr);
            return;
        }

        // Create a PayPal Checkout component.
        braintree.paypalCheckout.create({
            client: clientInstance,
            env: window['sandbox'] ? 'sandbox' : 'production'
        }, function (paypalCheckoutErr, paypalCheckoutInstance) {

            // Stop if there was a problem creating PayPal Checkout.
            // This could happen if there was a network error or if it's incorrectly
            // configured.
            if (paypalCheckoutErr) {
                console.error('Error creating PayPal Checkout:', paypalCheckoutErr);
                return;
            }

            // Set up PayPal with the checkout.js library
            paypal.Button.render({
                env: window['sandbox'] ? 'sandbox' : 'production', // or 'sandbox'

                payment: function () {
                    return paypalCheckoutInstance.createPayment({
                        // Your PayPal options here. For available options, see
                        // http://braintree.github.io/braintree-web/current/PayPalCheckout.html#createPayment
                    });
                },

                onAuthorize: function (data, actions) {
                    return paypalCheckoutInstance.tokenizePayment(data, function (err, payload) {
                        // Submit `payload.nonce` to your server.
                    });
                },

                onCancel: function (data) {
                    console.log('checkout.js payment cancelled', JSON.stringify(data, [0], 2));
                },

                onError: function (err) {
                    console.error('checkout.js error', err);
                }
            }, '#paypal-button').then(function () {
                // The PayPal button will be rendered in an html element with the id
                // `paypal-button`. This function will be called when the PayPal button
                // is set up and ready to be used.
            });

        });

    });
})
();
