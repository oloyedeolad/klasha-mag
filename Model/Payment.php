<?php


namespace Klasha\Klasha\Model;


use Klasha\Klasha\Api\PaymentInterface;
use Magento\Framework\Event\Manager;
use mysql_xdevapi\Exception;
use Magento\Payment\Helper\Data as PaymentHelper;

class Payment implements PaymentInterface
{
    const CODE = 'klasha_klasha';

    protected $config;

    protected $klashapay;
    protected $client_key;
    protected $client_secret;

    protected $endpoint = "https://ktests.com/pay";

    /**
     * @var EventManager
     */
    private $eventManager;

    public function __construct(
        PaymentHelper $paymentHelper,
        Manager $eventManager
    ) {
        $this->eventManager = $eventManager;
        $this->config = $paymentHelper->getMethodInstance(self::CODE);

        $this->client_mid = $this->config->getConfigData('live_secret_key');
        $this->client_key = $this->config->getConfigData('live_public_key');
        $base_url = "https://gate.klasapps.com";

        if ($this->config->getConfigData('go_live')) {
            $this->endpoint = "https://gate.klasapps.com/pay";
        }
    }

    public function verifyPayment($reference)
    {
        // TODO: Implement verifyPayment() method.

        $ref = explode('_-~-_', $reference);
        $txnRef = $ref[0];
        $quoteId = $ref[1];

        try {

            $data = [
                'action' => 'verify',
                'txnRef' => $txnRef
            ];

            $curl = curl_init();
            //call the requery instanly to confirm that the transaction was successful
            curl_setopt_array($curl, array(
                CURLOPT_URL => $this->endpoint,
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_TIMEOUT => 300,
                CURLOPT_ENCODING => "",
                CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
                CURLOPT_CUSTOMREQUEST => "PUT",
                CURLOPT_POSTFIELDS => json_encode($data),
                CURLOPT_HTTPHEADER => array(
                    "cache-control: no-cache",
                    "content-type: application/json",
                    "key: {$this->client_key}",
                    "mid: {$this->client_mid}",
                ),
            ));

            $response = curl_exec($curl);
            $err = curl_error($curl);

            curl_close($curl);

            // decode json

            if ($err) {
                //$query = "Error #:" . $err;
                return json_encode([
                    'status' => false,
                    'message' => ($query['message'] != null) ? "Error #:" . $err : "Transaction Failed"
                ]);
            } else {
                $query = json_decode($response, true);
            }

            if ($query['txnStatus'] == 'successful') {
                //dispatch the `payment_verify_after` event to update the order status
                $this->eventManager->dispatch('gp_payment_verify_after');

                return json_encode([
                    'status' => true,
                    'message' => "Transaction Approved"
                ]);
            } else {
                return json_encode([
                    'status' => false,
                    'message' => ($query['message'] != null) ? $query['message'] : "Transaction Failed"
                ]);
            }
        }catch (Exception $exception) {

            return json_encode([
                'status' => false,
                'message' => $exception->getMessage()
            ]);
        }
    }
}