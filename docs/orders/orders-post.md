# Orders API - POST

Create new orders using the S&S Activewear API.

## Resource URL

```
POST https://api-ca.ssactivewear.com/v2/orders/
```

## Request Format

Orders must be submitted as JSON with the following structure:

```json
{
  "customerNumber": "12345",
  "poNumber": "PO-2024-001",
  "shippingMethod": "Ground",
  "shippingAddress": {
    "customer": "Customer Name",
    "attn": "Contact Person",
    "address": "123 Main St",
    "city": "Toronto",
    "state": "ON",
    "zip": "M5V 3A8",
    "country": "CA"
  },
  "lines": [
    {
      "sku": "0076000001S",
      "quantity": 12,
      "price": 4.50
    }
  ]
}
```

## Order Object Definition

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `customerNumber` | String | Yes | Your customer account number |
| `poNumber` | String | No | Purchase order number |
| `shippingMethod` | String | Yes | Shipping method (Ground, 2-Day, Next Day, etc.) |
| `shippingAddress` | Object | Yes | Shipping address information |
| `billingAddress` | Object | No | Billing address (defaults to shipping address) |
| `lines` | Array | Yes | Array of order line items |
| `specialInstructions` | String | No | Special shipping or handling instructions |

## Shipping Address Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `customer` | String | Yes | Customer/company name |
| `attn` | String | No | Attention line |
| `address` | String | Yes | Street address |
| `city` | String | Yes | City |
| `state` | String | Yes | Province/state code |
| `zip` | String | Yes | Postal/zip code |
| `country` | String | No | Country code (defaults to CA) |

## Line Item Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `sku` | String | Yes | Product SKU |
| `quantity` | Integer | Yes | Quantity to order |
| `price` | Decimal | No | Unit price (uses current pricing if not specified) |
| `yourSku` | String | No | Your internal SKU reference |

## Response Format

Successful order creation returns:

```json
{
  "success": true,
  "orderNumber": "4629305",
  "guid": "e66b7667-868f-4ae0-b605-2f45fbd288c1",
  "total": 144.38,
  "message": "Order created successfully"
}
```

## Error Response

```json
{
  "success": false,
  "error": "Invalid SKU: 0076000001X",
  "details": "The specified SKU is not available or does not exist"
}
```

## Usage Examples

### Create basic order
```bash
curl -X POST "https://api-ca.ssactivewear.com/v2/orders/" \
  -u "account_number:api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "customerNumber": "12345",
    "poNumber": "PO-2024-001",
    "shippingMethod": "Ground",
    "shippingAddress": {
      "customer": "ABC Company",
      "address": "123 Main St",
      "city": "Toronto",
      "state": "ON",
      "zip": "M5V 3A8"
    },
    "lines": [
      {
        "sku": "0076000001S",
        "quantity": 12
      }
    ]
  }'
```

## Important Notes

- All orders are subject to inventory availability
- Pricing is determined at time of order placement
- Invalid SKUs will cause the entire order to be rejected
- Minimum order quantities may apply for certain products
- Canadian taxes will be calculated automatically where applicable
