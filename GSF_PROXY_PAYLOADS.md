# GSF ALV Proxy Service - Payload Examples

Based on the actual curl command structure for the GSF ALV Proxy Service endpoint.

## Base Endpoint

```
POST http://localhost:8080/gsf/alv/businessareas/{businessArea}/subjectareas/{subjectArea}/proxy/Invoke
```

## Required Headers

All requests must include these headers:

```bash
-H "Accept: application/json"
-H "Content-Type: application/json"
-H "X-Gsf-Apptoken: {token}:{salt}:{timestamp}:{version}"
-H "peerAppId: {your-app-id}"
```

---

## 1. Empty Request (Minimal)

The simplest valid request with an empty JSON object.

### Payload
```json
{}
```

### Complete Curl Command
```bash
curl -X POST "http://localhost:8080/gsf/alv/businessareas/utility/subjectareas/alv/proxy/Invoke" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "X-Gsf-Apptoken: R90VjbDpMmwNVDe7fqt6posoTD/PieP+ixdlvpLRejs=:ubv9h2c35y6k6vcdximq:1711252273377:1" \
  -H "peerAppId: 136848" \
  -d '{}'
```

### Use Case
- Default operation execution
- Health check
- Testing connectivity

---

## 2. Generic Service Invocation

Invoke a specific service and method.

### Payload
```json
{
  "service": "DataService",
  "method": "execute"
}
```

### Complete Curl Command
```bash
curl -X POST "http://localhost:8080/gsf/alv/businessareas/utility/subjectareas/alv/proxy/Invoke" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "X-Gsf-Apptoken: R90VjbDpMmwNVDe7fqt6posoTD/PieP+ixdlvpLRejs=:ubv9h2c35y6k6vcdximq:1711252273377:1" \
  -H "peerAppId: 136848" \
  -d '{
    "service": "DataService",
    "method": "execute"
  }'
```

---

## 3. Service with Parameters

Invoke a service with specific parameters.

### Payload
```json
{
  "service": "DataService",
  "method": "query",
  "parameters": {
    "entityType": "sales",
    "filters": {
      "year": "2024",
      "region": "AMER"
    }
  }
}
```

### Complete Curl Command
```bash
curl -X POST "http://localhost:8080/gsf/alv/businessareas/utility/subjectareas/alv/proxy/Invoke" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "X-Gsf-Apptoken: R90VjbDpMmwNVDe7fqt6posoTD/PieP+ixdlvpLRejs=:ubv9h2c35y6k6vcdximq:1711252273377:1" \
  -H "peerAppId: 136848" \
  -d '{
    "service": "DataService",
    "method": "query",
    "parameters": {
      "entityType": "sales",
      "filters": {
        "year": "2024",
        "region": "AMER"
      }
    }
  }'
```

---

## 4. Operation-Based Request

Use operation field to specify the action.

### Payload
```json
{
  "operation": "query",
  "dimensions": ["COUNTRY", "FISCAL_YEAR"],
  "measures": ["SALES_AMOUNT"]
}
```

### Complete Curl Command
```bash
curl -X POST "http://localhost:8080/gsf/alv/businessareas/utility/subjectareas/alv/proxy/Invoke" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "X-Gsf-Apptoken: R90VjbDpMmwNVDe7fqt6posoTD/PieP+ixdlvpLRejs=:ubv9h2c35y6k6vcdximq:1711252273377:1" \
  -H "peerAppId: 136848" \
  -d '{
    "operation": "query",
    "dimensions": ["COUNTRY", "FISCAL_YEAR"],
    "measures": ["SALES_AMOUNT"]
  }'
```

---

## 5. Query with Filters

Query data with dimension filters.

### Payload
```json
{
  "operation": "query",
  "dimensions": ["COUNTRY", "FISCAL_YEAR"],
  "measures": ["SALES_AMOUNT", "SALES_UNITS"],
  "filters": {
    "COUNTRY": ["USA", "Canada"],
    "FISCAL_YEAR": ["2024"]
  }
}
```

### Complete Curl Command
```bash
curl -X POST "http://localhost:8080/gsf/alv/businessareas/utility/subjectareas/alv/proxy/Invoke" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "X-Gsf-Apptoken: R90VjbDpMmwNVDe7fqt6posoTD/PieP+ixdlvpLRejs=:ubv9h2c35y6k6vcdximq:1711252273377:1" \
  -H "peerAppId: 136848" \
  -d '{
    "operation": "query",
    "dimensions": ["COUNTRY", "FISCAL_YEAR"],
    "measures": ["SALES_AMOUNT", "SALES_UNITS"],
    "filters": {
      "COUNTRY": ["USA", "Canada"],
      "FISCAL_YEAR": ["2024"]
    }
  }'
```

---

## 6. Metadata Request

Request metadata information.

### Payload
```json
{
  "operation": "getMetadata",
  "entity": "cube",
  "entityId": "100001"
}
```

