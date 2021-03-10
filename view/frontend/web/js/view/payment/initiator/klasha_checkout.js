define(
    [
        'uiComponent',
        'Magento_Checkout/js/model/payment/renderer-list'
    ],
    function (
        Component,
        rendererList
    ) {
        'use strict';
        rendererList.push(
            {
                type: 'klasha_checkout',
                component: 'Klasha_Klasha/js/view/payment/initiator/gladepay_checkout'
            }
        );
        /** Add view logic here if needed */
        return Component.extend({});
    }
);
