# Cross Reference API - GET

Retrieve cross-reference mappings between your SKUs and S&S Activewear SKUs.

## Resource URL

```
GET https://api-ca.ssactivewear.com/v2/crossref/
```

## Request Options

| Option | Endpoint | Description |
|--------|----------|-------------|
| **Get All** | `/v2/crossref/` | Returns all cross-reference mappings |
| **Filter by Your SKU** | `/v2/crossref/{yourSku}` | Returns mapping for your SKU |
| **Filter by S&S SKU** | `/v2/crossref/?sku={ssSku}` | Returns mapping for S&S SKU |
| **Response Format** | `/v2/crossref/?mediatype={mediatype}` | Determines response type<br><br>`{mediatype}` = json or xml (Default=json) |

## Example Response

```json
[
  {
    "yourSku": "SHIRT-RED-M",
    "ssSku": "0076000004M",
    "gtin": "00821780008137",
    "brandName": "Gildan",
    "styleName": "2000",
    "colorName": "Red",
    "sizeName": "Medium",
    "active": true
  }
]
```

## Cross Reference Object Definition

| Field | Type | Description |
|-------|------|-------------|
| `yourSku` | String | Your internal SKU identifier |
| `ssSku` | String | S&S Activewear SKU |
| `gtin` | String | Global Trade Item Number |
| `brandName` | String | Product brand name |
| `styleName` | String | Product style name |
| `colorName` | String | Product color |
| `sizeName` | String | Product size |
| `active` | Boolean | Whether mapping is active |

## Usage Examples

### Get all cross references
```bash
curl -X GET "https://api-ca.ssactivewear.com/v2/crossref/" \
  -u "account_number:api_key"
```

### Get specific cross reference
```bash
curl -X GET "https://api-ca.ssactivewear.com/v2/crossref/SHIRT-RED-M" \
  -u "account_number:api_key"
```
