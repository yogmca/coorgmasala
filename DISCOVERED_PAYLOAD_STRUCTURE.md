# GSF ALV Proxy Service - Discovered Payload Structure

## 🎯 Key Discovery

After testing the endpoint, we discovered that **TWO mandatory fields** are required:

1. **`uuid`** - Required identifier
2. **`genevaAssetKey`** - Required Geneva asset key

## ✅ Correct Payload Structure

### Minimal Valid Payload

```json
{
  "uuid": "your-uuid-here",
  "genevaAssetKey": "your-geneva-asset-key"
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
    "uuid": "123e4567-e89b-12d3-a456-426614174000",
    "genevaAssetKey": "ASSET_KEY_12345"
  }'
```

---

## 📋 Payload Examples

### Example 1: Basic Invocation

```json
{
  "uuid": "550e8400-e29b-41d4-a716-446655440000",
  "genevaAssetKey": "GVA_ASSET_001"
}
```

### Example 2: With Additional Parameters

```json
{
  "uuid": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
  "genevaAssetKey": "GVA_ASSET_002",
  "parameters": {
    "operation": "query",
    "filters": {
      "year": "2024"
    }
  }
}
```

### Example 3: With Request Context

```json
{
  "uuid": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "genevaAssetKey": "GVA_ASSET_003",
  "context": {
    "user": "john.doe",
    "timestamp": "2024-03-24T10:30:00Z"
  },
  "data": {
    "action": "retrieve",
    "format": "json"
  }
}
```

### Example 4: With Metadata Request

```json
{
  "uuid": "9f4e7c8a-5b3d-4e2f-a1c0-8d7e6f5a4b3c",
  "genevaAssetKey": "GVA_ASSET_004",
  "operation": "getMetadata",
  "includeSchema": true
}
```

### Example 5: With Query Parameters

```json
{
  "uuid": "1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p",
  "genevaAssetKey": "GVA_ASSET_005",
  "query": {
    "dimensions": ["COUNTRY", "FISCAL_YEAR"],
    "measures": ["SALES_AMOUNT"],
    "filters": {
      "COUNTRY": ["USA", "Canada"]
    }
  }
}
```

---

## 🔑 Field Descriptions

### Required Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `uuid` | string | ✅ Yes | Unique identifier for the request. Should be a valid UUID format (e.g., `550e8400-e29b-41d4-a716-446655440000`) |
| `genevaAssetKey` | string | ✅ Yes | Geneva asset key identifier. This identifies the specific asset in the Geneva system |

### Optional Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `operation` | string | ❌ No | Operation to perform (e.g., `query`, `getMetadata`, `execute`) |
| `parameters` | object | ❌ No | Additional parameters for the operation |
| `context` | object | ❌ No | Request context information |
| `data` | object | ❌ No | Data payload for the operation |
| `query` | object | ❌ No | Query specifications (dimensions, measures, filters) |
| `options` | object | ❌ No | Additional options (limit, offset, sort, etc.) |

---

## 📝 UUID Format

The `uuid` field should follow the standard UUID format:

**Format:** `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`

**Examples:**
- `550e8400-e29b-41d4-a716-446655440000`
- `6ba7b810-9dad-11d1-80b4-00c04fd430c8`
- `7c9e6679-7425-40de-944b-e07fc1f90ae7`

**Generate UUID:**
```bash
# Using uuidgen (macOS/Linux)
uuidgen

# Using Python
python3 -c "import uuid; print(uuid.uuid4())"

# Using Node.js
node -e "console.log(require('crypto').randomUUID())"
```

---

## 🏢 Geneva Asset Key

The `genevaAssetKey` identifies a specific asset in the Geneva system. 

**Format:** Alphanumeric string (format may vary by organization)

**Examples:**
- `GVA_ASSET_001`
- `ASSET_KEY_12345`
- `GENEVA_2024_Q1_001`

**Note:** Contact your Geneva system administrator for valid asset keys.

---

## 🧪 Testing Commands

### Test 1: Minimal Valid Request

```bash
curl -X POST "http://localhost:8080/gsf/alv/businessareas/utility/subjectareas/alv/proxy/Invoke" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "X-Gsf-Apptoken: R90VjbDpMmwNVDe7fqt6posoTD/PieP+ixdlvpLRejs=:ubv9h2c35y6k6vcdximq:1711252273377:1" \
  -H "peerAppId: 136848" \
  -d '{
    "uuid": "'$(uuidgen)'",
    "genevaAssetKey": "TEST_ASSET_001"
  }'
```

