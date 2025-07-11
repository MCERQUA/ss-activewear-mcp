# Cross Reference API - DELETE

Remove cross-reference mappings.

## Resource URL

```
DELETE https://api-ca.ssactivewear.com/v2/crossref/{yourSku}
```

## Response Format

```json
{
  "success": true,
  "yourSku": "SHIRT-RED-M",
  "message": "Cross reference deleted successfully"
}
```

## Usage Examples

### Delete cross reference
```bash
curl -X DELETE "https://api-ca.ssactivewear.com/v2/crossref/SHIRT-RED-M" \
  -u "account_number:api_key"
```

## Important Notes

- Deletion is permanent and cannot be undone
- Orders using deleted cross references will fail
- Consider deactivating instead of deleting for temporary removal
