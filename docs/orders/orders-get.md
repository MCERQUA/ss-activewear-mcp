# Orders API - GET

The Orders API gives information about previous and pending orders.

## Resource URL

```
GET https://api-ca.ssactivewear.com/v2/orders/
```

## Request Options

| Option | Endpoint | Description |
|--------|----------|-------------|
| **Get All Open** | `/v2/orders/` | Returns all orders that have not been invoiced |
| **Get All (3 months)** | `/v2/orders/?All=True` | Returns all orders placed in last 3 months |
| **Filter Results** | `/v2/orders/{order}` | Returns orders matching filter condition<br><br>`{order}` = comma separated list of order identifiers<br>`identifiers` = PONumber, OrderNumber, InvoiceNumber, GUID |
| **Filter by Invoice Date** | `/v2/orders/?invoicedate={invoicedate}` | Returns orders by invoice date<br><br>`{invoicedate}` = date format yyyy-MM-dd |
| **Date Range Filter** | `/v2/orders/?invoicestartdate={start}&invoiceenddate={end}` | Returns orders within date range<br><br>Both start and end dates required (yyyy-MM-dd) |
| **Filter by Shipping Label** | `/v2/orders/?shippinglabelbarcode={barcode}` | Returns orders by shipping label barcode<br><br>`{barcode}` = format InvoiceNumber.BoxNumberLane |
| **Filter Fields** | `/v2/orders/?fields={fields}` | Returns only requested fields<br><br>`{fields}` = comma separated list of order object fields |
| **Include Lines** | `/v2/orders/?lines=true` | Returns the order lines for each order |
| **Include Boxes** | `/v2/orders/?Boxes=true` | Returns the order boxes for each order |
| **Include AR Child Invoices** | `/v2/orders/?includeARChildInvoices=true` | Returns orders for primary and child accounts |
| **Include Billing Address** | `/v2/orders/?Billing=true` | Returns the billing address for each order |
| **Response Format** | `/v2/orders/?mediatype={mediatype}` | Determines response type<br><br>`{mediatype}` = json or xml (Default=json) |

## Example Request

```
GET https://api-ca.ssactivewear.com/v2/orders/4629304
```

## Example Response

```json
[
   {
     "guid": "e66b7667-868f-4ae0-b605-2f45fbd288c0",
     "companyName":"Montreal",
     "warehouseAbbr":"IL",
     "orderNumber": "4629304",
     "invoiceNumber": "907070",
     "poNumber": "Jim B",
     "customerNumber": "00002",
     "orderDate": "2014-06-18T10:59:06.43",
     "shipDate": "2014-06-18T14:15:31.613",
     "invoiceDate": "2014-06-18T00:00:00",
     "orderType": "CSR",
     "terms": "Credit Card",
     "orderStatus": "Shipped",
     "dropship": false,
     "shippingCarrier": "UPS",
     "shippingMethod": "Ground",
     "shipBlind": false,
     "shippingCollectNumber": "",
     "trackingNumber": "1ZE9W0610315091599",
     "shippingAddress": {
       "customer": "Timesaver",
       "attn": "Jim Beale",
       "address": "W8020 W Clay School Rd",
       "city": "Merrillan",
       "state": "WI",
       "zip": "54754"
     },
     "subtotal": 144.38,
     "shipping": 0,
     "shippingSaved": 0.00,
     "cod": 0,
     "tax": 0,
     "smallOrderFee": 0,
     "cuponDiscount": 0,
     "sampleDiscount": 0,
     "setUpFee": 0,
     "restockFee": 0,
     "debitCredit": 0,
     "total": 144.38,
     "totalPieces": 30,
     "totalLines": 18,
     "totalWeight": 17.35,
     "totalBoxes": 1
   }
]
```

## Order Object Definition

| Field | Type | Description |
|-------|------|-------------|
| `guid` | String | Unique ID for this order (does not change) |
| `companyName` | String | Company name |
| `warehouseAbbr` | String | Warehouse code (see warehouse list below) |
| `orderNumber` | String | Order and confirmation number assigned when orders are placed |
| `invoiceNumber` | String | Invoice number assigned after order placement |
| `poNumber` | String | PO number submitted with the order |
| `customerNumber` | String | Customer number of account |
| `orderDate` | DateTime | Date order was placed (ISO 8601 format) |
| `shipDate` | DateTime | Date order was shipped (available after shipping) |
| `invoiceDate` | DateTime | Date order was invoiced (available after invoicing) |
| `orderType` | String | How order was placed (CSR, Web, EDI, Credit) |
| `terms` | String | Terms of the order |
| `orderStatus` | String | Order status (InProgress, Shipped, Completed, Canceled) |
| `dropship` | Boolean | Whether order is a dropship order |
| `shippingCarrier` | String | Carrier used for shipping |
| `shippingMethod` | String | Freight service used |
| `shipBlind` | Boolean | Whether order has blind shipping |
| `shippingCollectNumber` | String | Freight account that was charged |
| `trackingNumber` | String | Tracking number (available after shipping) |
| `shippingAddress` | Object | Shipping address details |
| `billingAddress` | Object | Billing address details (when requested) |
| `subtotal` | Decimal | Merchandise value of the order |
| `shipping` | Decimal | Shipping and handling charged |
| `shippingSaved` | Decimal | Savings between calculated and charged shipping |
| `cod` | Decimal | COD amount |
| `tax` | Decimal | Tax charged |
| `smallOrderFee` | Decimal | Small order fee |
| `cuponDiscount` | Decimal | Miscellaneous discount |
| `sampleDiscount` | Decimal | Sample discount |
| `setUpFee` | Decimal | Setup fee |
| `restockFee` | Decimal | Restock fee |
| `debitCredit` | Decimal | Debit/Credit amount |
| `total` | Decimal | Total order amount |
| `totalPieces` | Integer | Total pieces on order |
| `totalLines` | Integer | Total lines on order |
| `totalWeight` | Decimal | Total weight of order |
| `totalBoxes` | Decimal | Total boxes on the order |
| `deliveryStatus` | String | Current delivery status |
| `lines` | Array | Order line items (when requested) |

## Warehouse Codes

- **IL**: Lockport, IL
- **NV**: Reno, NV
- **NJ**: Robbinsville, NJ
- **KS**: Olathe, KS
- **GA**: McDonough, GA
- **TX**: Fort Worth, TX
- **FL**: Pompano Beach, FL
- **OH**: West Chester, OH
- **DS**: Dropship

## Order Status Values

- **InProgress**: Order received and being prepared for shipment
- **Shipped**: Order has shipped
- **Completed**: Order ready for pickup at Will Call
- **Canceled**: Order is cancelled

## Delivery Status Values

- Picked Up
- Shipped
- Shipped - Delivered
- Shipped - Exception
- Shipped - Expired
- Shipped - In Transit
- Shipped - Out For Delivery
- Shipped - Pending
- Shipped - Unknown

## Usage Examples

### Get all open orders
```bash
curl -X GET "https://api-ca.ssactivewear.com/v2/orders/" \
  -u "account_number:api_key"
```

### Get orders for specific date
```bash
curl -X GET "https://api-ca.ssactivewear.com/v2/orders/?invoicedate=2024-01-15" \
  -u "account_number:api_key"
```

### Get order with line items
```bash
curl -X GET "https://api-ca.ssactivewear.com/v2/orders/4629304?lines=true" \
  -u "account_number:api_key"
```

### Get specific order fields only
```bash
curl -X GET "https://api-ca.ssactivewear.com/v2/orders/?fields=OrderNumber,Total,OrderStatus" \
  -u "account_number:api_key"
```
