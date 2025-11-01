from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.staticfiles import StaticFiles
import re
import os
from pathlib import Path

app = FastAPI(title="HTML Cite Cleaner")

# Serve static files (CSS, JS)
app.mount("/static", StaticFiles(directory="static"), name="static")

def clean_html_content(html_content: str) -> str:
    """
    Remove [cite: numbers] and [cite_start] markers from HTML content.
    
    Args:
        html_content: The HTML content to clean
        
    Returns:
        Cleaned HTML content without cite markers
    """
    # Remove [cite: <numbers>] pattern (handles various spacing)
    # Matches patterns like [cite: 124], [cite: 124, 125], [cite:124,125], etc.
    cleaned = re.sub(r'\[cite:\s*[\d,\s]+\]', '', html_content)
    
    # Remove [cite_start] markers
    cleaned = re.sub(r'\[cite_start\]', '', cleaned)
    
    return cleaned

@app.get("/", response_class=HTMLResponse)
async def read_root():
    """Serve the main HTML page"""
    with open("templates/index.html", "r", encoding="utf-8") as f:
        return f.read()

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    """
    Upload and clean HTML file by removing cite markers.
    
    Args:
        file: The uploaded HTML file
        
    Returns:
        JSON response with download link and statistics
    """
    # Validate file type
    if not file.filename.endswith('.html'):
        raise HTTPException(status_code=400, detail="Only HTML files are allowed")
    
    try:
        # Read the uploaded file content
        content = await file.read()
        html_content = content.decode('utf-8')
        
        # Count citations before cleaning
        cite_with_numbers = len(re.findall(r'\[cite:\s*[\d,\s]+\]', html_content))
        cite_start = len(re.findall(r'\[cite_start\]', html_content))
        total_citations = cite_with_numbers + cite_start
        
        # Clean the HTML content
        cleaned_content = clean_html_content(html_content)
        
        # Create output directory if it doesn't exist
        output_dir = Path("outputs")
        output_dir.mkdir(exist_ok=True)
        
        # Generate output filename
        base_name = Path(file.filename).stem
        output_filename = f"{base_name}_cleaned.html"
        output_path = output_dir / output_filename
        
        # Save cleaned file
        with open(output_path, "w", encoding="utf-8") as f:
            f.write(cleaned_content)
        
        return {
            "success": True,
            "message": "File cleaned successfully",
            "original_filename": file.filename,
            "output_filename": output_filename,
            "download_url": f"/download/{output_filename}",
            "statistics": {
                "total_citations_removed": total_citations,
                "cite_with_numbers": cite_with_numbers,
                "cite_start_markers": cite_start
            }
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")

@app.get("/download/{filename}")
async def download_file(filename: str):
    """
    Download the cleaned HTML file.
    
    Args:
        filename: Name of the file to download
        
    Returns:
        FileResponse with the cleaned HTML file
    """
    file_path = Path("outputs") / filename
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    
    return FileResponse(
        path=file_path,
        filename=filename,
        media_type="text/html"
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
