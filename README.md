# S&S Activewear MCP Server

An MCP (Model Context Protocol) server that provides integration with S&S Activewear's API, enabling AI assistants like Claude to interact with S&S Activewear's wholesale apparel catalog.

## 🚀 Recent Updates (Fix Branch)

**Critical API Implementation Fixes:**
- ✅ Fixed base URL to use Canadian endpoint consistently (`https://api-ca.ssactivewear.com/v2`)
- ✅ Implemented correct endpoint patterns from API documentation
- ✅ Added required `mediatype=json` parameter to all requests
- ✅ Improved error handling with specific status code responses
- ✅ Fixed authentication using proper HTTP Basic Auth
- ✅ Enhanced debugging capabilities with detailed request/response logging

## Features

- 🔍 **Product Search** - Search products by keyword, style, brand, or category
- 📦 **Inventory Check** - Real-time inventory availability across warehouses
- 💰 **Pricing Information** - Get pricing including volume discounts
- 📊 **Product Details** - Detailed product information including colors, sizes, and specifications
- 📥 **Data Export** - Download product catalogs in various formats

## Installation

### Prerequisites

- Node.js 18 or higher
- An S&S Activewear account with API access
- Your API credentials (Account Number and API Key)

### Getting your API Key

To get your S&S Activewear API key:

1. Email `api@ssactivewear.com` (US) or `api-ca@ssactivewear.com` (Canada)
2. Include your account number in the request
3. They typically respond within one business day

### Setup

1. Clone this repository:
   ```bash
   git clone https://github.com/MCERQUA/ss-activewear-mcp.git
   cd ss-activewear-mcp
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with your credentials:
   ```bash
   cp .env.example .env
   ```

4. Edit `.env` and add your credentials:
   ```env
   SS_ACCOUNT_NUMBER=your_account_number
   SS_API_KEY=your_api_key
   DEBUG=false   # set to true for debugging
   ```

## Usage with Claude Desktop

1. Open your Claude Desktop configuration file:
   - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - Windows: `%APPDATA%\\Claude\\claude_desktop_config.json`
   - Linux: `~/.config/Claude/claude_desktop_config.json`

2. Add the S&S Activewear MCP server configuration:

   ```json
   {
     "mcpServers": {
       "ss-activewear": {
         "command": "node",
         "args": ["/absolute/path/to/ss-activewear-mcp/src/index.js"],
         "env": {
           "SS_ACCOUNT_NUMBER": "your_account_number",
           "SS_API_KEY": "your_api_key"
         }
       }
     }
   }
   ```

3. Restart Claude Desktop

## Authentication

The S&S Activewear API uses HTTP Basic Authentication:
- **Username**: Your Account Number
- **Password**: Your API Key

The MCP server handles this authentication automatically using the credentials you provide in the configuration.

## Available Tools

### search_products
Search for products in the S&S Activewear catalog.

**Parameters:**
- `query` (required): Search keywords (searches style names, brands, etc.)
- `category` (optional): Filter by category
- `brand` (optional): Filter by brand
- `limit` (optional): Maximum results (default: 20)

**Example:**
```
Search for "gildan t-shirts" in the S&S catalog
```

### get_product_details
Get detailed information about a specific product.

**Parameters:**
- `styleId` (required): The product identifier (SKU, GTIN, StyleID, etc.)

**Example:**
```
Get details for style B00760004
```

### check_inventory
Check real-time inventory levels.

**Parameters:**
- `styleIds` (required): Array of product identifiers
- `warehouse` (optional): Specific warehouse code (IL, NV, NJ, KS, BC, ON)

**Example:**
```
Check inventory for styles B00760004 and G500
```

### get_pricing
Get pricing information including volume discounts.

**Parameters:**
- `styleIds` (required): Array of product identifiers
- `quantity` (optional): Quantity for volume pricing

### download_product_data
Export product catalog data.

**Parameters:**
- `format` (optional): csv, xml, or json (default: csv)
- `includeInventory` (optional): Include inventory data (default: true)

## API Implementation Details

### Base URL
- **Primary API**: `https://api-ca.ssactivewear.com/v2` (Canadian endpoint - more reliable)

### Key Endpoints Used
- `/v2/products/` - Product search and details
- `/v2/products/{identifier}` - Specific product lookup
- `/v2/inventory/{identifiers}` - Real-time inventory
- `/v2/products/?style={query}` - Style-based search

### Supported Product Identifiers
- **SkuID** - Unique numeric ID (e.g., 81480)
- **Sku** - Alphanumeric SKU (e.g., B00760004)
- **Gtin** - Industry standard identifier (e.g., 00821780008137)
- **StyleID** - Numeric style ID (e.g., 39)

### Warehouse Codes
- **IL** - Illinois
- **NV** - Nevada  
- **NJ** - New Jersey
- **KS** - Kansas
- **BC** - British Columbia (Canada)
- **ON** - Ontario (Canada)

## Development

### Running locally

```bash
npm start
```

### Testing

```bash
npm test
```

### Debugging

Enable detailed API debugging:

```json
{
  "mcpServers": {
    "ss-activewear": {
      "command": "node",
      "args": ["/absolute/path/to/ss-activewear-mcp/src/index.js"],
      "env": {
        "SS_ACCOUNT_NUMBER": "your_account_number",
        "SS_API_KEY": "your_api_key",
        "DEBUG": "true"
      }
    }
  }
}
```

With debug mode enabled, you'll see:
- Full API request URLs and parameters
- Request/response headers
- Response status codes and data types
- Detailed error information

## Troubleshooting

### Authentication errors (401)
- Verify your account number and API key are correct
- Check that your API access is active with S&S Activewear
- Ensure you're using the Account Number as username and API Key as password

### Product not found (404)
- Verify the product identifier is correct
- Check if the product has been discontinued
- Try searching with different identifier types (SKU vs StyleID)

### HTML response instead of JSON
This was a common issue that has been fixed in this version:
- All requests now include `mediatype=json` parameter
- Proper Accept headers are set
- Error is thrown if HTML response is detected

### No results found
- Try broader search terms
- Verify the product style IDs are correct
- Use specific identifiers like SKUs for exact matches

### Connection timeouts
- Check your internet connection
- API requests have a 30-second timeout
- S&S servers may occasionally be slow during peak hours

### Debug Mode Error Analysis

When `DEBUG=true`, look for these common issues in the logs:

1. **URL Construction**: Check that URLs don't have double slashes
2. **Authentication**: Verify the Basic Auth header is properly formatted
3. **Response Type**: Ensure responses are JSON, not HTML
4. **Status Codes**: 
   - 401: Authentication problem
   - 403: Access denied
   - 404: Resource not found
   - 500: Server error

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Key Implementation Notes for Contributors

1. **Always include `mediatype=json`** in query parameters
2. **Use Canadian API endpoint** as primary (more stable)
3. **Handle multiple identifier types** (SKU, GTIN, StyleID)
4. **Implement proper error handling** for different HTTP status codes
5. **Support warehouse filtering** for inventory queries

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Support

For issues with:
- This MCP server: [Open an issue](https://github.com/MCERQUA/ss-activewear-mcp/issues)
- S&S Activewear API: Contact `api@ssactivewear.com` (US) or `api-ca@ssactivewear.com` (Canada)
- Claude Desktop: Visit [Claude support](https://support.anthropic.com)

## Acknowledgments

- Built for use with [Anthropic's MCP](https://github.com/anthropics/mcp)
- Integrates with [S&S Activewear's API](https://api.ssactivewear.com)
- Implementation based on detailed API analysis and testing
