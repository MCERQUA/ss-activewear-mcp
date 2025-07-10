#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import axios from "axios";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, "..", ".env") });

// S&S Activewear API configuration - Using Canadian endpoint as primary
const SS_API_BASE_URL = "https://api-ca.ssactivewear.com/v2";

class SSActivewearServer {
  constructor() {
    this.server = new Server(
      {
        name: "ss-activewear",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
    this.validateConfig();
  }

  validateConfig() {
    const required = ["SS_ACCOUNT_NUMBER", "SS_API_KEY"];
    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
      console.error(`Missing required environment variables: ${missing.join(", ")}`);
      console.error("Please check your .env file or MCP configuration.");
    }
    
    // Log configuration (without exposing sensitive data)
    console.error("S&S Activewear MCP Configuration:");
    console.error(`- Account Number: ${process.env.SS_ACCOUNT_NUMBER ? "✓ Set" : "✗ Missing"}`);
    console.error(`- API Key: ${process.env.SS_API_KEY ? "✓ Set" : "✗ Missing"}`);
    console.error(`- Debug: ${process.env.DEBUG === "true" ? "Enabled" : "Disabled"}`);
    console.error(`- API Base URL: ${SS_API_BASE_URL}`);
  }

  setupHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: "search_products",
          description: "Search S&S Activewear products by keyword, style, brand, or category",
          inputSchema: {
            type: "object",
            properties: {
              query: {
                type: "string",
                description: "Search query (keyword, style number, brand name, etc.)",
              },
              category: {
                type: "string",
                description: "Product category filter (optional)",
              },
              brand: {
                type: "string",
                description: "Brand filter (optional)",
              },
              limit: {
                type: "number",
                description: "Maximum number of results (default: 20)",
                default: 20,
              },
            },
            required: ["query"],
          },
        },
        {
          name: "get_product_details",
          description: "Get detailed information about a specific product including inventory",
          inputSchema: {
            type: "object",
            properties: {
              styleId: {
                type: "string",
                description: "The style ID of the product",
              },
            },
            required: ["styleId"],
          },
        },
        {
          name: "check_inventory",
          description: "Check real-time inventory for specific products",
          inputSchema: {
            type: "object",
            properties: {
              styleIds: {
                type: "array",
                items: { type: "string" },
                description: "Array of style IDs to check inventory for",
              },
              warehouse: {
                type: "string",
                description: "Specific warehouse code (optional)",
              },
            },
            required: ["styleIds"],
          },
        },
        {
          name: "get_pricing",
          description: "Get pricing information for products",
          inputSchema: {
            type: "object",
            properties: {
              styleIds: {
                type: "array",
                items: { type: "string" },
                description: "Array of style IDs to get pricing for",
              },
              quantity: {
                type: "number",
                description: "Quantity for volume pricing (optional)",
                default: 1,
              },
            },
            required: ["styleIds"],
          },
        },
        {
          name: "download_product_data",
          description: "Download product catalog data in CSV format",
          inputSchema: {
            type: "object",
            properties: {
              format: {
                type: "string",
                enum: ["csv", "xml", "json"],
                description: "Download format",
                default: "csv",
              },
              includeInventory: {
                type: "boolean",
                description: "Include real-time inventory data",
                default: true,
              },
            },
          },
        },
      ],
    }));

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case "search_products":
            return await this.searchProducts(args);
          case "get_product_details":
            return await this.getProductDetails(args);
          case "check_inventory":
            return await this.checkInventory(args);
          case "get_pricing":
            return await this.getPricing(args);
          case "download_product_data":
            return await this.downloadProductData(args);
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error: ${error.message}`,
            },
          ],
        };
      }
    });
  }

  // Helper function to make authenticated API calls
  async makeApiCall(endpoint, params = {}) {
    const accountNumber = process.env.SS_ACCOUNT_NUMBER;
    const apiKey = process.env.SS_API_KEY;

    if (!accountNumber || !apiKey) {
      throw new Error("S&S Activewear credentials not configured. Please check your .env file.");
    }

    // Construct the full URL with endpoint - ensure no double slashes
    const fullUrl = `${SS_API_BASE_URL}/${endpoint.replace(/^\//, "")}`;
    
    // CRITICAL: Always add mediatype=json to get JSON responses instead of HTML
    const queryParams = {
      ...params,
      mediatype: "json"
    };
    
    // Create Basic Auth header
    const authString = Buffer.from(`${accountNumber}:${apiKey}`).toString('base64');
    
    if (process.env.DEBUG === "true") {
      console.error(`Making API call to: ${fullUrl}`);
      console.error(`Query params: ${JSON.stringify(queryParams)}`);
      console.error(`Using Basic Auth with account: ${accountNumber}`);
    }

    try {
      const response = await axios({
        method: "GET",
        url: fullUrl,
        params: queryParams,
        headers: {
          "Authorization": `Basic ${authString}`,
          "Accept": "application/json",
          "Content-Type": "application/json",
          "User-Agent": "SS-Activewear-MCP/1.0",
        },
        timeout: 30000, // 30 second timeout
      });

      if (process.env.DEBUG === "true") {
        console.error(`Response status: ${response.status}`);
        console.error(`Response type: ${typeof response.data}`);
        console.error(`Response content type: ${response.headers['content-type']}`);
      }

      // Check if we got HTML instead of JSON (common issue)
      if (typeof response.data === 'string' && response.data.includes('<html>')) {
        throw new Error("Received HTML response instead of JSON. Check API endpoint and mediatype parameter.");
      }

      return response.data;
    } catch (error) {
      if (process.env.DEBUG === "true") {
        console.error("API Error Details:");
        if (error.response) {
          console.error(`Status: ${error.response.status}`);
          console.error(`Status Text: ${error.response.statusText}`);
          console.error(`Response Headers: ${JSON.stringify(error.response.headers)}`);
          console.error(`Response Data (first 500 chars): ${JSON.stringify(error.response.data).substring(0, 500)}`);
        } else {
          console.error(`Error: ${error.message}`);
        }
      }
      
      if (error.response) {
        // Handle specific error responses
        if (error.response.status === 404) {
          throw new Error("Product not found or discontinued.");
        } else if (error.response.status === 401) {
          throw new Error("Authentication failed. Check your account number and API key.");
        } else if (error.response.status === 403) {
          throw new Error("Access denied. Check your API permissions.");
        } else {
          const errorMessage = error.response.data?.errors?.[0]?.message 
            || error.response.data?.message 
            || error.response.statusText;
          throw new Error(`S&S API Error: ${error.response.status} - ${errorMessage}`);
        }
      } else if (error.request) {
        throw new Error("No response from S&S API. Please check your internet connection.");
      } else {
        throw error;
      }
    }
  }

  async searchProducts({ query, category, brand, limit = 20 }) {
    try {
      // Use the correct API endpoint: /v2/products/?style={query}
      const params = {};
      
      if (query) {
        params.style = query;
      }
      
      const data = await this.makeApiCall("products/", params);
      
      // Filter results client-side if brand specified
      let filteredData = Array.isArray(data) ? data : [];
      
      if (brand && filteredData.length > 0) {
        filteredData = filteredData.filter(product => 
          product.brandName && product.brandName.toLowerCase().includes(brand.toLowerCase())
        );
      }
      
      if (category && filteredData.length > 0) {
        filteredData = filteredData.filter(product => 
          product.categoryName && product.categoryName.toLowerCase().includes(category.toLowerCase())
        );
      }
      
      // Apply limit
      if (limit && filteredData.length > limit) {
        filteredData = filteredData.slice(0, limit);
      }
      
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              totalResults: filteredData.length,
              query: query,
              brand: brand || null,
              category: category || null,
              products: filteredData
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to search products: ${error.message}`);
    }
  }

  async getProductDetails({ styleId }) {
    try {
      // Use the correct API endpoint: /v2/products/{styleId}
      const endpoint = `products/${styleId}`;
      
      const data = await this.makeApiCall(endpoint);
      
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(data || { error: "Product not found" }, null, 2),
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to get product details: ${error.message}`);
    }
  }

  async checkInventory({ styleIds, warehouse }) {
    try {
      // Use the correct API endpoint: /v2/inventory/{styleIds}
      const endpoint = `inventory/${styleIds.join(",")}`;
      const params = {};
      
      if (warehouse) {
        params.Warehouses = warehouse;
      }

      const data = await this.makeApiCall(endpoint, params);
      
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to check inventory: ${error.message}`);
    }
  }

  async getPricing({ styleIds, quantity = 1 }) {
    try {
      // Use the products endpoint with specific fields for pricing
      const endpoint = `products/${styleIds.join(",")}`;
      const params = {
        fields: "sku,brandName,styleName,mapPrice,piecePrice,dozenPrice,casePrice,customerPrice"
      };

      const data = await this.makeApiCall(endpoint, params);
      
      // Extract and format pricing information
      const pricingData = Array.isArray(data) ? data.map(product => ({
        sku: product.sku,
        brandName: product.brandName,
        styleName: product.styleName,
        mapPrice: product.mapPrice,
        piecePrice: product.piecePrice,
        dozenPrice: product.dozenPrice,
        casePrice: product.casePrice,
        customerPrice: product.customerPrice,
        quantity: quantity,
      })) : (data ? [data] : []);
      
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              requestedQuantity: quantity,
              pricingData: pricingData
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to get pricing: ${error.message}`);
    }
  }

  async downloadProductData({ format = "csv", includeInventory = true }) {
    try {
      // For product data export, get all products from the correct endpoint
      const endpoint = "products/";
      const params = {};
      
      // Add fields parameter if we want to limit data
      if (!includeInventory) {
        params.fields = "sku,brandName,styleName,colorName,sizeName,mapPrice,piecePrice";
      }
      
      const data = await this.makeApiCall(endpoint, params);
      
      // If CSV format requested, convert data
      if (format === "csv" && Array.isArray(data)) {
        const csvData = this.convertToCSV(data);
        return {
          content: [
            {
              type: "text",
              text: csvData,
            },
          ],
        };
      }
      
      return {
        content: [
          {
            type: "text",
            text: typeof data === "string" ? data : JSON.stringify(data, null, 2),
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to download product data: ${error.message}`);
    }
  }
  
  // Helper function to convert JSON to CSV
  convertToCSV(data) {
    if (!Array.isArray(data) || data.length === 0) {
      return "No data available";
    }
    
    // Flatten nested objects for CSV export
    const flattenedData = data.map(item => {
      const flattened = {};
      
      Object.keys(item).forEach(key => {
        if (Array.isArray(item[key])) {
          // Handle arrays (like warehouses) by joining or creating separate columns
          if (key === 'warehouses' && item[key].length > 0) {
            const warehouse = item[key][0]; // Take first warehouse for main columns
            flattened[`${key}_qty`] = warehouse.qty || 0;
            flattened[`${key}_warehouse`] = warehouse.warehouseAbbr || '';
            flattened[`${key}_closeout`] = warehouse.closeout || false;
          } else {
            flattened[key] = JSON.stringify(item[key]);
          }
        } else if (typeof item[key] === 'object' && item[key] !== null) {
          // Flatten nested objects
          Object.keys(item[key]).forEach(subKey => {
            flattened[`${key}_${subKey}`] = item[key][subKey];
          });
        } else {
          flattened[key] = item[key];
        }
      });
      
      return flattened;
    });
    
    const headers = Object.keys(flattenedData[0]);
    const csvHeaders = headers.join(",");
    
    const csvRows = flattenedData.map(row => {
      return headers.map(header => {
        const value = row[header];
        // Escape quotes and wrap in quotes if contains comma
        if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value !== null && value !== undefined ? value : '';
      }).join(",");
    });
    
    return [csvHeaders, ...csvRows].join("\n");
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("S&S Activewear MCP server is running");
  }
}

// Initialize and run the server
const server = new SSActivewearServer();
server.run().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
