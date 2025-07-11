# Returns API - DELETE

Cancel pending return requests.

## Resource URL

```
DELETE https://api-ca.ssactivewear.com/v2/returns/{returnNumber}
```

## Cancellation Rules

- Only returns with "Pending" status can be canceled
- Returns that have been approved or received cannot be canceled
- Contact customer service for approved returns that need modification

## Response Format

```json
{
  "success": true,
  "returnNumber": "R123456",
  "status": "Canceled",
  "message": "Return request canceled successfully"
}
```

## Usage Examples

### Cancel return request
```bash
curl -X DELETE "https://api-ca.ssactivewear.com/v2/returns/R123456" \
  -u "account_number:api_key"
```