### Complete Curl Command
```bash
curl -X POST "http://localhost:8080/gsf/alv/businessareas/utility/subjectareas/alv/proxy/Invoke" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "X-Gsf-Apptoken: R90VjbDpMmwNVDe7fqt6posoTD/PieP+ixdlvpLRejs=:ubv9h2c35y6k6vcdximq:1711252273377:1" \
  -H "peerAppId: 136848" \
  -d '{
    "operation": "getMetadata",
    "entity": "cube",
    "entityId": "100001"
  }'
```

---

## 7. RPC-Style Request

JSON-RPC 2.0 style request format.

### Payload
```json
{
  "jsonrpc": "2.0",
  "method": "invoke",
  "params": {
    "action": "execute",
    "data": {}
  },
  "id": 1
}
```

### Complete Curl Command
```bash
curl -X POST "http://localhost:8080/gsf/alv/businessareas/utility/subjectareas/alv/proxy/Invoke" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "X-Gsf-Apptoken: R90VjbDpMmwNVDe7fqt6posoTD/PieP+ixdlvpLRejs=:ubv9h2c35y6k6vcdximq:1711252273377:1" \
  -H "peerAppId: 136848" \
  -d '{
    "jsonrpc": "2.0",
    "method": "invoke",
    "params": {
      "action": "execute",
      "data": {}
    },
    "id": 1
  }'
```

---

## 8. Query with Options

Query with pagination and sorting options.

### Payload
```json
{
  "operation": "query",
  "dimensions": ["COUNTRY", "PARTNER"],
  "measures": ["SALES_AMOUNT"],
  "filters": {
    "FISCAL_YEAR": ["2024"]
  },
  "options": {
    "limit": 100,
    "offset": 0,
    "sort": {
      "field": "SALES_AMOUNT",
      "direction": "DESC"
    }
  }
}
```

### Complete Curl Command
```bash
curl -X POST "http://localhost:8080/gsf/alv/businessareas/utility/subjectareas/alv/proxy/Invoke" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "X-Gsf-Apptoken: R90VjbDpMmwNVDe7fqt6posoTD/PieP+ixdlvpLRejs=:ubv9h2c35y6k6vcdximq:1711252273377:1" \
  -H "peerAppId: 136848" \
  -d '{
    "operation": "query",
    "dimensions": ["COUNTRY", "PARTNER"],
    "measures": ["SALES_AMOUNT"],
    "filters": {
      "FISCAL_YEAR": ["2024"]
    },
    "options": {
      "limit": 100,
      "offset": 0,
      "sort": {
        "field": "SALES_AMOUNT",
        "direction": "DESC"
      }
    }
  }'
```

---

## 9. Different Business Areas

### MCP Playground

```bash
curl -X POST "http://localhost:8080/gsf/alv/businessareas/mcp-playground/subjectareas/playground/proxy/Invoke" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "X-Gsf-Apptoken: R90VjbDpMmwNVDe7fqt6posoTD/PieP+ixdlvpLRejs=:ubv9h2c35y6k6vcdximq:1711252273377:1" \
  -H "peerAppId: 136848" \
  -d '{
    "operation": "query",
    "dimensions": ["LOB", "COUNTRY"],
    "measures": ["SALES_UNITS"]
  }'
```

### Walle Finance Earnings

```bash
curl -X POST "http://localhost:8080/gsf/alv/businessareas/walle-finance-earnings/subjectareas/finance-earnings/proxy/Invoke" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "X-Gsf-Apptoken: R90VjbDpMmwNVDe7fqt6posoTD/PieP+ixdlvpLRejs=:ubv9h2c35y6k6vcdximq:1711252273377:1" \
  -H "peerAppId: 136848" \
  -d '{
    "operation": "query",
    "dimensions": ["FPH_LEVEL_1_DESC", "FISCAL_YEAR"],
    "measures": ["REVENUE", "COST"]
  }'
```

---

## 10. Batch Request

Execute multiple operations in a single request.

### Payload
```json
{
  "batch": true,
  "requests": [
    {
      "operation": "query",
      "dimensions": ["COUNTRY"],
      "measures": ["SALES_AMOUNT"]
    },
    {
      "operation": "getMetadata",
      "entity": "cube"
    }
  ]
}
```

### Complete Curl Command
```bash
curl -X POST "http://localhost:8080/gsf/alv/businessareas/utility/subjectareas/alv/proxy/Invoke" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "X-Gsf-Apptoken: R90VjbDpMmwNVDe7fqt6posoTD/PieP+ixdlvpLRejs=:ubv9h2c35y6k6vcdximq:1711252273377:1" \
  -H "peerAppId: 136848" \
  -d '{
    "batch": true,
    "requests": [
      {
        "operation": "query",
        "dimensions": ["COUNTRY"],
        "measures": ["SALES_AMOUNT"]
      },
      {
        "operation": "getMetadata",
        "entity": "cube"
      }
    ]
  }'
```

---

## Authentication Details

