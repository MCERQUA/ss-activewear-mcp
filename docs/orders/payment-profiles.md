# Payment Profiles API

Retrieve payment profile information for your account.

## Resource URL

```
GET https://api-ca.ssactivewear.com/v2/paymentprofiles/
```

## Request Options

| Option | Endpoint | Description |
|--------|----------|-------------|
| **Get All** | `/v2/paymentprofiles/` | Returns all payment profiles |
| **Filter by Type** | `/v2/paymentprofiles/?type={type}` | Returns profiles by payment type |
| **Response Format** | `/v2/paymentprofiles/?mediatype={mediatype}` | Determines response type<br><br>`{mediatype}` = json or xml (Default=json) |

## Example Response

```json
[
  {
    "profileId": "12345",
    "profileName": "Main Credit Card",
    "paymentType": "CreditCard",
    "isDefault": true,
    "lastFour": "1234",
    "expirationDate": "12/25",
    "cardType": "Visa",
    "billingAddress": {
      "customer": "ABC Company",
      "address": "123 Main St",
      "city": "Toronto",
      "state": "ON",
      "zip": "M5V 3A8",
      "country": "CA"
    }
  }
]
```

## Payment Profile Object Definition

| Field | Type | Description |
|-------|------|-------------|
| `profileId` | String | Unique payment profile identifier |
| `profileName` | String | Descriptive name for the payment method |
| `paymentType` | String | Type of payment (CreditCard, ACH, Terms, etc.) |
| `isDefault` | Boolean | Whether this is the default payment method |
| `lastFour` | String | Last four digits of payment method |
| `expirationDate` | String | Expiration date for credit cards |
| `cardType` | String | Credit card type (Visa, MasterCard, etc.) |
| `billingAddress` | Object | Billing address for payment method |

## Payment Types

- **CreditCard**: Credit card payments
- **ACH**: Automated Clearing House (bank transfer)
- **Terms**: Net payment terms
- **COD**: Cash on delivery
- **Prepaid**: Prepaid account balance

## Usage Examples

### Get all payment profiles
```bash
curl -X GET "https://api-ca.ssactivewear.com/v2/paymentprofiles/" \
  -u "account_number:api_key"
```

### Get credit card profiles only
```bash
curl -X GET "https://api-ca.ssactivewear.com/v2/paymentprofiles/?type=CreditCard" \
  -u "account_number:api_key"
```
