# Inventory API

The Inventory API provides real-time inventory levels for all products across Canadian warehouses.

## Resource URL

```
GET https://api-ca.ssactivewear.com/v2/inventory/
```

## Request Options

| Option | Endpoint | Description |
|--------|----------|-------------|
| **Get All** | `/v2/inventory/` | Returns inventory for all products |
| **Filter by Style** | `/v2/inventory/{style}` | Returns inventory for specific styles<br><br>`{style}` = comma separated list of style identifiers |
| **Filter by SKU** | `/v2/inventory/?sku={sku}` | Returns inventory for specific SKUs<br><br>`{sku}` = comma separated list of SKU numbers |
| **Filter by Warehouse** | `/v2/inventory/?warehouse={warehouse}` | Returns inventory for specific warehouse<br><br>`{warehouse}` = BC, ON |
| **Response Format** | `/v2/inventory/?mediatype={mediatype}` | Determines response type<br><br>`{mediatype}` = json or xml (Default=json) |

## Example Request

```
GET https://api-ca.ssactivewear.com/v2/inventory/00760
```

## Inventory Object Definition

| Field | Type | Description |
|-------|------|-------------|
| `sku` | String | Unique product identifier |
| `warehouse` | String | Warehouse code (BC, ON) |
| `quantityAvailable` | Integer | Current available quantity |
| `quantityCommitted` | Integer | Quantity committed to orders |
| `quantityOnHand` | Integer | Total quantity in warehouse |
| `quantityAllocated` | Integer | Quantity allocated for shipment |
| `quantityPending` | Integer | Quantity pending receipt |
| `lastUpdated` | DateTime | Last inventory update timestamp |

## Canadian Warehouses

- **BC**: British Columbia warehouse
- **ON**: Ontario warehouse

## Usage Examples

### Get inventory for a style
```bash
curl -X GET "https://api-ca.ssactivewear.com/v2/inventory/00760" \
  -u "account_number:api_key"
```

### Get inventory for specific SKU
```bash
curl -X GET "https://api-ca.ssactivewear.com/v2/inventory/?sku=0076000001S" \
  -u "account_number:api_key"
```

### Get inventory for Ontario warehouse only
```bash
curl -X GET "https://api-ca.ssactivewear.com/v2/inventory/?warehouse=ON" \
  -u "account_number:api_key"
```

## Important Notes

- Inventory levels are updated in real-time
- Always check `quantityAvailable` for ordering purposes
- Inventory may vary between BC and ON warehouses
- Use warehouse parameter to optimize shipping costs
