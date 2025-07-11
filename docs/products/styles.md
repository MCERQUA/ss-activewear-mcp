# Styles API

The Styles API gives basic style level information that is repeated on every SKU within the style.

## Resource URL

```
GET https://api-ca.ssactivewear.com/v2/styles/
```

## Request Options

| Option | Endpoint | Description |
|--------|----------|-------------|
| **Get All** | `/v2/styles/` | Returns all styles |
| **Filter Results** | `/v2/styles/{style}` | Returns styles matching filter condition<br><br>`{style}` = comma separated list of style identifiers<br>`identifiers` = StyleID, PartNumber, BrandName Name |
| **Search Results** | `/v2/styles?search={value}` | Returns styles matching search criteria<br><br>`{value}` = search term (e.g., brand name, style name) |
| **Filter by StyleID** | `/v2/styles/?styleid={styleid}` | Returns styles by StyleID<br><br>`{styleid}` = comma separated list of style IDs |
| **Filter by PartNumber** | `/v2/styles/?partnumber={partnumber}` | Returns styles by part number<br><br>`{partnumber}` = comma separated list of part numbers |
| **Filter Fields** | `/v2/styles/?fields={fields}` | Returns only requested fields<br><br>`{fields}` = comma separated list of style object fields |
| **Response Format** | `/v2/styles/?mediatype={mediatype}` | Determines response type<br><br>`{mediatype}` = json or xml (Default=json) |

## Example Request

```
GET https://api-ca.ssactivewear.com/v2/styles/00760
```

## Example Response

```json
[
   {
    "styleID": 39,
    "partNumber": "00760",
    "brandName": "Gildan",
    "styleName": "2000",
    "title": "Ultra Cotton™ T-Shirt",
    "description": "6.0 oz., pre-shrunk 100% cotton (Dark Heather, Heather Cardinal, Heather Indigo, Heather Navy, Heather Sapphire, Safety Green, Safety Orange and Safety Pink are 50/50 cotton/polyester. Antique Cherry Red, Antique Irish Green, Antique Royal and Sport Grey are 90/10 cotton/polyester. Ash Grey is 99/1 cotton/polyester.) Safety Green and Safety Orange are compliant with ANSI High Visibility Standards Double-needle stitched neckline, bottom hem and sleeves Quarter-turned Shoulder-to-shoulder taping Seven-eighths inch collar",
    "baseCategory": "T-Shirts",
    "categories": "21,57,71,79,87",
    "catalogPageNumber": "182",
    "newStyle": false,
    "comparableGroup": 7,
    "companionGroup": 2,
    "brandImage": "Images/Brand/35_fl.jpg",
    "styleImage": "Images/Style/39_fl.jpg"
  }
]
```

## Style Object Definition

| Field | Type | Description |
|-------|------|-------------|
| `styleID` | Integer | Unique ID for this style (does not change) |
| `partNumber` | String | First 5 digits of SKU number. Same for all SKUs in the style |
| `brandName` | String | The brand that makes this style |
| `styleName` | String | The style's name. Style names are unique within a brand |
| `title` | String | A short description of the style |
| `description` | String | Long HTML description of the style |
| `baseCategory` | String | Primary category for the style. Only one per style |
| `categories` | String | Comma separated list of categories the style belongs to |
| `catalogPageNumber` | String | Page number the style appears in current catalog |
| `newStyle` | Boolean | Defines if the style is new |
| `comparableGroup` | String | Styles with same group are considered similar products |
| `companionGroup` | String | Styles with same group are within same product family |
| `brandImage` | String | URL to medium image for this style's brand |
| `styleImage` | String | URL to medium image for this style |

## Image URL Usage

For `brandImage` and `styleImage` fields:
- **Example URL**: `https://www.ssactivewear.com/{Image}`
- Replace `_fm` with `_fl` for large image
- Replace `_fm` with `_fs` for small image

## Usage Examples

### Get all styles
```bash
curl -X GET "https://api-ca.ssactivewear.com/v2/styles/" \
  -u "account_number:api_key"
```

### Get specific style by part number
```bash
curl -X GET "https://api-ca.ssactivewear.com/v2/styles/00760" \
  -u "account_number:api_key"
```

### Search for Gildan styles
```bash
curl -X GET "https://api-ca.ssactivewear.com/v2/styles?search=Gildan" \
  -u "account_number:api_key"
```

### Get styles with specific fields only
```bash
curl -X GET "https://api-ca.ssactivewear.com/v2/styles/?fields=BrandName,StyleName,Title" \
  -u "account_number:api_key"
```
