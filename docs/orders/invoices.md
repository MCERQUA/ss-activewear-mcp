# Invoices API

Retrieve invoice information for your orders.

## Resource URL

```
GET https://api-ca.ssactivewear.com/v2/invoices/
```

## Request Options

| Option | Endpoint | Description |
|--------|----------|-------------|
| **Get All Recent** | `/v2/invoices/` | Returns recent invoices (last 30 days) |
| **Filter by Invoice Number** | `/v2/invoices/{invoiceNumber}` | Returns specific invoice |
| **Filter by Date** | `/v2/invoices/?invoicedate={date}` | Returns invoices for specific date |
| **Date Range** | `/v2/invoices/?startdate={start}&enddate={end}` | Returns invoices within date range |
| **Filter by Order** | `/v2/invoices/?ordernumber={orderNumber}` | Returns invoice for specific order |
| **Response Format** | `/v2/invoices/?mediatype={mediatype}` | Determines response type<br><br>`{mediatype}` = json or xml (Default=json) |

## Example Response

```json
[
  {
    "invoiceNumber": "907070",
    "orderNumber": "4629304",
    "invoiceDate": "2014-06-18T00:00:00",
    "dueDate": "2014-07-18T00:00:00",
    "subtotal": 144.38,
    "tax": 18.77,
    "shipping": 8.50,
    "total": 171.65,
    "balance": 0.00,
    "status": "Paid",
    "paymentTerms": "Net 30",
    "customerNumber": "12345",
    "poNumber": "PO-2024-001"
  }
]
```

## Invoice Object Definition

| Field | Type | Description |
|-------|------|-------------|
| `invoiceNumber` | String | Unique invoice number |
| `orderNumber` | String | Associated order number |
| `invoiceDate` | DateTime | Date invoice was generated |
| `dueDate` | DateTime | Payment due date |
| `subtotal` | Decimal | Merchandise subtotal |
| `tax` | Decimal | Tax amount |
| `shipping` | Decimal | Shipping charges |
| `total` | Decimal | Total invoice amount |
| `balance` | Decimal | Outstanding balance |
| `status` | String | Invoice status (Open, Paid, Overdue, etc.) |
| `paymentTerms` | String | Payment terms |
| `customerNumber` | String | Customer account number |
| `poNumber` | String | Purchase order number |

## Invoice Status Values

- **Open**: Invoice is open and unpaid
- **Paid**: Invoice has been paid in full
- **Partial**: Invoice is partially paid
- **Overdue**: Invoice is past due date
- **Void**: Invoice has been voided

## Usage Examples

### Get recent invoices
```bash
curl -X GET "https://api-ca.ssactivewear.com/v2/invoices/" \
  -u "account_number:api_key"
```

### Get specific invoice
```bash
curl -X GET "https://api-ca.ssactivewear.com/v2/invoices/907070" \
  -u "account_number:api_key"
```

### Get invoices for date range
```bash
curl -X GET "https://api-ca.ssactivewear.com/v2/invoices/?startdate=2024-01-01&enddate=2024-01-31" \
  -u "account_number:api_key"
```

## Important Notes

- Invoices are generated automatically when orders ship
- Payment terms are based on your account setup
- Balance reflects payments received as of last update
- Canadian taxes are included where applicable
