# Days In Transit API

Retrieve estimated shipping transit times to various destinations.

## Resource URL

```
GET https://api-ca.ssactivewear.com/v2/daysintransit/
```

## Request Options

| Option | Endpoint | Description |
|--------|----------|-------------|
| **Get All** | `/v2/daysintransit/` | Returns transit times for all destinations |
| **Filter by Postal Code** | `/v2/daysintransit/{postalCode}` | Returns transit time for specific postal code |
| **Filter by Province** | `/v2/daysintransit/?province={province}` | Returns transit times for province |
| **Filter by Warehouse** | `/v2/daysintransit/?warehouse={warehouse}` | Returns transit times from specific warehouse |
| **Response Format** | `/v2/daysintransit/?mediatype={mediatype}` | Determines response type<br><br>`{mediatype}` = json or xml (Default=json) |

## Example Response

```json
[
  {
    "postalCode": "M5V",
    "province": "ON",
    "warehouse": "BC",
    "groundDays": 3,
    "expressDays": 2,
    "priorityDays": 1,
    "carrier": "UPS"
  },
  {
    "postalCode": "M5V",
    "province": "ON",
    "warehouse": "ON",
    "groundDays": 1,
    "expressDays": 1,
    "priorityDays": 1,
    "carrier": "UPS"
  }
]
```

## Days In Transit Object Definition

| Field | Type | Description |
|-------|------|-------------|
| `postalCode` | String | Canadian postal code prefix (first 3 characters) |
| `province` | String | Province code |
| `warehouse` | String | Shipping warehouse code |
| `groundDays` | Integer | Ground shipping transit days |
| `expressDays` | Integer | Express shipping transit days |
| `priorityDays` | Integer | Priority shipping transit days |
| `carrier` | String | Shipping carrier |

## Canadian Warehouses

- **BC**: British Columbia warehouse
- **ON**: Ontario warehouse

## Province Codes

- **AB**: Alberta
- **BC**: British Columbia
- **MB**: Manitoba
- **NB**: New Brunswick
- **NL**: Newfoundland and Labrador
- **NS**: Nova Scotia
- **NT**: Northwest Territories
- **NU**: Nunavut
- **ON**: Ontario
- **PE**: Prince Edward Island
- **QC**: Quebec
- **SK**: Saskatchewan
- **YT**: Yukon

## Usage Examples

### Get all transit times
```bash
curl -X GET "https://api-ca.ssactivewear.com/v2/daysintransit/" \
  -u "account_number:api_key"
```

### Get transit time for specific postal code
```bash
curl -X GET "https://api-ca.ssactivewear.com/v2/daysintransit/M5V" \
  -u "account_number:api_key"
```

### Get transit times for Ontario
```bash
curl -X GET "https://api-ca.ssactivewear.com/v2/daysintransit/?province=ON" \
  -u "account_number:api_key"
```

## Important Notes

- Transit times are business days only
- Times are estimates and may vary based on carrier performance
- Weather and other factors may affect actual delivery times
- Use closest warehouse for optimal shipping costs and times
