# HTML Checker API - Test Suite

Comprehensive test suite for the HTML Checker API deployed at: https://html-checker-yc8t.onrender.com/

## Test Coverage

This test suite covers all API endpoints with various scenarios:

### 1. Root Endpoint (`GET /`)
- Returns HTML content
- Contains valid HTML structure

### 2. Upload Endpoint (`POST /upload`)
- Simple citations `[cite: 123]`
- Citation start markers `[cite_start]`
- Multiple citation formats (commas: `[cite: 1, 2, 3]`)
- Range citations (dashes: `[cite: 1-5]`)
- Tags containing only citations
- Clean HTML without citations
- Large files (100+ citations)
- Invalid file types (error handling)
- Missing file parameter (error handling)
- Empty files
- Special characters and Unicode
- Nested HTML tags

### 3. Download Endpoint (`GET /download/{filename}`)
- Nonexistent file (404 error)
- Complete upload → download workflow
- Path traversal security test

### 4. Static Files
- Static file accessibility
- Public templates accessibility

### 5. Edge Cases
- Malformed citations
- Whitespace variations
- Concurrent uploads
- API documentation endpoints

## Installation

Install test dependencies:

```bash
pip install -r test_requirements.txt
```

## Running Tests

### Run all tests with verbose output:
```bash
pytest test_api.py -v
```

### Run with coverage report:
```bash
pytest test_api.py --cov=. --cov-report=html
```

### Run specific test class:
```bash
pytest test_api.py::TestUploadEndpoint -v
```

### Run specific test:
```bash
pytest test_api.py::TestUploadEndpoint::test_upload_simple_html_with_citations -v
```

### Run with HTML report:
```bash
pytest test_api.py --html=report.html --self-contained-html
```

### Stop on first failure:
```bash
pytest test_api.py -x
```

### Run with detailed output:
```bash
python test_api.py
```

## Test Statistics

- **Total Test Classes**: 6
- **Total Test Cases**: 30+
- **Endpoints Tested**: 4 main endpoints + 2 static routes
- **Coverage**: All API endpoints and major edge cases

## Test Results Interpretation

- ✅ **PASSED**: Test executed successfully
- ❌ **FAILED**: Test failed, check error details
- ⚠️ **SKIPPED**: Test was skipped (if any)

## Expected Behavior

All tests should pass against the live API at https://html-checker-yc8t.onrender.com/

If tests fail, check:
1. API is accessible and running
2. Network connectivity
3. API hasn't changed (endpoint modifications)
4. Rate limiting (if applicable)

## CI/CD Integration

To integrate with CI/CD pipelines:

```bash
# GitHub Actions example
pytest test_api.py --junitxml=junit.xml -v

# GitLab CI example
pytest test_api.py --junitxml=report.xml --cov=. --cov-report=xml
```

## License

Same as parent project.
