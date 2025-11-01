# HTML Cite Cleaner

A FastAPI web application that removes citation markers from HTML files while preserving the HTML structure.

## Features

- 🧹 Removes `[cite: numbers]` patterns (e.g., `[cite: 124, 125]`)
- 🧹 Removes `[cite_start]` markers
- 📊 Shows statistics of removed citations
- 🎨 Modern, responsive UI with drag-and-drop support
- ⚡ Fast processing with FastAPI backend
- 💾 Download cleaned HTML files

## Installation

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Create required directories:
```bash
mkdir outputs
```

## Usage

1. Start the server:
```bash
python main.py
```

2. Open your browser and navigate to:
```
http://localhost:8000
```

3. Upload your HTML file by:
   - Dragging and dropping it onto the upload box
   - Or clicking "Browse Files" to select it

4. Click "Clean & Download" to process the file

5. Download your cleaned HTML file

## Project Structure

```
html-block-checker/
├── main.py                 # FastAPI backend
├── requirements.txt        # Python dependencies
├── templates/
│   └── index.html         # Frontend HTML
├── static/
│   ├── style.css          # Styling
│   └── script.js          # Frontend JavaScript
├── outputs/               # Cleaned files (auto-created)
└── sample.html            # Sample file with citations
```

## How It Works

The application processes HTML in two steps:

**Step 1:** Remove tags that ONLY contain cite markers (no other text):
- `<p>[cite_start]</p>` → Entire tag removed
- `<p>[cite: 123]</p>` → Entire tag removed
- `<div>[cite_start]</div>` → Entire tag removed
- `<span>[cite: 456, 789]</span>` → Entire tag removed

**Step 2:** Remove cite markers from tags that have other content:
- `<p>Some text [cite: 123]</p>` → `<p>Some text </p>`
- `[cite_start]Other text` → `Other text`
- `Text [cite: 124, 125] more text` → `Text  more text`

The HTML structure remains completely intact during the cleaning process.

## API Endpoints

- `GET /` - Main web interface
- `POST /upload` - Upload and clean HTML file
- `GET /download/{filename}` - Download cleaned file

## Example

**Before:**
```html
<p>[cite_start]</p>
The text here. [cite: 124, 125] [cite_start]More text [cite: 126]
```

**After:**
```html

The text here. More text 
```

## Requirements

- Python 3.7+
- FastAPI
- Uvicorn
- python-multipart

## License

MIT License
