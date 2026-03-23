#!/bin/bash

# GSF ALV Proxy Service - Payload Discovery Script
# This script tests various payload structures to discover the expected input format

set -e

# Configuration
BASE_URL="http://localhost:8080/gsf/alv/businessareas/utility/subjectareas/alv/proxy/Invoke"
APP_TOKEN="R90VjbDpMmwNVDe7fqt6posoTD/PieP+ixdlvpLRejs=:ubv9h2c35y6k6vcdximq:1711252273377:1"
PEER_APP_ID="136848"
OUTPUT_DIR="./payload-discovery-results"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Create output directory
mkdir -p "$OUTPUT_DIR"

# Function to make API call and analyze response
test_payload() {
    local test_name="$1"
    local payload="$2"
    local description="$3"
    
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}Test: ${test_name}${NC}"
    echo -e "${BLUE}Description: ${description}${NC}"
    echo -e "${BLUE}Payload:${NC}"
    echo "$payload" | jq '.' 2>/dev/null || echo "$payload"
    echo ""
    
    # Make the request
    response=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL" \
        -H "Accept: application/json" \
        -H "Content-Type: application/json" \
        -H "X-Gsf-Apptoken: $APP_TOKEN" \
        -H "peerAppId: $PEER_APP_ID" \
        -d "$payload")
    
    # Extract HTTP status code (last line)
    http_code=$(echo "$response" | tail -n1)
    # Extract response body (all but last line)
    response_body=$(echo "$response" | sed '$d')
    
    # Save to file
    output_file="$OUTPUT_DIR/${test_name}.json"
    echo "$response_body" > "$output_file"
    
    # Display results
    if [ "$http_code" -eq 200 ]; then
        echo -e "${GREEN}✓ HTTP Status: $http_code (SUCCESS)${NC}"
    else
        echo -e "${RED}✗ HTTP Status: $http_code (ERROR)${NC}"
    fi
    
    echo -e "${BLUE}Response:${NC}"
    echo "$response_body" | jq '.' 2>/dev/null || echo "$response_body"
    
    # Analyze error messages for clues
    if [ "$http_code" -ne 200 ]; then
        echo -e "\n${YELLOW}Analyzing error for clues...${NC}"
        
        # Look for required fields
        required_fields=$(echo "$response_body" | jq -r '.. | select(type == "string") | select(. | test("required|missing|expected|must|need"; "i"))' 2>/dev/null | head -5)
        if [ ! -z "$required_fields" ]; then
            echo -e "${YELLOW}Hints found:${NC}"
            echo "$required_fields"
        fi
    fi
    
    echo ""
    sleep 0.5  # Rate limiting
}

echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   GSF ALV Proxy Service - Payload Discovery                   ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo "Endpoint: $BASE_URL"
echo "Output Directory: $OUTPUT_DIR"
echo ""

# Test 1: Empty payload
test_payload "01-empty" \
    '{}' \
    "Empty JSON object - baseline test"

# Test 2: Null payload
test_payload "02-null" \
    'null' \
    "Null value"

# Test 3: Array payload
test_payload "03-array" \
    '[]' \
    "Empty array"

# Test 4: Operation field
test_payload "04-operation" \
    '{"operation": "test"}' \
    "Simple operation field"

# Test 5: Method field
test_payload "05-method" \
    '{"method": "invoke"}' \
    "Method field"

# Test 6: Action field
test_payload "06-action" \
    '{"action": "execute"}' \
    "Action field"

# Test 7: Service and method
test_payload "07-service-method" \
    '{"service": "DataService", "method": "execute"}' \
    "Service and method fields"

# Test 8: Request wrapper
test_payload "08-request-wrapper" \
    '{"request": {}}' \
    "Request wrapper object"

# Test 9: Data wrapper
test_payload "09-data-wrapper" \
    '{"data": {}}' \
    "Data wrapper object"

# Test 10: Payload wrapper
test_payload "10-payload-wrapper" \
    '{"payload": {}}' \
    "Payload wrapper object"

# Test 11: Parameters field
test_payload "11-parameters" \
    '{"parameters": {}}' \
    "Parameters field"

# Test 12: Query structure
test_payload "12-query" \
    '{"query": {}}' \
    "Query structure"

# Test 13: Command structure
test_payload "13-command" \
    '{"command": "execute"}' \
    "Command structure"

# Test 14: Type and data
test_payload "14-type-data" \
    '{"type": "query", "data": {}}' \
    "Type and data fields"

# Test 15: RPC style
test_payload "15-rpc-style" \
    '{"jsonrpc": "2.0", "method": "invoke", "params": {}, "id": 1}' \
    "JSON-RPC 2.0 style"

# Test 16: Service name variations
test_payload "16-servicename" \
    '{"serviceName": "DataService", "methodName": "query"}' \
    "ServiceName and methodName (camelCase)"

