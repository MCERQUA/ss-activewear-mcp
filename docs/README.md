# S&S Activewear API Documentation

This folder contains the complete documentation for the S&S Activewear API (Canadian version).

## Overview

The S&S Activewear REST API provides access to product catalogs, inventory, ordering, and related functionality.

**Base URL**: `https://api-ca.ssactivewear.com/v2/`

**Authentication**: 
- Username: Account Number
- Password: API Key

**Rate Limiting**: 60 requests per minute

## Documentation Structure

### Products
- [Categories](./products/categories.md) - GET - Product categories
- [Styles](./products/styles.md) - GET - Product styles
- [Products](./products/products.md) - GET - Product details
- [Inventory](./products/inventory.md) - GET - Inventory levels
- [Specs](./products/specs.md) - GET - Product specifications
- [Brands](./products/brands.md) - GET - Brand information

### Orders
- [Orders GET](./orders/orders-get.md) - GET - Retrieve orders
- [Orders DELETE](./orders/orders-delete.md) - DELETE - Cancel orders
- [Orders POST](./orders/orders-post.md) - POST - Create orders
- [Payment Profiles](./orders/payment-profiles.md) - GET - Payment profile information
- [Invoices](./orders/invoices.md) - GET - Invoice information

### Returns
- [Returns GET](./returns/returns-get.md) - GET - Retrieve returns
- [Returns POST](./returns/returns-post.md) - POST - Create returns
- [Returns DELETE](./returns/returns-delete.md) - DELETE - Cancel returns

### Cross Reference
- [CrossRef GET](./crossref/crossref-get.md) - GET - Retrieve cross references
- [CrossRef PUT](./crossref/crossref-put.md) - PUT - Update cross references
- [CrossRef DELETE](./crossref/crossref-delete.md) - DELETE - Remove cross references

### Logistics
- [Days In Transit](./logistics/days-in-transit.md) - GET - Shipping transit times
- [Tracking Data](./logistics/tracking-data.md) - GET - Package tracking information

### Help & Support
- [Code Examples](./help/code-examples.md) - Code samples and examples
- [Error Codes](./help/errors.md) - Error codes and troubleshooting

## Getting Started

1. Obtain your API credentials from your S&S Activewear account
2. Review the code examples in the help section
3. Start with basic product queries to familiarize yourself with the API
4. Implement proper error handling and rate limiting in your application

## Support

- Email: api-ca@ssactivewear.com
- Status Page: https://status.ssactivewear.com
- Customer Site: https://en-ca.ssactivewear.com
