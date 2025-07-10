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
    
    if (process.env.DEBUG === "true") {
      console.error(`Making API call to: ${baseUrl}/${endpoint}`);
    }

    try {
      const response = await axios({
        method: "GET",
        url: `${baseUrl}/${endpoint}`,
        auth: {
          username: accountNumber,
          password: apiKey,
        },
        params,
        headers: {
          "Accept": "application/json",
          "User-Agent": "SS-Activewear-MCP/1.0",
        },
        timeout: 30000, // 30 second timeout
      });

      return response.data;
    } catch (error) {
      if (error.response) {
        // API returned an error response
        throw new Error(`S&S API Error: ${error.response.status} - ${error.response.statusText}`);
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
      const params = {
        q: query,
        limit,
      };
      
      if (category) params.category = category;
      if (brand) params.brand = brand;

      const data = await this.makeApiCall("Products", params);
      
      // Format the response for better readability
      const formattedData = {
        totalResults: data.totalResults || data.length,
        products: data.products || data,
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
      const data = await this.makeApiCall(`Products/${styleId}`);
      
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to get product details: ${error.message}`);
    }
  }

  async checkInventory({ styleIds, warehouse }) {
    try {
      const params = {
        styleIds: styleIds.join(","),
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
      const params = {
        styleIds: styleIds.join(","),
        quantity,
      };

      const data = await this.makeApiCall("Pricing", params);
      
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to get pricing: ${error.message}`);
    }
  }

  async downloadProductData({ format = "csv", includeInventory = true }) {
    try {
      // For CSV downloads, S&S typically provides a different endpoint
      const endpoint = format === "csv" ? "Products/Export" : "Products";
      const params = {
        format,
        includeInventory,
      };

      const data = await this.makeApiCall(endpoint, params);
      
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