# S&S Activewear MCP Server

An MCP (Model Context Protocol) server that provides integration with S&S Activewear's API, enabling AI assistants like Claude to interact with S&S Activewear's wholesale apparel catalog.

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
   SS_REGION=US  # or CA for Canada
   ```

## Usage with Claude Desktop

### Single Region Setup

1. Open your Claude Desktop configuration file:
   - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`
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
           "SS_API_KEY": "your_api_key",
           "SS_REGION": "US"
         }
       }
     }
   }
   ```

3. Restart Claude Desktop

## Canadian Configuration & Multi-Region Setup

### Important Notes for Canadian Users

- S&S Activewear maintains separate systems for US and Canadian operations
- You need separate account numbers and API keys for each region
- Canadian API endpoint: `https://api-ca.ssactivewear.com/V2`
- To get a Canadian API key, email: `api-ca@ssactivewear.com`

### Setting Up Both US and Canadian Regions

If you operate in both the US and Canada, you can set up two instances of the MCP server in your Claude Desktop configuration. Each instance will use the same codebase but with different credentials and regions.

```json
{
  "mcpServers": {
    "ss-activewear-us": {
      "command": "node",
      "args": ["/absolute/path/to/ss-activewear-mcp/src/index.js"],
      "env": {
        "SS_ACCOUNT_NUMBER": "your_us_account_number",
        "SS_API_KEY": "your_us_api_key",
        "SS_REGION": "US"
      }
    },
    "ss-activewear-ca": {
      "command": "node",
      "args": ["/absolute/path/to/ss-activewear-mcp/src/index.js"],
      "env": {
        "SS_ACCOUNT_NUMBER": "your_canada_account_number",
        "SS_API_KEY": "your_canada_api_key",
        "SS_REGION": "CA"
      }
    }
  }
}
```

With this setup:
- Both regions will be available in Claude simultaneously
- You can search US inventory by prefixing with "using ss-activewear-us"
- You can search Canadian inventory by prefixing with "using ss-activewear-ca"
- The same codebase handles both regions automatically based on the `SS_REGION` setting

## Available Tools

### search_products
Search for products in the S&S Activewear catalog.

**Parameters:**
- `query` (required): Search keywords
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
- `styleId` (required): The product style ID

**Example:**
```
Get details for style G500
```

### check_inventory
Check real-time inventory levels.

**Parameters:**
- `styleIds` (required): Array of style IDs
- `warehouse` (optional): Specific warehouse code

**Example:**
```
Check inventory for styles G500 and G800
```

### get_pricing
Get pricing information including volume discounts.

**Parameters:**
- `styleIds` (required): Array of style IDs
- `quantity` (optional): Quantity for volume pricing

### download_product_data
Export product catalog data.

**Parameters:**
- `format` (optional): csv, xml, or json (default: csv)
- `includeInventory` (optional): Include inventory data (default: true)

## API Endpoints

- **US API**: `https://api.ssactivewear.com/V2`
- **Canadian API**: `https://api-ca.ssactivewear.com/V2`

The server automatically uses the correct endpoint based on your `SS_REGION` setting.

## Development

### Running locally

```bash
npm start
```

### Testing

```bash
npm test
```

## Troubleshooting

### Authentication errors
- Verify your account number and API key are correct
- Ensure you're using the correct region (US vs CA)
- Check that your API access is active
- For Canadian accounts, make sure you're using the Canadian API key from `api-ca@ssactivewear.com`

### No results found
- Try broader search terms
- Verify the product style IDs are correct
- Check if you're searching in the correct region's catalog
- Note that product availability may differ between US and Canadian catalogs

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

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