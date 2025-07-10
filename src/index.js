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

// S&S Activewear CANADA API configuration
const SS_API_BASE_URL = "https://api-ca.ssactivewear.com/v2";

class SSActivewearCanadaServer {
  constructor() {
    this.server = new Server(
      {
        name: "ss-activewear-canada",
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
    console.error("S&S Activewear CANADA MCP Configuration:");
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
          description: "Search S&S Activewear Canada products by SKU, GTIN, style ID, or style name. For general searches, it will filter from available products.",
          inputSchema: {
            type: "object",
            properties: {
              query: {
                type: "string",
                description: "Search query (SKU like B00760004, GTIN like 00821780008137, style ID, or style name)",
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
          description: "Get detailed information about a specific product including inventory (Canada)",
          inputSchema: {
            type: "object",
            properties: {
              styleId: {
                type: "string",
                description: "The product identifier (SKU, GTIN, or style ID)",
              },
            },
            required: ["styleId"],
          },
        },
        {
          name: "check_inventory",
          description: "Check real-time inventory for specific products (Canadian warehouses: BC, ON)",
          inputSchema: {
            type: "object",
            properties: {
              styleIds: {
                type: "array",
                items: { type: "string" },
                description: "Array of product identifiers (SKU, GTIN, or style ID)",
              },
              warehouse: {
                type: "string",
                description: "Specific Canadian warehouse code (optional): BC, ON",
              },
            },
            required: ["styleIds"],
          },
        },
        {
          name: "get_pricing",
          description: "Get pricing information for products (Canadian pricing)",
          inputSchema: {
            type: "object",
            properties: {
              styleIds: {
                type: "array",
                items: { type: "string" },
                description: "Array of product identifiers to get pricing for",
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
          description: "Download Canadian product catalog data in CSV format",
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
                description: "Include real-time inventory data from Canadian warehouses",
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

  // Helper function to make authenticated API calls to S&S Canada
  async makeApiCall(endpoint, params = {}) {
    const accountNumber = process.env.SS_ACCOUNT_NUMBER;
    const apiKey = process.env.SS_API_KEY;

    if (!accountNumber || !apiKey) {
      throw new Error("S&S Activewear Canada credentials not configured. Please check your .env file.");
    }

    // Construct the full URL
    const fullUrl = `${SS_API_BASE_URL}/${endpoint.replace(/^\//, "")}`;
    
    // CRITICAL: Always add mediatype=json to get JSON responses instead of HTML
    const queryParams = {
      ...params,
      mediatype: "json"
    };
    
    // Create Basic Auth header
    const authString = Buffer.from(`${accountNumber}:${apiKey}`).toString('base64');
    
    if (process.env.DEBUG === "true") {
      console.error(`\n[S&S API] Making request:`);
      console.error(`- URL: ${fullUrl}`);
      console.error(`- Params: ${JSON.stringify(queryParams)}`);
      console.error(`- Auth: Basic (${accountNumber}:****)`);
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
          "User-Agent": "SS-Activewear-Canada-MCP/1.0",
        },
        timeout: 30000,
        validateStatus: function (status) {
          return status < 500; // Don't throw on 4xx errors, we'll handle them
        }
      });

      if (process.env.DEBUG === "true") {
        console.error(`[S&S API] Response:`);
        console.error(`- Status: ${response.status}`);
        console.error(`- Content-Type: ${response.headers['content-type']}`);
        if (response.data && typeof response.data === 'object') {
          const preview = JSON.stringify(response.data).substring(0, 200);
          console.error(`- Data preview: ${preview}...`);
        }
      }

      // Check if we got HTML instead of JSON
      if (typeof response.data === 'string' && response.data.includes('<html>')) {
        throw new Error("Received HTML response instead of JSON. This usually means the endpoint is incorrect or mediatype parameter is missing.");
      }

      // Handle specific HTTP status codes
      if (response.status === 404) {
        throw new Error("Product not found or endpoint does not exist.");
      } else if (response.status === 401) {
        throw new Error("Authentication failed. Please check your account number and API key.");
      } else if (response.status === 403) {
        throw new Error("Access denied. Your account may not have API access.");
      } else if (response.status >= 400) {
        const errorMsg = response.data?.errors?.[0]?.message || response.data?.message || response.statusText;
        throw new Error(`API Error (${response.status}): ${errorMsg}`);
      }

      return this.validateApiResponse(response.data, endpoint);
    } catch (error) {
      if (process.env.DEBUG === "true") {
        console.error("[S&S API] Error:", error.message);
        if (error.response?.data) {
          console.error("Response data:", error.response.data);
        }
      }
      
      if (error.message) {
        throw error;
      } else if (error.request) {
        throw new Error("No response from S&S Canada API. Please check your internet connection.");
      } else {
        throw new Error(`Unexpected error: ${error}`);
      }
    }
  }

  // Validate API responses
  validateApiResponse(response, endpoint) {
    if (!response) {
      throw new Error("Empty response from API");
    }
    
    // Check for error responses
    if (response.errors && Array.isArray(response.errors)) {
      const errorMsg = response.errors.map(e => e.message).join(', ');
      throw new Error(`API returned errors: ${errorMsg}`);
    }
    
    return response;
  }

  // Helper to detect identifier types
  isValidIdentifier(query) {
    if (!query || typeof query !== 'string') return false;
    
    // SKU pattern: Alphanumeric, often starts with letter
    if (/^[A-Z][A-Z0-9]+$/i.test(query)) return true;
    
    // GTIN: 13-14 digits
    if (/^\d{13,14}$/.test(query)) return true;
    
    // Numeric ID (style ID)
    if (/^\d+$/.test(query) && query.length < 10) return true;
    
    return false;
  }

  // Helper to filter products
  filterProducts(products, query, brand, category) {
    if (!Array.isArray(products)) return [];
    
    return products.filter(product => {
      // Create searchable text from product fields
      const searchFields = [
        product.sku,
        product.styleName,
        product.brandName,
        product.colorName,
        product.categoryName,
        product.description
      ].filter(Boolean).join(' ').toLowerCase();
      
      const queryLower = query ? query.toLowerCase() : '';
      const matchesQuery = !query || searchFields.includes(queryLower);
      const matchesBrand = !brand || (product.brandName && 
        product.brandName.toLowerCase().includes(brand.toLowerCase()));
      const matchesCategory = !category || (product.categoryName && 
        product.categoryName.toLowerCase().includes(category.toLowerCase()));
      
      return matchesQuery && matchesBrand && matchesCategory;
    });
  }

  async searchProducts({ query, category, brand, limit = 20 }) {
    try {
      if (process.env.DEBUG === "true") {
        console.error(`\n[Search] Query: "${query}", Brand: "${brand}", Category: "${category}"`);
      }

      // First, check if query is a direct identifier
      if (this.isValidIdentifier(query)) {
        if (process.env.DEBUG === "true") {
          console.error("[Search] Detected as direct identifier, trying product lookup...");
        }
        
        try {
          const data = await this.makeApiCall(`products/${query}`);
          const products = Array.isArray(data) ? data : [data];
          
          return {
            content: [{
              type: "text",
              text: JSON.stringify({
                source: "S&S Activewear Canada",
                searchType: "direct_lookup",
                totalResults: products.length,
                query: query,
                products: products
              }, null, 2)
            }]
          };
        } catch (error) {
          if (process.env.DEBUG === "true") {
            console.error("[Search] Direct lookup failed:", error.message);
          }
          // Continue to other search methods
        }
      }
      
      // Try style name search if query looks like a style
      if (/^\d{3,4}[A-Z]?$/i.test(query)) {
        if (process.env.DEBUG === "true") {
          console.error("[Search] Query looks like style name, trying style search...");
        }
        
        const params = { style: query };
        const data = await this.makeApiCall("products/", params);
        let products = Array.isArray(data) ? data : [];
        
        // Apply additional filters if specified
        if (brand || category) {
          products = this.filterProducts(products, null, brand, category);
        }
        
        if (limit && products.length > limit) {
          products = products.slice(0, limit);
        }
        
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              source: "S&S Activewear Canada",
              searchType: "style_name",
              totalResults: products.length,
              query: query,
              brand: brand || null,
              category: category || null,
              products: products
            }, null, 2)
          }]
        };
      }
      
      // For general searches, we need to get products and filter
      // S&S API doesn't have a general search endpoint
      if (process.env.DEBUG === "true") {
        console.error("[Search] General search - will retrieve products and filter client-side");
      }
      
      // Get products (this might be limited by the API)
      const data = await this.makeApiCall("products/");
      let products = Array.isArray(data) ? data : [];
      
      if (process.env.DEBUG === "true") {
        console.error(`[Search] Retrieved ${products.length} products to filter`);
      }
      
      // Apply filters
      products = this.filterProducts(products, query, brand, category);
      
      if (process.env.DEBUG === "true") {
        console.error(`[Search] After filtering: ${products.length} products match criteria`);
      }
      
      // Apply limit
      if (limit && products.length > limit) {
        products = products.slice(0, limit);
      }
      
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            source: "S&S Activewear Canada",
            searchType: "filtered",
            totalResults: products.length,
            query: query,
            brand: brand || null,
            category: category || null,
            products: products
          }, null, 2)
        }]
      };
    } catch (error) {
      throw new Error(`Failed to search S&S Canada products: ${error.message}`);
    }
  }

  async getProductDetails({ styleId }) {
    try {
      // Clean and validate the identifier
      const identifier = styleId.trim();
      
      if (!identifier) {
        throw new Error("Product identifier is required");
      }
      
      if (process.env.DEBUG === "true") {
        console.error(`\n[Product Details] Looking up: "${identifier}"`);
      }
      
      // Make the API call
      const endpoint = `products/${identifier}`;
      const data = await this.makeApiCall(endpoint);
      
      // Handle both single product and array responses
      const productData = Array.isArray(data) ? data[0] : data;
      
      if (!productData) {
        throw new Error("Product not found");
      }
      
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            source: "S&S Activewear Canada",
            identifier: identifier,
            product: productData
          }, null, 2)
        }]
      };
    } catch (error) {
      // Provide helpful error messages
      if (error.message.includes("404") || error.message.includes("not found")) {
        throw new Error(`Product '${styleId}' not found. Please check the SKU, GTIN, or Style ID.`);
      }
      throw new Error(`Failed to get product details: ${error.message}`);
    }
  }

  async checkInventory({ styleIds, warehouse }) {
    try {
      if (!styleIds || styleIds.length === 0) {
        throw new Error("At least one product identifier is required");
      }
      
      if (process.env.DEBUG === "true") {
        console.error(`\n[Inventory] Checking for: ${styleIds.join(", ")}`);
        if (warehouse) console.error(`[Inventory] Warehouse filter: ${warehouse}`);
      }
      
      // S&S API pattern: Get product details which include inventory
      const identifiers = styleIds.join(",");
      const endpoint = `products/${identifiers}`;
      
      const params = {};
      
      // Add warehouse filter if specified
      if (warehouse) {
        const canadianWarehouses = ['BC', 'ON'];
        if (canadianWarehouses.includes(warehouse.toUpperCase())) {
          params.Warehouses = warehouse.toUpperCase();
        } else {
          throw new Error(`Invalid warehouse. Canadian warehouses: ${canadianWarehouses.join(', ')}`);
        }
      }
      
      const data = await this.makeApiCall(endpoint, params);
      
      // Extract inventory data from product response
      const products = Array.isArray(data) ? data : [data];
      
      const inventoryData = products.map(product => ({
        sku: product.sku,
        brandName: product.brandName,
        styleName: product.styleName,
        colorName: product.colorName,
        sizeName: product.sizeName,
        warehouses: product.warehouses || [],
        totalQty: product.warehouses ? 
          product.warehouses.reduce((sum, w) => sum + (w.qty || 0), 0) : 0
      }));
      
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            source: "S&S Activewear Canada",
            warehouse: warehouse || "All Canadian warehouses",
            inventoryDate: new Date().toISOString(),
            inventory: inventoryData
          }, null, 2)
        }]
      };
    } catch (error) {
      throw new Error(`Failed to check inventory: ${error.message}`);
    }
  }

  async getPricing({ styleIds, quantity = 1 }) {
    try {
      if (!styleIds || styleIds.length === 0) {
        throw new Error("At least one product identifier is required");
      }
      
      if (process.env.DEBUG === "true") {
        console.error(`\n[Pricing] Getting prices for: ${styleIds.join(", ")}`);
        console.error(`[Pricing] Quantity: ${quantity}`);
      }
      
      // Use the products endpoint with specific fields for pricing
      const endpoint = `products/${styleIds.join(",")}`;
      const params = {
        fields: "sku,brandName,styleName,colorName,sizeName,mapPrice,piecePrice,dozenPrice,casePrice,customerPrice"
      };

      const data = await this.makeApiCall(endpoint, params);
      
      // Extract and format pricing information
      const products = Array.isArray(data) ? data : [data];
      
      const pricingData = products.map(product => ({
        sku: product.sku,
        brandName: product.brandName,
        styleName: product.styleName,
        colorName: product.colorName,
        sizeName: product.sizeName,
        pricing: {
          mapPrice: product.mapPrice,
          piecePrice: product.piecePrice,
          dozenPrice: product.dozenPrice,
          casePrice: product.casePrice,
          customerPrice: product.customerPrice,
          quantity: quantity,
          currency: "CAD"
        }
      }));
      
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            source: "S&S Activewear Canada",
            currency: "CAD",
            requestedQuantity: quantity,
            pricingDate: new Date().toISOString(),
            products: pricingData
          }, null, 2)
        }]
      };
    } catch (error) {
      throw new Error(`Failed to get pricing: ${error.message}`);
    }
  }

  async downloadProductData({ format = "csv", includeInventory = true }) {
    try {
      if (process.env.DEBUG === "true") {
        console.error(`\n[Download] Format: ${format}, Include inventory: ${includeInventory}`);
      }
      
      // Get products from S&S Canada catalog
      const endpoint = "products/";
      const params = {};
      
      // Add fields parameter if we want to limit data
      if (!includeInventory) {
        params.fields = "sku,brandName,styleName,colorName,sizeName,mapPrice,piecePrice";
      }
      
      const data = await this.makeApiCall(endpoint, params);
      
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error("No product data available");
      }
      
      if (process.env.DEBUG === "true") {
        console.error(`[Download] Retrieved ${data.length} products`);
      }
      
      // If CSV format requested, convert data
      if (format === "csv") {
        const csvData = this.convertToCSV(data);
        return {
          content: [{
            type: "text",
            text: csvData
          }]
        };
      }
      
      // For other formats, return as JSON
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            source: "S&S Activewear Canada",
            format: format,
            includeInventory: includeInventory,
            exportDate: new Date().toISOString(),
            totalProducts: data.length,
            data: data
          }, null, 2)
        }]
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
          // Handle arrays (like warehouses)
          if (key === 'warehouses' && item[key].length > 0) {
            // Find Canadian warehouses first (BC, ON)
            const canadianWarehouse = item[key].find(w => ['BC', 'ON'].includes(w.warehouseAbbr)) || item[key][0];
            flattened[`${key}_qty`] = canadianWarehouse.qty || 0;
            flattened[`${key}_warehouse`] = canadianWarehouse.warehouseAbbr || '';
            flattened[`${key}_closeout`] = canadianWarehouse.closeout || false;
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
    console.error("S&S Activewear CANADA MCP server is running");
  }
}

// Initialize and run the server
const server = new SSActivewearCanadaServer();
server.run().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});