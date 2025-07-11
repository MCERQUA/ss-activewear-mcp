# Specs API

The Specs API provides detailed product specifications including measurements, materials, and technical details.

## Resource URL

```
GET https://api-ca.ssactivewear.com/v2/specs/
```

## Request Options

| Option | Endpoint | Description |
|--------|----------|-------------|
| **Get All** | `/v2/specs/` | Returns specs for all products |
| **Filter by Style** | `/v2/specs/{style}` | Returns specs for specific styles<br><br>`{style}` = comma separated list of style identifiers |
| **Filter Fields** | `/v2/specs/?fields={fields}` | Returns only requested fields<br><br>`{fields}` = comma separated list of spec object fields |
| **Response Format** | `/v2/specs/?mediatype={mediatype}` | Determines response type<br><br>`{mediatype}` = json or xml (Default=json) |

## Example Request

```
GET https://api-ca.ssactivewear.com/v2/specs/00760
```

## Specs Object Definition

| Field | Type | Description |
|-------|------|-------------|
| `styleID` | Integer | Style ID |
| `specType` | String | Type of specification |
| `specName` | String | Name of the specification |
| `specValue` | String | Value or measurement |
| `specCategory` | String | Category of specification |
| `specDescription` | String | Detailed description |
| `specOrder` | Integer | Display order |

## Common Spec Categories

- **Materials**: Fabric composition, weight, construction
- **Measurements**: Size charts, dimensions
- **Features**: Special characteristics, certifications
- **Care**: Washing instructions, maintenance
- **Compliance**: Safety standards, certifications

## Usage Examples

### Get specs for a style
```bash
curl -X GET "https://api-ca.ssactivewear.com/v2/specs/00760" \
  -u "account_number:api_key"
```

### Get material specs only
```bash
curl -X GET "https://api-ca.ssactivewear.com/v2/specs/00760?fields=specName,specValue&filter=Materials" \
  -u "account_number:api_key"
```
