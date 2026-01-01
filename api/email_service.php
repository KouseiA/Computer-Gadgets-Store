<?php

function sendOrderReceipt($orderData, $orderItems)
{
    $debugLog = "Function called at " . date('Y-m-d H:i:s') . "\n";

    // -------------------------------------------------------------------------
    // IMPORTANT: Replace 'YOUR_BREVO_API_KEY' with your actual Brevo API Key
    // You can get one at https://app.brevo.com/settings/keys/api
    // -------------------------------------------------------------------------
    $apiKey = 'YOUR_BREVO_API_KEY'; // Replace with your actual API key


    $url = 'https://api.brevo.com/v3/smtp/email';

    // Calculate shipping fee display
    $shippingFee = isset($orderData['shipping_fee']) ? number_format($orderData['shipping_fee'], 2) : '0.00';
    $courier = isset($orderData['courier']) ? $orderData['courier'] : 'Standard';

    // Build the Items HTML Table
    $itemsHtml = '';
    foreach ($orderItems as $item) {
        $price = number_format($item['price'], 2);
        $subtotal = number_format($item['subtotal'], 2);
        $itemsHtml .= "
        <tr>
            <td style='padding: 8px; border-bottom: 1px solid #ddd;'>{$item['product_name']}</td>
            <td style='padding: 8px; border-bottom: 1px solid #ddd; text-align: center;'>{$item['quantity']}</td>
            <td style='padding: 8px; border-bottom: 1px solid #ddd; text-align: right;'>₱{$price}</td>
            <td style='padding: 8px; border-bottom: 1px solid #ddd; text-align: right;'>₱{$subtotal}</td>
        </tr>";
    }

    // Email Body (Inline CSS for compatibility)
    $htmlContent = "
    <html>
    <body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>
        <div style='max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px;'>
            <h2 style='color: #0d6efd;'>Thank you for your order!</h2>
            <p>Hi {$orderData['first_name']},</p>
            <p>We received your order and are processing it. Here are the details:</p>
            
            <h3 style='background: #f8f9fa; padding: 10px;'>Order Summary</h3>
            <table style='width: 100%; border-collapse: collapse;'>
                <thead>
                    <tr style='background: #eee;'>
                        <th style='padding: 8px; text-align: left;'>Product</th>
                        <th style='padding: 8px; text-align: center;'>Qty</th>
                        <th style='padding: 8px; text-align: right;'>Price</th>
                        <th style='padding: 8px; text-align: right;'>Total</th>
                    </tr>
                </thead>
                <tbody>
                    {$itemsHtml}
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan='3' style='padding: 8px; text-align: right; font-weight: bold;'>Shipping ({$courier}):</td>
                        <td style='padding: 8px; text-align: right;'>₱{$shippingFee}</td>
                    </tr>
                    <tr>
                        <td colspan='3' style='padding: 8px; text-align: right; font-weight: bold; font-size: 1.1em;'>Grand Total:</td>
                        <td style='padding: 8px; text-align: right; font-weight: bold; font-size: 1.1em; color: #0d6efd;'>₱" . number_format($orderData['total'], 2) . "</td>
                    </tr>
                </tfoot>
            </table>

            <div style='margin-top: 20px;'>
                <p><strong>Shipping Address:</strong><br>
                {$orderData['address']}<br>
                {$orderData['city']}, {$orderData['province']} {$orderData['zip']}</p>
                
                <p><strong>Payment Method:</strong> " . strtoupper($orderData['payment_method']) . "</p>
            </div>

            <hr style='border: none; border-top: 1px solid #eee; margin: 20px 0;'>
            
            <p style='font-size: 0.9em; color: #777;'>
                If you have any questions, please reply to this email or visit our support page.<br>
                <br>
                Best regards,<br>
                <strong>AULA Webstore Team</strong>
            </p>
        </div>
    </body>
    </html>
    ";

    // API Payload
    $data = [
        'sender' => [
            'name' => 'AULA Webstore',
            'email' => 'vienmabeecamachovmc2004@gmail.com'
        ],
        'to' => [
            [
                'email' => $orderData['email'],
                'name' => $orderData['first_name'] . ' ' . $orderData['last_name']
            ]
        ],
        'subject' => 'Order Confirmation - AULA Webstore',
        'htmlContent' => $htmlContent
    ];

    // Initialize cURL
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'accept: application/json',
        'api-key: ' . $apiKey,
        'content-type: application/json'
    ]);
    // FIX for XAMPP SSL issues
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);

    // Execute
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);

    curl_close($ch);

    // Capture Log
    $debugLog .= "Status: $httpCode\n";
    $debugLog .= "Response: $response\n";
    if ($curlError)
        $debugLog .= "Curl Error: $curlError\n";

    // Check strict success status
    $success = ($httpCode >= 200 && $httpCode < 300);

    return ['success' => $success, 'log' => $debugLog];
}
?>