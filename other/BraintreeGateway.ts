const braintree = require("braintree");

export let gateway = braintree.connect({
    environment: process.env.BRAINTREE_SANDBOX ? braintree.Environment.Sandbox : braintree.Environment.Production,
    merchantId: process.env.BRAINTREE_MERCHANT_ID,
    publicKey: process.env.BRAINTREE_PUBLIC_KEY,
    privateKey: process.env.BRAINTREE_PRIVATE_KEY
});
