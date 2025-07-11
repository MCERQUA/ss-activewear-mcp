# Returns API - POST

Create return requests for eligible products.

## Resource URL

```
POST https://api-ca.ssactivewear.com/v2/returns/
```

## Request Format

```json
{
  "orderNumber": "4629304",
  "reason": "Defective",
  "items": [
    {
      "sku": "0076000001S",
      "quantity": 2,
      "reason": "Defective product"
    }
  ]
}
```

## Return Request Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `orderNumber` | String | Yes | Original order number |
| `reason` | String | Yes | Primary return reason |
| `items` | Array | Yes | Items being returned |
| `comments` | String | No | Additional comments |

## Return Item Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `sku` | String | Yes | Product SKU being returned |
| `quantity` | Integer | Yes | Quantity to return |
| `reason` | String | Yes | Specific reason for this item |

## Return Reasons

- **Defective**: Product defects or quality issues
- **Wrong Item**: Incorrect item shipped
- **Wrong Size**: Incorrect size shipped
- **Overshipment**: More items shipped than ordered
- **Damaged**: Items damaged in shipping
- **Customer Error**: Customer ordered wrong item

## Response Format

```json
{
  "success": true,
  "returnNumber": "R123456",
  "status": "Pending",
  "message": "Return request created successfully"
}
```

## Usage Examples

### Create return request
```bash
curl -X POST "https://api-ca.ssactivewear.com/v2/returns/" \
  -u "account_number:api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "orderNumber": "4629304",
    "reason": "Defective",
    "items": [
      {
        "sku": "0076000001S",
        "quantity": 2,
        "reason": "Defective stitching"
      }
    ]
  }'
```

## Important Notes

- Returns must be initiated within return policy timeframe
- Only eligible products can be returned
- Return approval is subject to inspection
- Credits are processed after items are received and inspected