# Test 17: Target and operation
test_payload "17-target-operation" \
    '{"target": "proxy", "operation": "invoke"}' \
    "Target and operation"

# Test 18: Context and request
test_payload "18-context-request" \
    '{"context": {}, "request": {}}' \
    "Context and request"

# Test 19: Metadata request
test_payload "19-metadata" \
    '{"operation": "getMetadata"}' \
    "Metadata operation"

# Test 20: Query with dimensions
test_payload "20-query-dimensions" \
    '{"operation": "query", "dimensions": ["COUNTRY"]}' \
    "Query with dimensions array"

# Test 21: Execute with params
test_payload "21-execute-params" \
    '{"operation": "execute", "params": {}}' \
    "Execute with params"

# Test 22: Invoke with arguments
test_payload "22-invoke-args" \
    '{"invoke": {"method": "query", "arguments": []}}' \
    "Invoke with arguments"

# Test 23: Call structure
test_payload "23-call" \
    '{"call": {"service": "proxy", "method": "invoke"}}' \
    "Call structure"

# Test 24: Request with body
test_payload "24-request-body" \
    '{"request": {"body": {}}}' \
    "Request with body"

# Test 25: Message structure
test_payload "25-message" \
    '{"message": {"type": "request", "payload": {}}}' \
    "Message structure"

echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   Discovery Complete                                           ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Analyze all responses
echo -e "${YELLOW}Analyzing all responses...${NC}"
echo ""

# Find successful responses (HTTP 200)
echo -e "${GREEN}Successful Requests (HTTP 200):${NC}"
success_count=0
for file in "$OUTPUT_DIR"/*.json; do
    if [ -f "$file" ]; then
        # Check if response indicates success
        if grep -q '"status".*:.*"success"' "$file" 2>/dev/null || \
           grep -q '"code".*:.*200' "$file" 2>/dev/null; then
            echo "  ✓ $(basename $file .json)"
            success_count=$((success_count + 1))
        fi
    fi
done

if [ $success_count -eq 0 ]; then
    echo "  (none found)"
fi
echo ""

# Find common error patterns
echo -e "${YELLOW}Common Error Patterns:${NC}"
echo ""

# Extract unique error messages
echo "Error Messages:"
for file in "$OUTPUT_DIR"/*.json; do
    if [ -f "$file" ]; then
        jq -r 'try (.error.message // .message // .errorMessage // empty)' "$file" 2>/dev/null
    fi
done | sort -u | while read -r msg; do
    if [ ! -z "$msg" ]; then
        echo "  • $msg"
    fi
done
echo ""

# Look for required field hints
echo "Required Field Hints:"
grep -h -i "required\|missing\|expected\|must have" "$OUTPUT_DIR"/*.json 2>/dev/null | \
    jq -r 'try (.. | strings)' 2>/dev/null | \
    grep -i "required\|missing\|expected\|must" | \
    sort -u | head -10 | while read -r hint; do
        echo "  • $hint"
    done
echo ""

# Generate summary report
echo -e "${BLUE}Generating summary report...${NC}"
cat > "$OUTPUT_DIR/SUMMARY.md" << 'EOF'
# Payload Discovery Summary

## Test Results

This document summarizes the payload discovery tests for the GSF ALV Proxy Service.

### Endpoint
```
POST http://localhost:8080/gsf/alv/businessareas/utility/subjectareas/alv/proxy/Invoke
```

### Required Headers
- `Accept: application/json`
- `Content-Type: application/json`
- `X-Gsf-Apptoken: {token}`
- `peerAppId: {appId}`

## Findings

EOF

# Add successful payloads to summary
echo "### Successful Payloads" >> "$OUTPUT_DIR/SUMMARY.md"
echo "" >> "$OUTPUT_DIR/SUMMARY.md"
for file in "$OUTPUT_DIR"/*.json; do
    if [ -f "$file" ]; then
        if grep -q '"status".*:.*"success"' "$file" 2>/dev/null; then
            test_name=$(basename "$file" .json)
            echo "#### Test: $test_name" >> "$OUTPUT_DIR/SUMMARY.md"
            echo '```json' >> "$OUTPUT_DIR/SUMMARY.md"
            cat "$file" | jq '.' 2>/dev/null >> "$OUTPUT_DIR/SUMMARY.md"
            echo '```' >> "$OUTPUT_DIR/SUMMARY.md"
            echo "" >> "$OUTPUT_DIR/SUMMARY.md"
        fi
    fi
done

echo ""
echo -e "${GREEN}✓ Summary report saved to: $OUTPUT_DIR/SUMMARY.md${NC}"
echo -e "${GREEN}✓ All test results saved to: $OUTPUT_DIR/${NC}"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Review the SUMMARY.md file for successful payloads"
echo "2. Check individual JSON files for detailed error messages"
echo "3. Look for patterns in successful vs failed requests"
echo "4. Use the discovered payload structure to create OpenAPI spec"
echo ""
