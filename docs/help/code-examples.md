# Code Examples

Practical examples for integrating with the S&S Activewear API.

## Authentication

All API requests require HTTP Basic Authentication using your account number and API key.

### cURL Example
```bash
curl -X GET "https://api-ca.ssactivewear.com/v2/styles/" \
  -u "account_number:api_key" \
  -H "Accept: application/json"
```

### JavaScript/Node.js Example
```javascript
const axios = require('axios');

const api = axios.create({
  baseURL: 'https://api-ca.ssactivewear.com/v2/',
  auth: {
    username: 'your_account_number',
    password: 'your_api_key'
  },
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

// Get all styles
api.get('styles/')
  .then(response => {
    console.log(response.data);
  })
  .catch(error => {
    console.error('Error:', error.response.data);
  });
```

### Python Example
```python
import requests
from requests.auth import HTTPBasicAuth

class SSActivewearAPI:
    def __init__(self, account_number, api_key):
        self.base_url = 'https://api-ca.ssactivewear.com/v2/'
        self.auth = HTTPBasicAuth(account_number, api_key)
        self.headers = {'Accept': 'application/json'}
    
    def get_styles(self):
        response = requests.get(
            f'{self.base_url}styles/',
            auth=self.auth,
            headers=self.headers
        )
        return response.json()
    
    def get_inventory(self, style_id):
        response = requests.get(
            f'{self.base_url}inventory/{style_id}',
            auth=self.auth,
            headers=self.headers
        )
        return response.json()

# Usage
api = SSActivewearAPI('your_account_number', 'your_api_key')
styles = api.get_styles()
print(f"Found {len(styles)} styles")
```

### PHP Example
```php
<?php
class SSActivewearAPI {
    private $baseUrl = 'https://api-ca.ssactivewear.com/v2/';
    private $accountNumber;
    private $apiKey;
    
    public function __construct($accountNumber, $apiKey) {
        $this->accountNumber = $accountNumber;
        $this->apiKey = $apiKey;
    }
    
    public function makeRequest($endpoint, $method = 'GET', $data = null) {
        $ch = curl_init();
        
        curl_setopt_array($ch, [
            CURLOPT_URL => $this->baseUrl . $endpoint,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_USERPWD => $this->accountNumber . ':' . $this->apiKey,
            CURLOPT_HTTPHEADER => ['Accept: application/json'],
            CURLOPT_CUSTOMREQUEST => $method
        ]);
        
        if ($data && in_array($method, ['POST', 'PUT'])) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                'Accept: application/json',
                'Content-Type: application/json'
            ]);
        }
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        return [
            'status' => $httpCode,
            'data' => json_decode($response, true)
        ];
    }
    
    public function getStyles() {
        return $this->makeRequest('styles/');
    }
    
    public function createOrder($orderData) {
        return $this->makeRequest('orders/', 'POST', $orderData);
    }
}

// Usage
$api = new SSActivewearAPI('your_account_number', 'your_api_key');
$styles = $api->getStyles();
echo "Found " . count($styles['data']) . " styles\n";
?>
```

## Common Use Cases

### 1. Product Catalog Sync

```javascript
// Sync product catalog with inventory
async function syncCatalog() {
  try {
    // Get all styles
    const styles = await api.get('styles/');
    
    for (const style of styles.data) {
      // Get products for each style
      const products = await api.get(`products/${style.partNumber}`);
      
      // Get inventory for products
      const inventory = await api.get(`inventory/${style.partNumber}`);
      
      // Update your local database
      await updateLocalProducts(products.data, inventory.data);
    }
  } catch (error) {
    console.error('Sync failed:', error);
  }
}
```

### 2. Order Management

```javascript
// Create and track orders
async function processOrder(orderData) {
  try {
    // Create order
    const order = await api.post('orders/', orderData);
    console.log('Order created:', order.data.orderNumber);
    
    // Track order status
    const orderStatus = await api.get(`orders/${order.data.orderNumber}`);
    console.log('Order status:', orderStatus.data.orderStatus);
    
    return order.data;
  } catch (error) {
    console.error('Order processing failed:', error);
    throw error;
  }
}
```

### 3. Inventory Monitoring

```python
# Monitor inventory levels
def check_low_inventory(threshold=10):
    api = SSActivewearAPI('account', 'key')
    
    # Get inventory for all products
    inventory = api.get_inventory()
    
    low_stock_items = []
    for item in inventory:
        if item['quantityAvailable'] <= threshold:
            low_stock_items.append({
                'sku': item['sku'],
                'available': item['quantityAvailable'],
                'warehouse': item['warehouse']
            })
    
    return low_stock_items

# Send alerts for low inventory
low_stock = check_low_inventory(5)
if low_stock:
    send_inventory_alert(low_stock)
```

## Error Handling

### Rate Limiting

```javascript
// Handle rate limiting (60 requests per minute)
class RateLimitedAPI {
  constructor(accountNumber, apiKey) {
    this.api = axios.create({
      baseURL: 'https://api-ca.ssactivewear.com/v2/',
      auth: { username: accountNumber, password: apiKey }
    });
    
    this.requestCount = 0;
    this.resetTime = Date.now() + 60000; // Reset every minute
  }
  
  async makeRequest(method, endpoint, data = null) {
    // Check rate limit
    if (Date.now() > this.resetTime) {
      this.requestCount = 0;
      this.resetTime = Date.now() + 60000;
    }
    
    if (this.requestCount >= 60) {
      const waitTime = this.resetTime - Date.now();
      console.log(`Rate limit reached. Waiting ${waitTime}ms`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      this.requestCount = 0;
      this.resetTime = Date.now() + 60000;
    }
    
    this.requestCount++;
    
    try {
      const response = await this.api[method](endpoint, data);
      return response.data;
    } catch (error) {
      console.error('API Error:', error.response?.data || error.message);
      throw error;
    }
  }
}
```

### Retry Logic

```python
import time
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

def create_session_with_retries():
    session = requests.Session()
    
    retry_strategy = Retry(
        total=3,
        backoff_factor=1,
        status_forcelist=[429, 500, 502, 503, 504],
    )
    
    adapter = HTTPAdapter(max_retries=retry_strategy)
    session.mount("https://", adapter)
    
    return session

# Usage
session = create_session_with_retries()
response = session.get(
    'https://api-ca.ssactivewear.com/v2/styles/',
    auth=('account_number', 'api_key')
)
```

## Best Practices

1. **Cache responses** when appropriate to reduce API calls
2. **Respect rate limits** (60 requests per minute)
3. **Use proper error handling** for network and API errors
4. **Validate data** before sending requests
5. **Use field filtering** to reduce response size
6. **Implement retry logic** for transient failures
7. **Store API credentials securely**
8. **Log API interactions** for debugging
9. **Use webhooks** where available instead of polling
10. **Monitor API usage** to stay within limits

## SDK and Libraries

While S&S Activewear doesn't provide official SDKs, the community has created libraries for various languages. Check the S&S Activewear developer community for the latest tools and libraries.
