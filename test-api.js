#!/usr/bin/env node

// Quick test script for S&S Activewear MCP
// Run with: node test-api.js

import axios from 'axios';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env') });

const SS_API_BASE_URL = "https://api-ca.ssactivewear.com/v2";

async function testDirectAPI() {
  console.log("\n=== Testing S&S Activewear API Directly ===\n");
  
  const accountNumber = process.env.SS_ACCOUNT_NUMBER;
  const apiKey = process.env.SS_API_KEY;
  
  if (!accountNumber || !apiKey) {
    console.error("❌ Missing credentials. Please set SS_ACCOUNT_NUMBER and SS_API_KEY in .env file");
    return;
  }
  
  console.log(`✓ Account Number: ${accountNumber}`);
  console.log(`✓ API Key: ${apiKey.substring(0, 4)}****\n`);
  
  const authString = Buffer.from(`${accountNumber}:${apiKey}`).toString('base64');
  
  // Test 1: Get a known product (from documentation)
  console.log("Test 1: Fetching known product B00760004...");
  try {
    const response = await axios({
      method: 'GET',
      url: `${SS_API_BASE_URL}/products/B00760004`,
      params: { mediatype: 'json' },
      headers: {
        'Authorization': `Basic ${authString}`,
        'Accept': 'application/json',
        'User-Agent': 'SS-Test/1.0'
      }
    });
    
    console.log("✅ Success! Got response:");
    console.log(`- Status: ${response.status}`);
    console.log(`- Content-Type: ${response.headers['content-type']}`);
    console.log("- Data preview:", JSON.stringify(response.data).substring(0, 200) + "...");
    
    if (response.data) {
      const product = Array.isArray(response.data) ? response.data[0] : response.data;
      if (product) {
        console.log("\nProduct details:");
        console.log(`- SKU: ${product.sku}`);
        console.log(`- Brand: ${product.brandName}`);
        console.log(`- Style: ${product.styleName}`);
        console.log(`- Color: ${product.colorName}`);
        if (product.warehouses && product.warehouses.length > 0) {
          console.log("- Inventory:", product.warehouses.map(w => `${w.warehouseAbbr}: ${w.qty}`).join(", "));
        }
      }
    }
  } catch (error) {
    console.error("❌ Failed:", error.response?.status, error.response?.statusText);
    if (error.response?.data) {
      console.error("Response:", error.response.data);
    }
  }
  
  // Test 2: Test style search
  console.log("\n\nTest 2: Searching for style 2000...");
  try {
    const response = await axios({
      method: 'GET',
      url: `${SS_API_BASE_URL}/products/`,
      params: { 
        mediatype: 'json',
        style: '2000'
      },
      headers: {
        'Authorization': `Basic ${authString}`,
        'Accept': 'application/json',
        'User-Agent': 'SS-Test/1.0'
      }
    });
    
    console.log("✅ Success! Got response:");
    console.log(`- Status: ${response.status}`);
    console.log(`- Products found: ${Array.isArray(response.data) ? response.data.length : 1}`);
    
    if (Array.isArray(response.data) && response.data.length > 0) {
      console.log("- First few products:");
      response.data.slice(0, 3).forEach(p => {
        console.log(`  • ${p.sku} - ${p.brandName} ${p.styleName} ${p.colorName}`);
      });
    }
  } catch (error) {
    console.error("❌ Failed:", error.response?.status, error.response?.statusText);
    if (error.response?.data) {
      console.error("Response:", error.response.data);
    }
  }
  
  // Test 3: Test invalid product
  console.log("\n\nTest 3: Testing error handling with invalid product...");
  try {
    const response = await axios({
      method: 'GET',
      url: `${SS_API_BASE_URL}/products/INVALID123`,
      params: { mediatype: 'json' },
      headers: {
        'Authorization': `Basic ${authString}`,
        'Accept': 'application/json',
        'User-Agent': 'SS-Test/1.0'
      },
      validateStatus: () => true // Don't throw on any status
    });
    
    if (response.status === 404) {
      console.log("✅ Correctly returned 404 for invalid product");
      if (response.data?.errors) {
        console.log("- Error message:", response.data.errors[0]?.message);
      }
    } else {
      console.log(`⚠️  Unexpected status: ${response.status}`);
      console.log("Response:", response.data);
    }
  } catch (error) {
    console.error("❌ Failed:", error.message);
  }
  
  // Test 4: Multiple products
  console.log("\n\nTest 4: Fetching multiple products...");
  try {
    const response = await axios({
      method: 'GET',
      url: `${SS_API_BASE_URL}/products/B00760004,B00760005`,
      params: { mediatype: 'json' },
      headers: {
        'Authorization': `Basic ${authString}`,
        'Accept': 'application/json',
        'User-Agent': 'SS-Test/1.0'
      }
    });
    
    console.log("✅ Success! Got response:");
    console.log(`- Products returned: ${Array.isArray(response.data) ? response.data.length : 1}`);
    
    if (Array.isArray(response.data)) {
      response.data.forEach(p => {
        console.log(`  • ${p.sku} - ${p.brandName} ${p.styleName} ${p.colorName}`);
      });
    }
  } catch (error) {
    console.error("❌ Failed:", error.response?.status, error.response?.statusText);
  }
  
  console.log("\n\n=== API Tests Complete ===");
  console.log("\nNext steps:");
  console.log("1. If tests passed, the MCP server should work");
  console.log("2. Enable DEBUG=true in your MCP config to see detailed logs");
  console.log("3. Try searching for 'B00760004' or '2000' in Claude");
}

// Run the tests
testDirectAPI().catch(console.error);
