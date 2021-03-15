/*browser:true*/
/*global define*/
define([
    "jquery",
    "Magento_Checkout/js/view/payment/default",
    "Magento_Checkout/js/action/place-order",
    "Magento_Checkout/js/model/payment/additional-validators",
    "Magento_Checkout/js/model/quote",
    "Magento_Checkout/js/model/full-screen-loader",
    "Magento_Checkout/js/action/redirect-on-success",
    "mage/url"
], function(
    $,
    Component,
    placeOrderAction,
    additionalValidators,
    quote,
    fullScreenLoader,
    redirectOnSuccessAction,
    url
) {
    "use strict";

    return Component.extend({
        defaults: {
            template: "Klasha_Klasha/payment/form",
            customObserverName: null
        },

        redirectAfterPlaceOrder: false,

        initialize: function() {
            this._super();

            var tempCheckoutConfig = window.checkoutConfig;
            var localGladepayConfiguration =
                tempCheckoutConfig.payment.klasha_checkout;

            // Add Gladepay Gateway script to head
            if (localGladepayConfiguration.mode == "live") {
                $("head").append(
                    '<script type="text/javascript" src="https://klastatic.fra1.cdn.digitaloceanspaces.com/prod/js/klasha-integration.js"></script>'
                );
            } else {
                $("head").append(
                    '<script type="text/javascript" src="https://klastatic.fra1.cdn.digitaloceanspaces.com/test/js/klasha-integration.js"></script>'
                );
            }

            return this;
        },

        getCode: function() {
            return "klasha_klasha";
        },

        getData: function() {
            return {
                method: this.item.method,
                additional_data: {}
            };
        },

        isActive: function() {
            return true;
        },

        /**
         * @override
         */
        afterPlaceOrder: function() {
            var checkoutConfig = window.checkoutConfig;
            var paymentData = quote.billingAddress();
            var configuration = checkoutConfig.payment.klasha_checkout;
            console.log(configuration);
            if (checkoutConfig.isCustomerLoggedIn) {
                var customerData = checkoutConfig.customerData;
                paymentData.email = customerData.email;
            } else {
                var storageData = JSON.parse(
                    localStorage.getItem("mage-cache-storage")
                )["checkout-data"];
                paymentData.email = storageData.validatedEmailValue;
            }

            var quoteId = checkoutConfig.quoteItemData[0].quote_id;

            var _this = this;
            _this.isPlaceOrderActionAllowed(false);


            initPayment({
                MID: configuration.MID,
                email: paymentData.email,
                firstname: paymentData.firstname,
                lastname: paymentData.lastname,
                description: "",
                title: "Payment for item(s) Ordered",
                amount: quote.totals().grand_total,
                phone: paymentData.telephone,
                country: "NG",
                currency: "NGN",
                onclose: function() {},
                callback: function(response) {
                    //redirect users to the checkout page and handle the delivery from there
                    $.ajax({
                        method: "GET",
                        url: configuration.api_url +
                            "V1/gladepaycheckout/verify/" +
                            response.txnRef +
                            "_-~-_" +
                            quoteId
                    }).success(function(data) {
                        data = JSON.parse(data);

                        if (data.status) {
                            // redirect to success page after
                            redirectOnSuccessAction.execute();
                            return;
                        }

                        _this.isPlaceOrderActionAllowed(true);
                        _this.messageContainer.addErrorMessage({
                            message: data.message === null ? "Error, please try again" : data.message
                        });

                        //redirect for failed transctions
                        fullScreenLoader.startLoader();
                        window.location.replace(url.build(configuration.failed_page_url));

                        return _this;
                    }).error(function() {
                        if (response.status == 200 && response.txnStatus == 'successful') {
                            redirectOnSuccessAction.execute();
                            return;
                        } else {
                            _this.isPlaceOrderActionAllowed(true);
                            _this.messageContainer.addErrorMessage({
                                message: response.message === null ? "Error, please try again" : data.message
                            });

                            //redirect for failed transctions
                            fullScreenLoader.startLoader();
                            window.location.replace(url.build(configuration.failed_page_url));
                        }
                    });
                }
            });
        }
    });
});