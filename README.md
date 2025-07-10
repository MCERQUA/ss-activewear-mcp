# S&S Activewear Canada MCP Server 🇨🇦

Model Context Protocol (MCP) server for integrating with S&S Activewear Canada's API. This implementation is **CANADA ONLY** and connects exclusively to the Canadian S&S Activewear catalog and warehouses.

## Features

- 🇨🇦 **Canada Only**: Connects exclusively to S&S Activewear Canada (api-ca.ssactivewear.com)
- 🔍 **Product Search**: Search Canadian catalog by keywords, brands, and styles
- 📋 **Product Details**: Get detailed information for specific Canadian products
- 📦 **Inventory Check**: Real-time inventory from Canadian warehouses (BC, ON)
- 💰 **Pricing**: Get Canadian pricing (CAD) with volume discounts
- 📊 **Data Export**: Export Canadian catalog data in CSV/JSON formats

## Installation

1. Clone this repository:
```bash
git clone https://github.com/MCERQUA/ss-activewear-mcp.git
cd ss-activewear-mcp
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with your S&S Activewear Canada credentials:
```env
SS_ACCOUNT_NUMBER=your_account_number
SS_API_KEY=your_api_key
DEBUG=false
```

## Configuration

Add to your MCP settings file (e.g., `claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "ss-activewear-canada": {
      "command": "node",
      "args": ["/path/to/ss-activewear-mcp/src/index.js"],
      "env": {
        "SS_ACCOUNT_NUMBER": "your_account_number",
        "SS_API_KEY": "your_api_key",
        "DEBUG": "true"
      }
    }
  }
}
```

## Available Tools

### 1. `search_products`
Search the S&S Activewear Canada catalog:
```javascript
{
  "query": "gildan t-shirt",
  "brand": "Gildan",
  "limit": 10
}
```

### 2. `get_product_details`
Get detailed information for a specific Canadian product:
```javascript
{
  "styleId": "B00760004"
}
```

### 3. `check_inventory`
Check real-time inventory at Canadian warehouses:
```javascript
{
  "styleIds": ["B00760004", "81480"],
  "warehouse": "BC"  // Canadian warehouses: BC, ON
}
```

### 4. `get_pricing`
Get Canadian pricing (CAD) with volume discounts:
```javascript
{
  "styleIds": ["B00760004"],
  "quantity": 12
}
```

### 5. `download_product_data`
Export Canadian catalog data:
```javascript
{
  "format": "csv",
  "includeInventory": true
}
```

## Canadian Warehouses

This MCP server only works with Canadian S&S Activewear warehouses:
- **BC** - British Columbia
- **ON** - Ontario

## Supported Product Identifiers

- **SKU** - Alphanumeric SKU (e.g., B00760004)
- **Style ID** - Numeric style identifier
- **GTIN** - Industry standard identifier

## Authentication

Uses HTTP Basic Authentication with:
- **Username**: Your S&S Activewear account number
- **Password**: Your S&S Activewear API key

## Debug Mode

Enable debug logging to troubleshoot API issues:
```env
DEBUG=true
```

Debug logs will show:
- Full API URLs being called
- Request parameters
- Response status and content types
- Error details

## Error Handling

The server provides detailed error messages for common issues:
- **401**: Authentication failed - check credentials
- **403**: Access denied - check API permissions  
- **404**: Product not found in Canadian catalog
- **HTML Response**: API endpoint or mediatype parameter issue

## Support

For S&S Activewear Canada API support:
- **Email**: api-ca@ssactivewear.com
- **API Base**: https://api-ca.ssactivewear.com/v2

## License

MIT License - see LICENSE file for details.

---

**Note**: This MCP server is designed exclusively for S&S Activewear Canada operations and does not support US S&S Activewear endpoints.
