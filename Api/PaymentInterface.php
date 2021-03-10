<?php


namespace Klasha\Klasha\Api;


interface PaymentInterface
{
    /**
     * @param string $reference
     * @return bool
     */
    public function verifyPayment(
        $reference
    );
}