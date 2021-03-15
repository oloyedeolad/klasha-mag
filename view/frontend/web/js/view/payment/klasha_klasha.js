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
                type: 'klasha_klasha',
                component: 'Klasha_Klasha/js/view/payment/method-renderer/klasha_klasha'
            }
        );
        /** Add view logic here if needed */
        return Component.extend({});
    }
);
