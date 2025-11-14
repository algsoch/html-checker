"""
Comprehensive test suite for HTML Checker API
Tests all endpoints with various scenarios and edge cases
"""

import pytest
import requests
import io
from pathlib import Path

# Base URL for the deployed API
BASE_URL = "https://html-checker-yc8t.onrender.com"

class TestRootEndpoint:
    """Test the root endpoint GET /"""
    
    def test_root_returns_html(self):
        """Test that root endpoint returns HTML content"""
        response = requests.get(f"{BASE_URL}/")
        assert response.status_code == 200
        assert "text/html" in response.headers.get("content-type", "")
        assert len(response.text) > 0
    
    def test_root_contains_html_structure(self):
        """Test that root endpoint contains valid HTML structure"""
        response = requests.get(f"{BASE_URL}/")
        content = response.text.lower()
        assert "<html" in content or "<!doctype html>" in content
        assert "<body" in content or response.status_code == 200


class TestUploadEndpoint:
    """Test the upload endpoint POST /upload"""
    
    def test_upload_simple_html_with_citations(self):
        """Test uploading HTML with simple cite markers"""
        html_content = """
        <html>
        <body>
            <p>This is a test [cite: 123].</p>
            <p>Another paragraph [cite: 456].</p>
        </body>
        </html>
        """
        
        files = {
            'file': ('test.html', io.BytesIO(html_content.encode('utf-8')), 'text/html')
        }
        
        response = requests.post(f"{BASE_URL}/upload", files=files)
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] is True
        assert data["original_filename"] == "test.html"
        assert "output_filename" in data
        assert "download_url" in data
        assert data["statistics"]["total_citations_removed"] == 2
        assert data["statistics"]["cite_with_numbers"] == 2
        assert data["statistics"]["cite_start_markers"] == 0
    
    def test_upload_html_with_cite_start(self):
        """Test uploading HTML with [cite_start] markers"""
        html_content = """
        <html>
        <body>
            <p>[cite_start] This is a citation.</p>
            <p>Normal paragraph.</p>
            <div>[cite_start]</div>
        </body>
        </html>
        """
        
        files = {
            'file': ('cite_start.html', io.BytesIO(html_content.encode('utf-8')), 'text/html')
        }
        
        response = requests.post(f"{BASE_URL}/upload", files=files)
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] is True
        assert data["statistics"]["cite_start_markers"] == 2
    
    def test_upload_html_with_multiple_citations(self):
        """Test HTML with multiple citation formats (commas and dashes)"""
        html_content = """
        <html>
        <body>
            <p>Multiple cites [cite: 123, 124, 125].</p>
            <p>Range cite [cite: 105-107].</p>
            <p>Mixed [cite: 1, 2-4, 5].</p>
        </body>
        </html>
        """
        
        files = {
            'file': ('multi_cite.html', io.BytesIO(html_content.encode('utf-8')), 'text/html')
        }
        
        response = requests.post(f"{BASE_URL}/upload", files=files)
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] is True
        assert data["statistics"]["cite_with_numbers"] == 3
    
    def test_upload_html_with_only_cite_tags(self):
        """Test HTML with tags containing only cite markers"""
        html_content = """
        <html>
        <body>
            <p>[cite: 123]</p>
            <div>[cite_start]</div>
            <span>[cite: 456, 789]</span>
            <p>This should stay [cite: 999].</p>
        </body>
        </html>
        """
        
        files = {
            'file': ('only_cite.html', io.BytesIO(html_content.encode('utf-8')), 'text/html')
        }
        
        response = requests.post(f"{BASE_URL}/upload", files=files)
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] is True
        assert data["statistics"]["total_citations_removed"] >= 4
    
    def test_upload_clean_html_no_citations(self):
        """Test uploading HTML without any citations"""
        html_content = """
        <html>
        <body>
            <p>Clean paragraph without citations.</p>
            <p>Another clean paragraph.</p>
        </body>
        </html>
        """
        
        files = {
            'file': ('clean.html', io.BytesIO(html_content.encode('utf-8')), 'text/html')
        }
        
        response = requests.post(f"{BASE_URL}/upload", files=files)
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] is True
        assert data["statistics"]["total_citations_removed"] == 0
    
    def test_upload_large_html_file(self):
        """Test uploading a larger HTML file with many citations"""
        paragraphs = [f"<p>Paragraph {i} [cite: {i}].</p>" for i in range(100)]
        html_content = f"""
        <html>
        <body>
            {''.join(paragraphs)}
        </body>
        </html>
        """
        
        files = {
            'file': ('large.html', io.BytesIO(html_content.encode('utf-8')), 'text/html')
        }
        
        response = requests.post(f"{BASE_URL}/upload", files=files)
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] is True
        assert data["statistics"]["total_citations_removed"] == 100
    
    def test_upload_non_html_file(self):
        """Test uploading non-HTML file (should fail)"""
        txt_content = "This is a text file, not HTML."
        
        files = {
            'file': ('test.txt', io.BytesIO(txt_content.encode('utf-8')), 'text/plain')
        }
        
        response = requests.post(f"{BASE_URL}/upload", files=files)
        assert response.status_code == 400
        assert "Only HTML files are allowed" in response.json()["detail"]
    
    def test_upload_without_file(self):
        """Test upload endpoint without providing a file"""
        response = requests.post(f"{BASE_URL}/upload")
        assert response.status_code == 422  # Unprocessable Entity
    
    def test_upload_empty_html_file(self):
        """Test uploading empty HTML file"""
        html_content = ""
        
        files = {
            'file': ('empty.html', io.BytesIO(html_content.encode('utf-8')), 'text/html')
        }
        
        response = requests.post(f"{BASE_URL}/upload", files=files)
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] is True
        assert data["statistics"]["total_citations_removed"] == 0
    
    def test_upload_html_with_special_characters(self):
        """Test HTML with special characters and citations"""
        html_content = """
        <html>
        <body>
            <p>Special chars: &amp; &lt; &gt; &quot; [cite: 123].</p>
            <p>Unicode: 你好世界 [cite: 456].</p>
            <p>Emoji: 😀🎉 [cite: 789].</p>
        </body>
        </html>
        """
        
        files = {
            'file': ('special.html', io.BytesIO(html_content.encode('utf-8')), 'text/html')
        }
        
        response = requests.post(f"{BASE_URL}/upload", files=files)
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] is True
        assert data["statistics"]["cite_with_numbers"] == 3
    
    def test_upload_html_with_nested_tags(self):
        """Test HTML with nested tags and citations"""
        html_content = """
        <html>
        <body>
            <div>
                <p>Outer paragraph [cite: 1].</p>
                <div>
                    <span>Nested span [cite: 2].</span>
                    <p>Nested paragraph [cite: 3].</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        files = {
            'file': ('nested.html', io.BytesIO(html_content.encode('utf-8')), 'text/html')
        }
        
        response = requests.post(f"{BASE_URL}/upload", files=files)
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] is True
        assert data["statistics"]["total_citations_removed"] >= 3


class TestDownloadEndpoint:
    """Test the download endpoint GET /download/{filename}"""
    
    def test_download_nonexistent_file(self):
        """Test downloading a file that doesn't exist"""
        response = requests.get(f"{BASE_URL}/download/nonexistent.html")
        assert response.status_code == 404
        assert "File not found" in response.json()["detail"]
    
    def test_upload_and_download_workflow(self):
        """Test complete workflow: upload file, then download cleaned version"""
        # Step 1: Upload file
        html_content = """
        <html>
        <body>
            <p>Test content [cite: 123].</p>
        </body>
        </html>
        """
        
        files = {
            'file': ('workflow.html', io.BytesIO(html_content.encode('utf-8')), 'text/html')
        }
        
        upload_response = requests.post(f"{BASE_URL}/upload", files=files)
        assert upload_response.status_code == 200
        
        upload_data = upload_response.json()
        output_filename = upload_data["output_filename"]
        
        # Step 2: Download the cleaned file
        download_url = upload_data["download_url"]
        download_response = requests.get(f"{BASE_URL}{download_url}")
        
        assert download_response.status_code == 200
        assert "text/html" in download_response.headers.get("content-type", "")
        
        # Verify citations are removed
        cleaned_content = download_response.text
        assert "[cite:" not in cleaned_content
        assert "[cite_start]" not in cleaned_content
    
    def test_download_with_path_traversal_attempt(self):
        """Test download endpoint with path traversal attempt (security test)"""
        response = requests.get(f"{BASE_URL}/download/../../../etc/passwd")
        # Should either return 404 or handle the path safely
        assert response.status_code in [404, 422]


