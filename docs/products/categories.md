# Categories API

The Categories API gives information about the categories each style is assigned to.

## Resource URL

```
GET https://api-ca.ssactivewear.com/v2/categories/
```

## Request Options

| Option | Endpoint | Description |
|--------|----------|-------------|
| **Get All** | `/v2/categories/` | Returns all categories |
| **Filter Results** | `/v2/categories/{category}` | Returns categories by filter<br><br>`{category}` = comma separated list of category identifiers<br>`identifiers` = CategoryID |
| **Filter Fields** | `/v2/categories/?fields={fields}` | Returns specifically requested fields<br><br>`{fields}` = comma separated list of category object fields |
| **Response Format** | `/v2/categories/?mediatype={mediatype}` | Determines the response type<br><br>`{mediatype}` = json or xml (Default=json) |

## Example Request

```
GET https://api-ca.ssactivewear.com/v2/categories/81
```

## Example Response

```json
[
   {
    "categoryID": 81,
    "name": "3/4 Sleeve",
    "image": "deprecated"
  } 
]
```

## Category Object Definition

| Field | Type | Description |
|-------|------|-------------|
| `categoryID` | Integer | Unique ID for this category (does not change) |
| `name` | String | Logical name for the category |
| `image` | String | **{deprecated}** |

## Usage Examples

### Get all categories
```bash
curl -X GET "https://api-ca.ssactivewear.com/v2/categories/" \
  -u "account_number:api_key"
```

### Get specific category
```bash
curl -X GET "https://api-ca.ssactivewear.com/v2/categories/81" \
  -u "account_number:api_key"
```

### Get categories with specific fields only
```bash
curl -X GET "https://api-ca.ssactivewear.com/v2/categories/?fields=CategoryID,Name" \
  -u "account_number:api_key"
```
