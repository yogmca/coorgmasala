# GSF ALV Proxy Service - Input Payload Examples

This document provides comprehensive payload examples for the proxy service endpoint:
```
POST http://localhost:8080/gsf/alv/businessareas/{businessArea}/subjectareas/{subjectArea}/proxy/Invoke
```

---

## Table of Contents
1. [Query Operation Payloads](#1-query-operation-payloads)
2. [Metadata Operation Payloads](#2-metadata-operation-payloads)
3. [Dimension Options Payloads](#3-dimension-options-payloads)
4. [Advanced Query Examples](#4-advanced-query-examples)
5. [Complete Curl Commands](#5-complete-curl-commands)

---

## 1. Query Operation Payloads

### 1.1 Basic Query - Simple Aggregation

**Payload:**
```json
{
  "operation": "query",
  "cube_id": "100001",
  "dimensions": ["COUNTRY", "FISCAL_YEAR"],
  "measures": ["SALES_AMOUNT", "SALES_UNITS"]
}
```

**Curl Command:**
```bash
curl -X POST "http://localhost:8080/gsf/alv/businessareas/utility/subjectareas/alv/proxy/Invoke" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "operation": "query",
    "cube_id": "100001",
    "dimensions": ["COUNTRY", "FISCAL_YEAR"],
    "measures": ["SALES_AMOUNT", "SALES_UNITS"]
  }'
```

---

### 1.2 Query with Single Filter

**Payload:**
```json
{
  "operation": "query",
  "cube_id": "100001",
  "dimensions": ["COUNTRY", "FISCAL_YEAR"],
  "measures": ["SALES_AMOUNT"],
  "filters": [
    {
      "dimension": "COUNTRY",
      "operator": "EQUALS",
      "values": ["USA"]
    }
  ]
}
```

**Curl Command:**
```bash
curl -X POST "http://localhost:8080/gsf/alv/businessareas/utility/subjectareas/alv/proxy/Invoke" \
  -H "Content-Type: application/json" \
  -d '{
    "operation": "query",
    "cube_id": "100001",
    "dimensions": ["COUNTRY", "FISCAL_YEAR"],
    "measures": ["SALES_AMOUNT"],
    "filters": [
      {
        "dimension": "COUNTRY",
        "operator": "EQUALS",
        "values": ["USA"]
      }
    ]
  }'
```

---

### 1.3 Query with Multiple Filters (AND Logic)

**Payload:**
```json
{
  "operation": "query",
  "cube_id": "100001",
  "dimensions": ["COUNTRY", "REGION", "FISCAL_YEAR"],
  "measures": ["SALES_AMOUNT", "SALES_UNITS"],
  "filters": [
    {
      "dimension": "COUNTRY",
      "operator": "IN",
      "values": ["USA", "Canada", "Mexico"]
    },
    {
      "dimension": "FISCAL_YEAR",
      "operator": "EQUALS",
      "values": ["2024"]
    },
    {
      "dimension": "REGION",
      "operator": "NOT_EQUALS",
      "values": ["APAC"]
    }
  ]
}
```

**Curl Command:**
```bash
curl -X POST "http://localhost:8080/gsf/alv/businessareas/utility/subjectareas/alv/proxy/Invoke" \
  -H "Content-Type: application/json" \
  -d '{
    "operation": "query",
    "cube_id": "100001",
    "dimensions": ["COUNTRY", "REGION", "FISCAL_YEAR"],
    "measures": ["SALES_AMOUNT", "SALES_UNITS"],
    "filters": [
      {
        "dimension": "COUNTRY",
        "operator": "IN",
        "values": ["USA", "Canada", "Mexico"]
      },
      {
        "dimension": "FISCAL_YEAR",
        "operator": "EQUALS",
        "values": ["2024"]
      }
    ]
  }'
```

---

### 1.4 Query with Measure Aggregations

**Payload:**
```json
{
  "operation": "query",
  "cube_id": "100001",
  "dimensions": ["COUNTRY", "FISCAL_QUARTER"],
  "measures": [
    {
      "name": "SALES_AMOUNT",
      "aggregation": "SUM",
      "alias": "total_sales"
    },
    {
      "name": "SALES_AMOUNT",
      "aggregation": "AVG",
      "alias": "avg_sales"
    },
    {
      "name": "SALES_UNITS",
      "aggregation": "COUNT",
      "alias": "transaction_count"
    }
  ],
  "filters": [
    {
      "dimension": "FISCAL_YEAR",
      "operator": "EQUALS",
      "values": ["2024"]
    }
  ]
}
```

---

### 1.5 Query with Pagination and Sorting

**Payload:**
```json
{
  "operation": "query",
  "cube_id": "100001",
  "dimensions": ["COUNTRY", "PARTNER", "FISCAL_YEAR"],
  "measures": ["SALES_AMOUNT", "SALES_UNITS"],
  "filters": [
    {
      "dimension": "FISCAL_YEAR",
      "operator": "IN",
      "values": ["2023", "2024"]
    }
  ],
  "options": {
    "limit": 100,
    "offset": 0,
    "sort": [
      {
        "field": "SALES_AMOUNT",
        "direction": "DESC"
      },
      {
        "field": "COUNTRY",
        "direction": "ASC"
      }
    ]
  }
}
```

---

### 1.6 Query with Range Filter

**Payload:**
```json
{
  "operation": "query",
  "cube_id": "100001",
  "dimensions": ["COUNTRY", "FISCAL_YEAR"],
  "measures": ["SALES_AMOUNT"],
  "filters": [
    {
      "dimension": "SALES_AMOUNT",
      "operator": "BETWEEN",
      "values": [100000, 500000]
    },
    {
      "dimension": "FISCAL_YEAR",
      "operator": "GREATER_THAN_OR_EQUAL",
      "values": ["2022"]
    }
  ]
}
```

---

### 1.7 Query with NULL Checks

**Payload:**
```json
{
  "operation": "query",
  "cube_id": "100001",
  "dimensions": ["COUNTRY", "PARTNER", "FISCAL_YEAR"],
  "measures": ["SALES_AMOUNT"],
  "filters": [
    {
      "dimension": "PARTNER",
      "operator": "IS_NOT_NULL",
      "values": []
    },
    {
      "dimension": "COUNTRY",
      "operator": "IN",
      "values": ["USA", "UK", "Germany"]
    }
  ]
}
```

---

## 2. Metadata Operation Payloads

### 2.1 Get All Cube Metadata

**Payload:**
```json
{
  "operation": "getMetadata",
  "cube_id": "100001"
}
```

**Curl Command:**
```bash
curl -X POST "http://localhost:8080/gsf/alv/businessareas/utility/subjectareas/alv/proxy/Invoke" \
  -H "Content-Type: application/json" \
  -d '{
    "operation": "getMetadata",
    "cube_id": "100001"
  }'
```

**Expected Response:**
```json
{
  "status": "success",
  "data": {
    "cube_id": "100001",
    "cube_name": "Sales Analytics Cube",
    "dimensions": [
      {
        "key": "COUNTRY",
        "name": "Country",
        "type": "string",
        "description": "Country where sales occurred"
      },
      {
        "key": "FISCAL_YEAR",
        "name": "Fiscal Year",
        "type": "string",
        "description": "Fiscal year of the transaction"
      },
      {
        "key": "REGION",
        "name": "Region",
        "type": "string"
      }
    ],
    "measures": [
      {
        "key": "SALES_AMOUNT",
        "name": "Sales Amount",
        "type": "currency",
        "unit": "USD",
        "aggregations": ["SUM", "AVG", "MIN", "MAX"]
      },
      {
        "key": "SALES_UNITS",
        "name": "Sales Units",
        "type": "number",
        "aggregations": ["SUM", "COUNT"]
      }
    ]
  }
}
```

---

### 2.2 Get Metadata for Specific Business Area

**Payload:**
```json
{
  "operation": "getMetadata",
  "business_area": "mcp-playground",
  "subject_area": "playground",
  "cube_id": "100001"
}
```

**Curl Command:**
```bash
curl -X POST "http://localhost:8080/gsf/alv/businessareas/mcp-playground/subjectareas/playground/proxy/Invoke" \
  -H "Content-Type: application/json" \
  -d '{
    "operation": "getMetadata",
    "cube_id": "100001"
  }'
```

---

## 3. Dimension Options Payloads

### 3.1 Get Available Countries

**Payload:**
```json
{
  "operation": "getDimensionOptions",
  "cube_id": "100001",
  "dimension_key": "COUNTRY"
}
```

**Curl Command:**
```bash
curl -X POST "http://localhost:8080/gsf/alv/businessareas/utility/subjectareas/alv/proxy/Invoke" \
  -H "Content-Type: application/json" \
  -d '{
    "operation": "getDimensionOptions",
    "cube_id": "100001",
    "dimension_key": "COUNTRY"
  }'
```

**Expected Response:**
```json
{
  "status": "success",
  "data": {
    "dimension_key": "COUNTRY",
    "options": [
      "USA",
      "Canada",
      "Mexico",
      "UK",
      "Germany",
      "France",
      "Japan",
      "China"
    ],
    "total_count": 8
  }
}
```

---

### 3.2 Get Fiscal Years

**Payload:**
```json
{
  "operation": "getDimensionOptions",
  "cube_id": "100001",
  "dimension_key": "FISCAL_YEAR"
}
```

---

### 3.3 Get Partners

**Payload:**
```json
{
  "operation": "getDimensionOptions",
  "cube_id": "100001",
  "dimension_key": "PARTNER"
}
```

---

### 3.4 Get Dimension Options with Filters

**Payload:**
```json
{
  "operation": "getDimensionOptions",
  "cube_id": "100001",
  "dimension_key": "REGION",
  "filters": [
    {
      "dimension": "COUNTRY",
      "operator": "EQUALS",
      "values": ["USA"]
    }
  ]
}
```

---

## 4. Advanced Query Examples

### 4.1 Multi-Dimensional Analysis

**Payload:**
```json
{
  "operation": "query",
  "cube_id": "100001",
  "dimensions": [
    "LOB",
    "COUNTRY",
    "REGION",
    "FISCAL_YEAR",
    "FISCAL_QUARTER",
    "PARTNER"
  ],
  "measures": [
    {
      "name": "SALES_AMOUNT",
      "aggregation": "SUM"
    },
    {
      "name": "SALES_UNITS",
      "aggregation": "SUM"
    }
  ],
  "filters": [
    {
      "dimension": "FISCAL_YEAR",
      "operator": "IN",
      "values": ["2023", "2024"]
    },
    {
      "dimension": "LOB",
      "operator": "NOT_IN",
      "values": ["Discontinued"]
    }
  ],
  "options": {
    "limit": 500,
    "sort": [
      {
        "field": "SALES_AMOUNT",
        "direction": "DESC"
      }
    ]
  }
}
```

---

### 4.2 Year-over-Year Comparison

**Payload:**
```json
{
  "operation": "query",
  "cube_id": "100001",
  "dimensions": ["COUNTRY", "FISCAL_YEAR"],
  "measures": [
    {
      "name": "SALES_AMOUNT",
      "aggregation": "SUM",
      "alias": "total_sales"
    },
    {
      "name": "SALES_UNITS",
      "aggregation": "SUM",
      "alias": "total_units"
    }
  ],
  "filters": [
    {
      "dimension": "FISCAL_YEAR",
      "operator": "IN",
      "values": ["2023", "2024"]
    },
    {
      "dimension": "COUNTRY",
      "operator": "IN",
      "values": ["USA", "Canada", "UK"]
    }
  ],
  "options": {
    "sort": [
      {
        "field": "COUNTRY",
        "direction": "ASC"
      },
      {
        "field": "FISCAL_YEAR",
        "direction": "ASC"
      }
    ]
  }
}
```

---

### 4.3 Top N Analysis

**Payload:**
```json
{
  "operation": "query",
  "cube_id": "100001",
  "dimensions": ["PARTNER", "COUNTRY"],
  "measures": [
    {
      "name": "SALES_AMOUNT",
      "aggregation": "SUM",
      "alias": "revenue"
    }
  ],
  "filters": [
    {
      "dimension": "FISCAL_YEAR",
      "operator": "EQUALS",
      "values": ["2024"]
    }
  ],
  "options": {
    "limit": 10,
    "sort": [
      {
        "field": "SALES_AMOUNT",
        "direction": "DESC"
      }
    ]
  }
}
```

---

### 4.4 Quarterly Trend Analysis

**Payload:**
```json
{
  "operation": "query",
  "cube_id": "100001",
  "dimensions": ["FISCAL_YEAR", "FISCAL_QUARTER", "LOB"],
  "measures": [
    {
      "name": "SALES_AMOUNT",
      "aggregation": "SUM"
    },
    {
      "name": "SALES_AMOUNT",
      "aggregation": "AVG",
      "alias": "avg_sales_per_transaction"
    }
  ],
  "filters": [
    {
      "dimension": "FISCAL_YEAR",
      "operator": "EQUALS",
      "values": ["2024"]
    }
  ],
  "options": {
    "sort": [
      {
        "field": "FISCAL_QUARTER",
        "direction": "ASC"
      }
    ]
  }
}
```

---

### 4.5 Regional Performance Analysis

**Payload:**
```json
{
  "operation": "query",
  "cube_id": "100001",
  "dimensions": ["REGION", "COUNTRY", "ROUTE_TO_MARKET"],
  "measures": [
    {
      "name": "SALES_AMOUNT",
      "aggregation": "SUM",
      "alias": "total_revenue"
    },
    {
      "name": "SALES_UNITS",
      "aggregation": "SUM",
      "alias": "total_units_sold"
    }
  ],
  "filters": [
    {
      "dimension": "FISCAL_YEAR",
      "operator": "EQUALS",
      "values": ["2024"]
    },
    {
      "dimension": "SALES_AMOUNT",
      "operator": "GREATER_THAN",
      "values": [50000]
    }
  ],
  "options": {
    "limit": 100,
    "sort": [
      {
        "field": "total_revenue",
        "direction": "DESC"
      }
    ]
  }
}
```

---

## 5. Complete Curl Commands

### 5.1 With API Key Authentication

```bash
curl -X POST "http://localhost:8080/gsf/alv/businessareas/utility/subjectareas/alv/proxy/Invoke" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key-here" \
  -d '{
    "operation": "query",
    "cube_id": "100001",
    "dimensions": ["COUNTRY", "FISCAL_YEAR"],
    "measures": ["SALES_AMOUNT"]
  }'
```

---

### 5.2 With Bearer Token Authentication

```bash
curl -X POST "http://localhost:8080/gsf/alv/businessareas/utility/subjectareas/alv/proxy/Invoke" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "operation": "query",
    "cube_id": "100001",
    "dimensions": ["COUNTRY"],
    "measures": ["SALES_AMOUNT"],
    "filters": [
      {
        "dimension": "FISCAL_YEAR",
        "operator": "EQUALS",
        "values": ["2024"]
      }
    ]
  }'
```

---

### 5.3 With Pretty-Printed Response

```bash
curl -X POST "http://localhost:8080/gsf/alv/businessareas/utility/subjectareas/alv/proxy/Invoke" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "operation": "getMetadata",
    "cube_id": "100001"
  }' | jq '.'
```

---

### 5.4 Saving Response to File

```bash
curl -X POST "http://localhost:8080/gsf/alv/businessareas/utility/subjectareas/alv/proxy/Invoke" \
  -H "Content-Type: application/json" \
  -d '{
    "operation": "query",
    "cube_id": "100001",
    "dimensions": ["COUNTRY", "FISCAL_YEAR"],
    "measures": ["SALES_AMOUNT", "SALES_UNITS"]
  }' \
  -o response.json
```

---

### 5.5 With Verbose Output (Debug)

```bash
curl -v -X POST "http://localhost:8080/gsf/alv/businessareas/utility/subjectareas/alv/proxy/Invoke" \
  -H "Content-Type: application/json" \
  -d '{
    "operation": "query",
    "cube_id": "100001",
    "dimensions": ["COUNTRY"],
    "measures": ["SALES_AMOUNT"]
  }'
```

---

### 5.6 From File

```bash
# Save payload to file
cat > payload.json << 'EOF'
{
  "operation": "query",
  "cube_id": "100001",
  "dimensions": ["COUNTRY", "FISCAL_YEAR"],
  "measures": ["SALES_AMOUNT"],
  "filters": [
    {
      "dimension": "COUNTRY",
      "operator": "IN",
      "values": ["USA", "Canada"]
    }
  ]
}
EOF

# Execute curl with file
curl -X POST "http://localhost:8080/gsf/alv/businessareas/utility/subjectareas/alv/proxy/Invoke" \
  -H "Content-Type: application/json" \
  -d @payload.json
```

---

## 6. Error Handling Examples

### 6.1 Invalid Operation

**Payload:**
```json
{
  "operation": "invalid_operation",
  "cube_id": "100001"
}
```

**Expected Error Response:**
```json
{
  "status": "error",
  "error": {
    "code": "INVALID_OPERATION",
    "message": "Operation 'invalid_operation' is not supported",
    "details": {
      "valid_operations": ["query", "getMetadata", "getDimensionOptions", "execute"]
    }
  }
}
```

---

### 6.2 Missing Required Field

**Payload:**
```json
{
  "cube_id": "100001",
  "dimensions": ["COUNTRY"]
}
```

**Expected Error Response:**
```json
{
  "status": "error",
  "error": {
    "code": "MISSING_REQUIRED_FIELD",
    "message": "Required field 'operation' is missing",
    "details": {
      "field": "operation",
      "required": true
    }
  }
}
```

---

## 7. Testing Checklist

Use these payloads to test your proxy service:

- [ ] Basic query without filters
- [ ] Query with single filter
- [ ] Query with multiple filters
- [ ] Query with measure aggregations
- [ ] Query with pagination
- [ ] Query with sorting
- [ ] Get metadata operation
- [ ] Get dimension options
- [ ] Invalid operation (error handling)
- [ ] Missing required fields (error handling)
- [ ] Authentication with API key
- [ ] Authentication with Bearer token
- [ ] Large result set handling
- [ ] Empty result set handling

---

## 8. Quick Reference

### Available Operations
- `query` - Execute data queries
- `getMetadata` - Retrieve cube metadata
- `getDimensionOptions` - Get dimension values
- `execute` - Generic execution

### Common Dimensions (MCP Playground)
- `LOB` - Line of Business
- `COUNTRY` - Country
- `REGION` - Region
- `FISCAL_YEAR` - Fiscal Year
- `FISCAL_QUARTER` - Fiscal Quarter
- `PARTNER` - Partner
- `SUB_LOB` - Sub Line of Business
- `ROUTE_TO_MARKET` - Route to Market

### Common Measures
- `SALES_AMOUNT` - Sales Amount
- `SALES_UNITS` - Sales Units
- `REVENUE` - Revenue
- `COST` - Cost
- `MARGIN` - Margin

### Filter Operators
- `EQUALS` - Exact match
- `NOT_EQUALS` - Not equal
- `IN` - In list
- `NOT_IN` - Not in list
- `GREATER_THAN` - Greater than
- `LESS_THAN` - Less than
- `GREATER_THAN_OR_EQUAL` - Greater than or equal
- `LESS_THAN_OR_EQUAL` - Less than or equal
- `BETWEEN` - Between two values
- `LIKE` - Pattern matching
- `IS_NULL` - Is null
- `IS_NOT_NULL` - Is not null

### Aggregation Functions
- `SUM` - Sum of values
- `AVG` - Average
- `MIN` - Minimum
- `MAX` - Maximum
- `COUNT` - Count of records
