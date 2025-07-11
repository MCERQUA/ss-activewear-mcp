# Orders API - DELETE

Cancel orders that have not yet shipped.

## Resource URL

```
DELETE https://api-ca.ssactivewear.com/v2/orders/{orderNumber}
```

## Request Options

| Option | Endpoint | Description |
|--------|----------|-------------|
| **Cancel by Order Number** | `/v2/orders/{orderNumber}` | Cancel order by order number |
| **Cancel by GUID** | `/v2/orders/{guid}` | Cancel order by GUID |
| **Cancel by PO Number** | `/v2/orders/{poNumber}` | Cancel order by PO number |

## Response Format

Successful cancellation:

```json
{
  "success": true,
  "orderNumber": "4629304",
  "status": "Canceled",
  "message": "Order canceled successfully"
}
```

Error response:

```json
{
  "success": false,
  "error": "Order cannot be canceled",
  "details": "Order has already shipped and cannot be canceled"
}
```

## Cancellation Rules

- Orders can only be canceled if they have not shipped
- Orders in "InProgress" status can typically be canceled
- Orders with status "Shipped", "Completed", or already "Canceled" cannot be canceled
- Partial cancellations are not supported - entire order must be canceled

## Usage Examples

### Cancel order by order number
```bash
curl -X DELETE "https://api-ca.ssactivewear.com/v2/orders/4629304" \
  -u "account_number:api_key"
```

### Cancel order by PO number
```bash
curl -X DELETE "https://api-ca.ssactivewear.com/v2/orders/PO-2024-001" \
  -u "account_number:api_key"
```

## Important Notes

- Cancellation requests are processed immediately
- Once an order ships, it cannot be canceled (use Returns API instead)
- Canceled orders may still appear in order history with "Canceled" status
- Any payments made will be processed for refund according to your payment terms
