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

// S&S Activewear API configuration
const SS_API_BASE_URL = "https://api.ssactivewear.com/V2";
const SS_API_CA_BASE_URL = "https://api-ca.ssactivewear.com/V2";

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
    console.error(`- Region: ${process.env.SS_REGION || "US (default)"}`);
    console.error(`- Debug: ${process.env.DEBUG === "true" ? "Enabled" : "Disabled"}`);
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
    const isCanadian = process.env.SS_REGION === "CA";

    if (!accountNumber || !apiKey) {
      throw new Error("S&S Activewear credentials not configured. Please check your .env file.");
    }

    const baseUrl = isCanadian ? SS_API_CA_BASE_URL : SS_API_BASE_URL;
    
    // Fix endpoint formatting - ensure it has .aspx extension
    if (!endpoint.endsWith('.aspx')) {
      endpoint = endpoint.replace(/\//g, '_') + '.aspx';
    }
    
    const fullUrl = `${baseUrl}/${endpoint}`;
    
    // Create Basic Auth header
    const authString = Buffer.from(`${accountNumber}:${apiKey}`).toString('base64');
    
    if (process.env.DEBUG === "true") {
      console.error(`Making API call to: ${fullUrl}`);
      console.error(`Query params: ${JSON.stringify(params)}`);
      console.error(`Using Basic Auth with account: ${accountNumber}`);
    }

    try {
      const response = await axios({
        method: "GET",
        url: fullUrl,
        params: params,
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
      }

      return response.data;
    } catch (error) {
      if (process.env.DEBUG === "true") {
        console.error("API Error Details:");
        if (error.response) {
          console.error(`Status: ${error.response.status}`);
          console.error(`Status Text: ${error.response.statusText}`);
          console.error(`Response Data: ${JSON.stringify(error.response.data)}`);
          console.error(`Headers: ${JSON.stringify(error.response.headers)}`);
        } else {
          console.error(`Error: ${error.message}`);
        }
      }
      
      if (error.response) {
        // API returned an error response
        const errorMessage = error.response.data?.message || error.response.statusText;
        throw new Error(`S&S API Error: ${error.response.status} - ${errorMessage}`);
      } else if (error.request) {
        // Request was made but no response
        throw new Error("No response from S&S API. Please check your internet connection.");
      } else {
        // Something else went wrong
        throw error;
      }
    }
  }

  async searchProducts({ query, category, brand, limit = 20 }) {
    try {
      // Use the Products endpoint with search parameters
      const params = {
        searchterm: query,
        recordcount: limit,
      };
      
      if (category) params.category = category;
      if (brand) params.brand = brand;

      const data = await this.makeApiCall("Products", params);
      
      // Format the response for better readability
      const formattedData = {
        totalResults: data.length || 0,
        products: data || [],
      };
      
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(formattedData, null, 2),
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to search products: ${error.message}`);
    }
  }

  async getProductDetails({ styleId }) {
    try {
      // Use the Products endpoint with specific style filter
      const params = {
        style: styleId,
      };
      
      const data = await this.makeApiCall("Products", params);
      
      // Return the first product if found
      const product = Array.isArray(data) && data.length > 0 ? data[0] : null;
      
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(product || { error: "Product not found" }, null, 2),
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to get product details: ${error.message}`);
    }
  }

  async checkInventory({ styleIds, warehouse }) {
    try {
      // Use the Inventory endpoint
      const params = {
        style: styleIds.join(","),
      };
      
      if (warehouse) params.warehouse = warehouse;

      const data = await this.makeApiCall("Inventory", params);
      
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
      // Use the Products endpoint to get pricing info
      const params = {
        style: styleIds.join(","),
      };

      const data = await this.makeApiCall("Products", params);
      
      // Extract pricing information
      const pricingData = Array.isArray(data) ? data.map(product => ({
        style: product.style,
        title: product.title,
        basePrice: product.price,
        quantity: quantity,
        // Add volume pricing calculation if available
      })) : [];
      
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(pricingData, null, 2),
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to get pricing: ${error.message}`);
    }
  }

  async downloadProductData({ format = "csv", includeInventory = true }) {
    try {
      // For product data export, use the Products endpoint
      const params = {};
      
      // Get all products (or implement pagination if needed)
      const data = await this.makeApiCall("Products", params);
      
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
    
    const headers = Object.keys(data[0]);
    const csvHeaders = headers.join(",");
    
    const csvRows = data.map(row => {
      return headers.map(header => {
        const value = row[header];
        // Escape quotes and wrap in quotes if contains comma
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
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