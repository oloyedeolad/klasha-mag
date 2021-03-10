<?php

namespace Klasha\Klasha\Model\Ui;

use Magento\Checkout\Model\ConfigProviderInterface;
use Magento\Payment\Helper\Data as PaymentHelper;
use Magento\Store\Model\Store as Store;

/**
 * Class ConfigProvider
 */
final class ConfigProvider implements ConfigProviderInterface
{
    const CODE = 'klasha_checkout';

    protected $method;

    public function __construct(PaymentHelper $paymentHelper, Store $store)
    {
        $this->method = $paymentHelper->getMethodInstance(self::CODE);
        $this->store = $store;
    }

    /**
     * Retrieve assoc array of checkout configuration
     *
     * @return array
     */
    public function getConfig()
    {
        $endpoint = "https://klastatic.fra1.cdn.digitaloceanspaces.com/test/js/klasha-integration.js";
        $server_mode = "demo";

        if ($this->method->getConfigData('go_live')) {
            $endpoint = "https://klastatic.fra1.cdn.digitaloceanspaces.com/prod/js/klasha-integration.js";
            $server_mode = "live";
        }

        return [
            'payment' => [
                self::CODE => [
                    'MID' => $this->method->getConfigData('client_mid'),
                    'endpoint' => $endpoint,
                    'failed_page_url' => $this->store->getBaseUrl() . 'checkout/onepage/failure',
                    'api_url' => $this->store->getBaseUrl() . 'rest/',
                    'mode' => $server_mode
                ]
            ]
        ];
    }
}
