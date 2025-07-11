# Products API

The Products API provides detailed product information including all available SKUs, colors, sizes, and variations for each style.

## Resource URL

```
GET https://api-ca.ssactivewear.com/v2/products/
```

## Request Options

| Option | Endpoint | Description |
|--------|----------|-------------|
| **Get All** | `/v2/products/` | Returns all products |
| **Filter by Style** | `/v2/products/{style}` | Returns products for specific styles<br><br>`{style}` = comma separated list of style identifiers |
| **Filter by SKU** | `/v2/products/?sku={sku}` | Returns specific product by SKU<br><br>`{sku}` = comma separated list of SKU numbers |
| **Filter Fields** | `/v2/products/?fields={fields}` | Returns only requested fields<br><br>`{fields}` = comma separated list of product object fields |
| **Response Format** | `/v2/products/?mediatype={mediatype}` | Determines response type<br><br>`{mediatype}` = json or xml (Default=json) |

## Example Request

```
GET https://api-ca.ssactivewear.com/v2/products/00760
```

## Product Object Definition

| Field | Type | Description |
|-------|------|-------------|
| `sku` | String | Unique product identifier |
| `styleID` | Integer | Style ID this product belongs to |
| `partNumber` | String | First 5 digits of SKU number |
| `brandName` | String | Brand that makes this product |
| `styleName` | String | Style name |
| `color` | String | Color name |
| `colorValue` | String | Hex color value |
| `size` | String | Size designation |
| `sizeIndex` | Integer | Numeric index for size ordering |
| `caseQuantity` | Integer | Quantity per case |
| `price` | Decimal | Product price |
| `priceTier2` | Decimal | Tier 2 pricing |
| `priceTier3` | Decimal | Tier 3 pricing |
| `priceTier4` | Decimal | Tier 4 pricing |
| `priceTier5` | Decimal | Tier 5 pricing |
| `active` | Boolean | Whether product is currently active |

## Usage Examples

### Get all products for a style
```bash
curl -X GET "https://api-ca.ssactivewear.com/v2/products/00760" \
  -u "account_number:api_key"
```

### Get specific SKU
```bash
curl -X GET "https://api-ca.ssactivewear.com/v2/products/?sku=0076000001S" \
  -u "account_number:api_key"
```

### Get products with pricing only
```bash
curl -X GET "https://api-ca.ssactivewear.com/v2/products/00760?fields=sku,color,size,price" \
  -u "account_number:api_key"
```