### X-Gsf-Apptoken Format

The `X-Gsf-Apptoken` header follows this format:
```
{base64EncodedToken}:{salt}:{timestamp}:{version}
```

**Example:**
```
R90VjbDpMmwNVDe7fqt6posoTD/PieP+ixdlvpLRejs=:ubv9h2c35y6k6vcdximq:1711252273377:1
```

**Components:**
- `R90VjbDpMmwNVDe7fqt6posoTD/PieP+ixdlvpLRejs=` - Base64 encoded token
- `ubv9h2c35y6k6vcdximq` - Salt value
- `1711252273377` - Unix timestamp in milliseconds
- `1` - Token version

### peerAppId

The `peerAppId` identifies your application. Example: `136848`

---

## Testing the Endpoint

### 1. Test Connectivity (Empty Request)

```bash
curl -X POST "http://localhost:8080/gsf/alv/businessareas/utility/subjectareas/alv/proxy/Invoke" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "X-Gsf-Apptoken: YOUR_TOKEN_HERE" \
  -H "peerAppId: YOUR_APP_ID" \
  -d '{}'
```

### 2. Test with Verbose Output

```bash
curl -v -X POST "http://localhost:8080/gsf/alv/businessareas/utility/subjectareas/alv/proxy/Invoke" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "X-Gsf-Apptoken: YOUR_TOKEN_HERE" \
  -H "peerAppId: YOUR_APP_ID" \
  -d '{}'
```

### 3. Save Response to File

```bash
curl -X POST "http://localhost:8080/gsf/alv/businessareas/utility/subjectareas/alv/proxy/Invoke" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "X-Gsf-Apptoken: YOUR_TOKEN_HERE" \
  -H "peerAppId: YOUR_APP_ID" \
  -d '{}' \
  -o response.json
```

### 4. Pretty Print Response (with jq)

```bash
curl -X POST "http://localhost:8080/gsf/alv/businessareas/utility/subjectareas/alv/proxy/Invoke" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "X-Gsf-Apptoken: YOUR_TOKEN_HERE" \
  -H "peerAppId: YOUR_APP_ID" \
  -d '{}' | jq '.'
```

---

## Expected Response Formats

### Success Response

```json
{
  "status": "success",
  "data": {
    "rows": [
      {
        "COUNTRY": "USA",
        "FISCAL_YEAR": "2024",
        "SALES_AMOUNT": 1500000
      }
    ],
    "totalRows": 1
  },
  "metadata": {
    "executionTime": 245,
    "timestamp": "2024-03-24T10:30:00Z"
  }
}
```

### Error Response

```json
{
  "status": "error",
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or expired X-Gsf-Apptoken",
    "details": "Token validation failed"
  }
}
```

---

## Common Error Codes

| Code | Description | Solution |
|------|-------------|----------|
| `UNAUTHORIZED` | Invalid or missing authentication | Check X-Gsf-Apptoken and peerAppId headers |
| `BAD_REQUEST` | Invalid payload structure | Verify JSON syntax and required fields |
| `NOT_FOUND` | Business area or subject area not found | Check URL path parameters |
| `FORBIDDEN` | Insufficient permissions | Verify app permissions |
| `INTERNAL_ERROR` | Server error | Contact support with traceId |

---

## Environment Variables Setup

Create a `.env` file for easier testing:

```bash
# .env
GSF_BASE_URL=http://localhost:8080/gsf/alv
GSF_APP_TOKEN=R90VjbDpMmwNVDe7fqt6posoTD/PieP+ixdlvpLRejs=:ubv9h2c35y6k6vcdximq:1711252273377:1
PEER_APP_ID=136848
BUSINESS_AREA=utility
SUBJECT_AREA=alv
```

Then use in scripts:

```bash
source .env

curl -X POST "${GSF_BASE_URL}/businessareas/${BUSINESS_AREA}/subjectareas/${SUBJECT_AREA}/proxy/Invoke" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "X-Gsf-Apptoken: ${GSF_APP_TOKEN}" \
  -H "peerAppId: ${PEER_APP_ID}" \
  -d '{}'
```

---

## Quick Reference

### Minimal Working Example
```bash
curl -X POST "http://localhost:8080/gsf/alv/businessareas/utility/subjectareas/alv/proxy/Invoke" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "X-Gsf-Apptoken: R90VjbDpMmwNVDe7fqt6posoTD/PieP+ixdlvpLRejs=:ubv9h2c35y6k6vcdximq:1711252273377:1" \
  -H "peerAppId: 136848" \
  -d '{}'
```

### Required Headers
1. `Accept: application/json`
2. `Content-Type: application/json`
3. `X-Gsf-Apptoken: {token}`
4. `peerAppId: {appId}`

### Payload Options
- Empty: `{}`
- Service-based: `{"service": "...", "method": "..."}`
- Operation-based: `{"operation": "...", ...}`
- RPC-style: `{"jsonrpc": "2.0", "method": "...", ...}`