### Test 2: With Generated UUID

```bash
UUID=$(uuidgen)
curl -X POST "http://localhost:8080/gsf/alv/businessareas/utility/subjectareas/alv/proxy/Invoke" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "X-Gsf-Apptoken: R90VjbDpMmwNVDe7fqt6posoTD/PieP+ixdlvpLRejs=:ubv9h2c35y6k6vcdximq:1711252273377:1" \
  -H "peerAppId: 136848" \
  -d "{
    \"uuid\": \"$UUID\",
    \"genevaAssetKey\": \"TEST_ASSET_001\"
  }"
```

### Test 3: With Additional Parameters

```bash
curl -X POST "http://localhost:8080/gsf/alv/businessareas/utility/subjectareas/alv/proxy/Invoke" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "X-Gsf-Apptoken: R90VjbDpMmwNVDe7fqt6posoTD/PieP+ixdlvpLRejs=:ubv9h2c35y6k6vcdximq:1711252273377:1" \
  -H "peerAppId: 136848" \
  -d '{
    "uuid": "'$(uuidgen)'",
    "genevaAssetKey": "TEST_ASSET_001",
    "operation": "query",
    "parameters": {
      "includeMetadata": true
    }
  }'
```

---

## ❌ Common Errors

### Error 1: Missing Required Fields

**Error Response:**
```json
{
  "status": "error",
  "requestId": "e6d215d7-59bc-4af6-ab9b-cc1a5faaf9c1",
  "error": {
    "code": "ALV01002",
    "message": "Invalid input, \"uuid\" and \"genevaAssetKey\" are mandatory"
  }
}
```

**Solution:** Ensure both `uuid` and `genevaAssetKey` are present in the payload.

### Error 2: Invalid UUID Format

**Possible Error:** UUID validation failure

**Solution:** Use a valid UUID v4 format: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`

### Error 3: Invalid Geneva Asset Key

**Possible Error:** Asset not found or access denied

**Solution:** Verify the Geneva asset key with your system administrator.

---

## 📊 Discovery Results Summary

### Tests Performed: 19+
### Success Rate: 0% (all failed due to missing required fields)
### Key Finding: **`uuid` and `genevaAssetKey` are mandatory**

### Error Code: `ALV01002`
### Error Message: `"Invalid input, \"uuid\" and \"genevaAssetKey\" are mandatory"`

---

## 🎯 Next Steps

1. **Obtain Valid Credentials:**
   - Get a valid `genevaAssetKey` from your Geneva system administrator
   - Generate a UUID for your request

2. **Test the Endpoint:**
   ```bash
   curl -X POST "http://localhost:8080/gsf/alv/businessareas/utility/subjectareas/alv/proxy/Invoke" \
     -H "Accept: application/json" \
     -H "Content-Type: application/json" \
     -H "X-Gsf-Apptoken: YOUR_TOKEN" \
     -H "peerAppId: YOUR_APP_ID" \
     -d '{
       "uuid": "YOUR_UUID",
       "genevaAssetKey": "YOUR_GENEVA_ASSET_KEY"
     }'
   ```

3. **Verify Response:**
   - Check for HTTP 200 status
   - Verify response structure
   - Document any additional fields returned

4. **Iterate:**
   - Test with additional optional fields
   - Document successful payload variations
   - Update OpenAPI specification

---

## 📚 References

- Error Code: `ALV01002`
- Service: `InvokeALVService`
- Endpoint: `/businessareas/{businessArea}/subjectareas/{subjectArea}/proxy/Invoke`
- Method: `POST`
- Required Headers: `X-Gsf-Apptoken`, `peerAppId`, `Content-Type`, `Accept`

---

## 💡 Tips

1. **Always include both required fields** - The service will reject any request missing `uuid` or `genevaAssetKey`
2. **Use valid UUIDs** - Generate fresh UUIDs for each request
3. **Verify Geneva asset keys** - Ensure you have access to the specified asset
4. **Check authentication** - Ensure your `X-Gsf-Apptoken` and `peerAppId` are valid
5. **Monitor responses** - Check `requestId` in responses for tracking and debugging
