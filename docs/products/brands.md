# Brands API

The Brands API provides information about all available brands and their details.

## Resource URL

```
GET https://api-ca.ssactivewear.com/v2/brands/
```

## Request Options

| Option | Endpoint | Description |
|--------|----------|-------------|
| **Get All** | `/v2/brands/` | Returns all brands |
| **Filter by Brand** | `/v2/brands/{brand}` | Returns specific brand information<br><br>`{brand}` = comma separated list of brand identifiers |
| **Filter Fields** | `/v2/brands/?fields={fields}` | Returns only requested fields<br><br>`{fields}` = comma separated list of brand object fields |
| **Response Format** | `/v2/brands/?mediatype={mediatype}` | Determines response type<br><br>`{mediatype}` = json or xml (Default=json) |

## Example Request

```
GET https://api-ca.ssactivewear.com/v2/brands/
```

## Brand Object Definition

| Field | Type | Description |
|-------|------|-------------|
| `brandID` | Integer | Unique brand identifier |
| `brandName` | String | Brand name |
| `brandDescription` | String | Brand description |
| `brandLogo` | String | URL to brand logo image |
| `brandWebsite` | String | Brand's official website |
| `active` | Boolean | Whether brand is currently active |

## Usage Examples

### Get all brands
```bash
curl -X GET "https://api-ca.ssactivewear.com/v2/brands/" \
  -u "account_number:api_key"
```

### Get specific brand
```bash
curl -X GET "https://api-ca.ssactivewear.com/v2/brands/Gildan" \
  -u "account_number:api_key"
```

### Get brand names only
```bash
curl -X GET "https://api-ca.ssactivewear.com/v2/brands/?fields=brandName" \
  -u "account_number:api_key"
```
