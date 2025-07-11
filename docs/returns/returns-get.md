# Returns API - GET

Retrieve information about product returns.

## Resource URL

```
GET https://api-ca.ssactivewear.com/v2/returns/
```

## Request Options

| Option | Endpoint | Description |
|--------|----------|-------------|
| **Get All** | `/v2/returns/` | Returns all recent returns |
| **Filter by Return Number** | `/v2/returns/{returnNumber}` | Returns specific return information |
| **Filter by Order** | `/v2/returns/?ordernumber={orderNumber}` | Returns for specific order |
| **Filter by Date** | `/v2/returns/?returndate={date}` | Returns by return date |
| **Date Range** | `/v2/returns/?startdate={start}&enddate={end}` | Returns within date range |
| **Response Format** | `/v2/returns/?mediatype={mediatype}` | Determines response type<br><br>`{mediatype}` = json or xml (Default=json) |

## Example Response

```json
[
  {
    "returnNumber": "R123456",
    "orderNumber": "4629304",
    "returnDate": "2024-01-15T10:30:00",
    "status": "Approved",
    "reason": "Defective",
    "totalCredit": 45.50,
    "items": [
      {
        "sku": "0076000001S",
        "quantity": 2,
        "reason": "Defective",
        "creditAmount": 45.50
      }
    ]
  }
]
```

## Return Object Definition

| Field | Type | Description |
|-------|------|-------------|
| `returnNumber` | String | Unique return identifier |
| `orderNumber` | String | Original order number |
| `returnDate` | DateTime | Date return was initiated |
| `status` | String | Return status |
| `reason` | String | Return reason |
| `totalCredit` | Decimal | Total credit amount |
| `items` | Array | Returned items details |

## Return Status Values

- **Pending**: Return request submitted, awaiting approval
- **Approved**: Return approved, awaiting receipt
- **Received**: Items received and processed
- **Completed**: Return fully processed and credited
- **Rejected**: Return request rejected

## Usage Examples

### Get all returns
```bash
curl -X GET "https://api-ca.ssactivewear.com/v2/returns/" \
  -u "account_number:api_key"
```

### Get specific return
```bash
curl -X GET "https://api-ca.ssactivewear.com/v2/returns/R123456" \
  -u "account_number:api_key"
```
