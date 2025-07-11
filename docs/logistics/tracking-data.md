# Tracking Data API

Retrieve package tracking information for shipped orders.

## Resource URL

```
GET https://api-ca.ssactivewear.com/v2/tracking/
```

## Request Options

| Option | Endpoint | Description |
|--------|----------|-------------|
| **Get by Tracking Number** | `/v2/tracking/{trackingNumber}` | Returns tracking data for specific tracking number |
| **Get by Order Number** | `/v2/tracking/?ordernumber={orderNumber}` | Returns tracking data for order |
| **Get by Invoice Number** | `/v2/tracking/?invoicenumber={invoiceNumber}` | Returns tracking data for invoice |
| **Response Format** | `/v2/tracking/?mediatype={mediatype}` | Determines response type<br><br>`{mediatype}` = json or xml (Default=json) |

## Example Response

```json
[
  {
    "trackingNumber": "1ZE9W0610315091599",
    "carrier": "UPS",
    "service": "Ground",
    "orderNumber": "4629304",
    "invoiceNumber": "907070",
    "shipDate": "2024-01-15T14:15:00",
    "estimatedDelivery": "2024-01-18T17:00:00",
    "actualDelivery": "2024-01-18T15:30:00",
    "status": "Delivered",
    "events": [
      {
        "date": "2024-01-18T15:30:00",
        "status": "Delivered",
        "location": "Toronto, ON",
        "description": "Package delivered to recipient"
      },
      {
        "date": "2024-01-18T09:15:00",
        "status": "Out for Delivery",
        "location": "Toronto, ON",
        "description": "Package out for delivery"
      },
      {
        "date": "2024-01-17T18:45:00",
        "status": "In Transit",
        "location": "Mississauga, ON",
        "description": "Package arrived at facility"
      }
    ]
  }
]
```

## Tracking Object Definition

| Field | Type | Description |
|-------|------|-------------|
| `trackingNumber` | String | Carrier tracking number |
| `carrier` | String | Shipping carrier |
| `service` | String | Shipping service level |
| `orderNumber` | String | Associated order number |
| `invoiceNumber` | String | Associated invoice number |
| `shipDate` | DateTime | Date package was shipped |
| `estimatedDelivery` | DateTime | Estimated delivery date/time |
| `actualDelivery` | DateTime | Actual delivery date/time (when delivered) |
| `status` | String | Current tracking status |
| `events` | Array | Tracking event history |

## Tracking Event Object

| Field | Type | Description |
|-------|------|-------------|
| `date` | DateTime | Event date and time |
| `status` | String | Event status |
| `location` | String | Event location |
| `description` | String | Event description |

## Tracking Status Values

- **Label Created**: Shipping label created
- **Picked Up**: Package picked up by carrier
- **In Transit**: Package in transit
- **Out for Delivery**: Package out for delivery
- **Delivered**: Package delivered
- **Exception**: Delivery exception occurred
- **Returned**: Package returned to sender

## Usage Examples

### Get tracking by tracking number
```bash
curl -X GET "https://api-ca.ssactivewear.com/v2/tracking/1ZE9W0610315091599" \
  -u "account_number:api_key"
```

### Get tracking by order number
```bash
curl -X GET "https://api-ca.ssactivewear.com/v2/tracking/?ordernumber=4629304" \
  -u "account_number:api_key"
```

## Important Notes

- Tracking data is updated periodically from carriers
- Some carriers may have delays in updating tracking information
- Delivery times are estimates and subject to carrier performance
- Multiple packages may be associated with a single order