class TestStaticFiles:
    """Test static file serving"""
    
    def test_static_files_accessible(self):
        """Test that static files endpoint is accessible"""
        # Try to access static directory (may or may not have files)
        response = requests.get(f"{BASE_URL}/static/")
        # Should either return files or 404, but not 500
        assert response.status_code in [200, 403, 404]
    
    def test_public_templates_accessible(self):
        """Test that public templates endpoint is accessible"""
        response = requests.get(f"{BASE_URL}/templates/public/")
        # Should either return files or 404, but not 500
        assert response.status_code in [200, 403, 404]


class TestEdgeCases:
    """Test edge cases and error handling"""
    
    def test_upload_html_with_malformed_citations(self):
        """Test HTML with malformed citation markers"""
        html_content = """
        <html>
        <body>
            <p>Malformed [cite: abc].</p>
            <p>Incomplete [cite: .</p>
            <p>Valid [cite: 123].</p>
        </body>
        </html>
        """
        
        files = {
            'file': ('malformed.html', io.BytesIO(html_content.encode('utf-8')), 'text/html')
        }
        
        response = requests.post(f"{BASE_URL}/upload", files=files)
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] is True
        # Only the valid citation should be counted
        assert data["statistics"]["cite_with_numbers"] >= 1
    
    def test_upload_html_with_whitespace_variations(self):
        """Test citations with various whitespace patterns"""
        html_content = """
        <html>
        <body>
            <p>Normal [cite: 123].</p>
            <p>Extra spaces [cite:    456   ].</p>
            <p>No spaces [cite:789].</p>
            <p>Tabs [cite:	111	].</p>
        </body>
        </html>
        """
        
        files = {
            'file': ('whitespace.html', io.BytesIO(html_content.encode('utf-8')), 'text/html')
        }
        
        response = requests.post(f"{BASE_URL}/upload", files=files)
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] is True
        assert data["statistics"]["cite_with_numbers"] >= 3
    
    def test_concurrent_uploads(self):
        """Test handling multiple concurrent uploads"""
        html_content = """
        <html>
        <body>
            <p>Concurrent test [cite: 999].</p>
        </body>
        </html>
        """
        
        # Simulate concurrent requests
        import concurrent.futures
        
        def upload_file(index):
            files = {
                'file': (f'concurrent_{index}.html', 
                        io.BytesIO(html_content.encode('utf-8')), 
                        'text/html')
            }
            return requests.post(f"{BASE_URL}/upload", files=files)
        
        with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
            futures = [executor.submit(upload_file, i) for i in range(5)]
            results = [f.result() for f in concurrent.futures.as_completed(futures)]
        
        # All requests should succeed
        for response in results:
            assert response.status_code == 200
            data = response.json()
            assert data["success"] is True


class TestAPIDocumentation:
    """Test API documentation endpoints"""
    
    def test_docs_endpoint(self):
        """Test that API documentation is available"""
        response = requests.get(f"{BASE_URL}/docs")
        assert response.status_code == 200
    
    def test_openapi_schema(self):
        """Test that OpenAPI schema is available"""
        response = requests.get(f"{BASE_URL}/openapi.json")
        assert response.status_code == 200
        
        schema = response.json()
        assert "openapi" in schema
        assert "info" in schema
        assert schema["info"]["title"] == "HTML Cite Cleaner"


# Test runner with detailed reporting
if __name__ == "__main__":
    print("=" * 80)
    print("HTML Checker API - Comprehensive Test Suite")
    print(f"Testing: {BASE_URL}")
    print("=" * 80)
    print()
    
    # Run tests with verbose output
    pytest.main([
        __file__,
        "-v",  # Verbose
        "--tb=short",  # Short traceback
        "-s",  # Show print statements
        "--color=yes",  # Colored output
        "-x",  # Stop on first failure (remove this to run all tests)
    ])
