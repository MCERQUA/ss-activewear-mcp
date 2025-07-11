# Error Codes and Troubleshooting

Common error codes and solutions for the S&S Activewear API.

## HTTP Status Codes

### 200 OK
Request successful, data returned.

### 400 Bad Request
The request was invalid or malformed.

**Common causes:**
- Invalid JSON format
- Missing required fields
- Invalid parameter values
- Malformed URLs

**Example:**
```json
{
  "error": "Bad Request",
  "message": "Invalid SKU format",
  "details": "SKU must be in format XXXXXXXXXXX"
}
```

### 401 Unauthorized
Authentication failed or credentials are invalid.

**Common causes:**
- Incorrect account number or API key
- Missing authentication headers
- Expired API key

**Solution:**
- Verify your account number and API key
- Ensure proper Basic Authentication format
- Contact support if credentials appear correct

### 403 Forbidden
Authenticated but not authorized for this resource.

**Common causes:**
- Account doesn't have access to specific endpoints
- API key has restricted permissions
- Account status issues

### 404 Not Found
The requested resource doesn't exist.

**Common causes:**
- Invalid endpoint URL
- Non-existent order/product/style ID
- Typos in the request path

### 429 Too Many Requests
Rate limit exceeded (60 requests per minute).

**Headers included:**
- `X-Rate-Limit-Limit`: 60
- `X-Rate-Limit-Remaining`: 0
- `X-Rate-Limit-Reset`: [timestamp]

**Solution:**
- Wait until the rate limit resets
- Implement rate limiting in your application
- Reduce the frequency of requests

### 500 Internal Server Error
Server-side error occurred.

**Solution:**
- Retry the request after a brief delay
- Contact support if the error persists
- Check API status page

### 503 Service Unavailable
API is temporarily unavailable (maintenance, high load).

**Solution:**
- Wait and retry with exponential backoff
- Check API status page for maintenance notices

## Common API Errors

### Invalid SKU
```json
{
  "error": "InvalidSKU",
  "message": "The specified SKU does not exist",
  "sku": "0076000001X"
}
```

**Causes:**
- SKU doesn't exist in the catalog
- SKU has been discontinued
- Typo in SKU format

**Solution:**
- Verify SKU exists using the Products API
- Check for recent catalog updates
- Use the Styles API to find available SKUs

### Insufficient Inventory
```json
{
  "error": "InsufficientInventory",
  "message": "Not enough inventory available",
  "sku": "0076000001S",
  "requested": 100,
  "available": 25
}
```

**Solution:**
- Check current inventory levels
- Reduce order quantity
- Split order across multiple warehouses
- Consider alternative products

### Invalid Order Status
```json
{
  "error": "InvalidOrderStatus",
  "message": "Cannot modify order in current status",
  "orderNumber": "4629304",
  "currentStatus": "Shipped"
}
```

**Solution:**
- Check order status before attempting modifications
- Use Returns API for shipped orders
- Contact customer service for special cases

### Invalid Date Format
```json
{
  "error": "InvalidDateFormat",
  "message": "Date must be in YYYY-MM-DD format",
  "provided": "01/15/2024",
  "expected": "2024-01-15"
}
```

**Solution:**
- Use ISO 8601 date format (YYYY-MM-DD)
- Include time zone for datetime fields
- Validate date formats before sending

## Troubleshooting Guide

### Connection Issues

**Problem:** Cannot connect to API

**Check:**
1. Internet connectivity
2. Firewall settings
3. DNS resolution for `api-ca.ssactivewear.com`
4. SSL/TLS certificate validation

**Solution:**
```bash
# Test connectivity
ping api-ca.ssactivewear.com

# Test HTTPS connection
curl -I https://api-ca.ssactivewear.com/v2/
```

### Authentication Issues

**Problem:** Getting 401 Unauthorized errors

**Check:**
1. Account number format (no spaces or special characters)
2. API key is correct and not expired
3. Basic Auth header is properly encoded
4. Account is active and in good standing

**Test Authentication:**
```bash
# Test with curl
curl -u "account:key" https://api-ca.ssactivewear.com/v2/styles/ -I

# Should return 200 OK if credentials are valid
```

### Data Issues

**Problem:** Unexpected or missing data

**Check:**
1. API version compatibility
2. Field filtering parameters
3. Date range filters
4. Account-specific data availability

**Debug Response:**
```bash
# Get full response with headers
curl -v -u "account:key" "https://api-ca.ssactivewear.com/v2/styles/"
```

### Performance Issues

**Problem:** Slow API responses

**Optimize:**
1. Use field filtering to reduce response size
2. Implement pagination for large datasets
3. Cache responses when appropriate
4. Use appropriate warehouse filters
5. Avoid requesting unnecessary data

**Example - Optimized Request:**
```bash
# Instead of getting all product data
curl "https://api-ca.ssactivewear.com/v2/products/"

# Get only required fields
curl "https://api-ca.ssactivewear.com/v2/products/?fields=sku,color,size,price"
```

## Error Prevention

### Input Validation

```javascript
// Validate SKU format before API call
function validateSKU(sku) {
  const skuPattern = /^[0-9]{10}[A-Z0-9]+$/;
  return skuPattern.test(sku);
}

// Validate date format
function validateDate(dateString) {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
}
```

### Retry Logic

```python
import time
import random

def api_request_with_retry(func, max_retries=3):
    for attempt in range(max_retries):
        try:
            return func()
        except requests.exceptions.HTTPError as e:
            if e.response.status_code == 429:  # Rate limited
                wait_time = 2 ** attempt + random.uniform(0, 1)
                print(f"Rate limited. Waiting {wait_time:.2f} seconds...")
                time.sleep(wait_time)
            elif e.response.status_code >= 500:  # Server error
                wait_time = 2 ** attempt
                print(f"Server error. Retrying in {wait_time} seconds...")
                time.sleep(wait_time)
            else:
                raise  # Don't retry for client errors
    
    raise Exception(f"Failed after {max_retries} attempts")
```

## Getting Help

### API Status
Check the API status page: https://status.ssactivewear.com

### Support Channels
- **Email**: api-ca@ssactivewear.com
- **Documentation**: This documentation site
- **Account Manager**: Contact your dedicated account manager

### Debugging Information to Include

When contacting support, include:

1. **Request Details**:
   - Full URL and method
   - Request headers
   - Request body (without sensitive data)

2. **Response Details**:
   - HTTP status code
   - Response headers
   - Full error message

3. **Environment**:
   - Programming language and version
   - Library versions
   - Operating system

4. **Account Information**:
   - Account number (first few digits only)
   - Approximate time of error
   - Frequency of occurrence

### Example Support Request

```
Subject: API Error - Invalid SKU Response

Account: 12345***
Endpoint: GET /v2/products/0076000001S
Time: 2024-01-15 14:30:00 EST
Error: 404 Not Found

Request:
GET https://api-ca.ssactivewear.com/v2/products/0076000001S
Authorization: Basic [REDACTED]
Accept: application/json

Response:
{
  "error": "Product not found",
  "sku": "0076000001S"
}

Expected: Product data for valid SKU
Actual: 404 error

Additional context: This SKU was working yesterday and appears in our catalog export.
```
