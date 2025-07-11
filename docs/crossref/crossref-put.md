# Cross Reference API - PUT

Create or update cross-reference mappings between your SKUs and S&S Activewear SKUs.

## Resource URL

```
PUT https://api-ca.ssactivewear.com/v2/crossref/{yourSku}
```

## Request Format

```json
{
  "ssSku": "0076000004M",
  "active": true
}
```

## Request Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `ssSku` | String | Yes | S&S Activewear SKU to map to |
| `active` | Boolean | No | Whether mapping is active (default: true) |

## Response Format

```json
{
  "success": true,
  "yourSku": "SHIRT-RED-M",
  "ssSku": "0076000004M",
  "message": "Cross reference created successfully"
}
```

## Usage Examples

### Create cross reference mapping
```bash
curl -X PUT "https://api-ca.ssactivewear.com/v2/crossref/SHIRT-RED-M" \
  -u "account_number:api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "ssSku": "0076000004M",
    "active": true
  }'
```

### Update existing mapping
```bash
curl -X PUT "https://api-ca.ssactivewear.com/v2/crossref/SHIRT-RED-M" \
  -u "account_number:api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "ssSku": "0076000005L",
    "active": true
  }'
```

## Important Notes

- Your SKU must be unique within your account
- S&S SKU must be valid and currently available
- Existing mappings will be updated with new values
- Inactive mappings are preserved but not used in orders
