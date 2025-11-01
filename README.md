# 🧹 HTML Citation Cleaner

[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104.1-green.svg)](https://fastapi.tiangolo.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Deploy](https://img.shields.io/badge/Azure-Deployed-0078D4.svg)](https://html-citation-cleaner-3841.azurewebsites.net)

A powerful web application built with **FastAPI** that intelligently removes citation markers from HTML files while preserving the complete HTML structure, formatting, and LaTeX content. Perfect for cleaning academic content, research papers, and educational materials.

## ✨ Features

### Core Functionality
- 🧹 **Smart Citation Removal** - Removes `[cite: numbers]` patterns (e.g., `[cite: 124, 125]`)
- 🗑️ **Empty Tag Cleanup** - Removes tags containing only `[cite_start]` markers
- � **LaTeX Support** - Preserves and renders mathematical formulas with MathJax
- 🎯 **Dual Mode** - Paste HTML code OR upload files
- 📊 **Real-time Statistics** - Live count of removed citations

### Advanced UI Features
- 🎨 **Modern Glass Morphism Design** - Beautiful gradient backgrounds with glass effects
- 📱 **Fully Responsive** - Works perfectly on desktop, tablet, and mobile
- 👁️ **Live Preview** - See rendered HTML before and after cleaning with LaTeX rendering
- 💻 **Code Comparison** - Syntax-highlighted before/after code view
- 📋 **6 Copy Methods** - Clipboard, Rich Text, Formatted, Select All, Download, Reset
- 🎬 **Smooth Animations** - Engaging transitions and micro-interactions
- 🌈 **Interactive Demo** - Live example with real academic content
- ⚡ **Auto-Update Preview** - Real-time preview updates as you type (500ms debounce)

## 🚀 Live Demo

### Try it now:
- **Azure**: [https://html-citation-cleaner-3841.azurewebsites.net](https://html-citation-cleaner-3841.azurewebsites.net)
- **Region**: Central India (Low latency for Asia-Pacific)
- **Status**: ✅ Live and Running

## 🛠️ Installation

### Prerequisites
- Python 3.11 or higher
- pip (Python package manager)

### Local Setup

1. **Clone the repository:**
```bash
git clone https://github.com/algsoch/html-checker.git
cd html-checker
```

2. **Install dependencies:**
```bash
pip install -r requirements.txt
```

3. **Run the application:**
```bash
python main.py
```

4. **Open your browser:**
```
http://localhost:8000
```

## 📖 Usage

### Method 1: Paste HTML Code
1. Navigate to the **Paste Mode** tab
2. Paste your HTML code into the textarea
3. Click "✨ Clean HTML Code"
4. View the before/after comparison and live preview
5. Copy or download the cleaned HTML

### Method 2: Upload HTML File
1. Navigate to the **Upload Mode** tab
2. Drag & drop your HTML file OR click "Browse Files"
3. Click "Clean & Download"
4. Your cleaned file will be downloaded automatically

### Live Preview Features
- **Code View**: Syntax-highlighted before/after comparison
- **Rendered View**: See actual HTML output with LaTeX formulas
- **Statistics**: Total citations removed, breakdown by type
- **6 Copy Options**: Choose your preferred copy method

## 🏗️ Project Structure

```
html-citation-cleaner/
├── main.py                     # FastAPI backend with cleaning logic
├── requirements.txt            # Python dependencies
├── startup.sh                  # Azure startup script
├── render.yaml                 # Render deployment config
├── .github/
│   └── workflows/
│       └── azure-deploy.yml    # GitHub Actions CI/CD
├── templates/
│   ├── index.html             # Main UI with live preview
│   └── public/
│       └── images/
│           └── filter.png      # App favicon
├── static/
│   ├── style.css              # Advanced styling (glass morphism)
│   ├── script.js              # Frontend logic + MathJax integration
├── outputs/                    # Cleaned files directory
├── sample.html                 # Sample citation-filled HTML
└── sample1.html                # Demo content (Chemistry Question)
```

## 🔧 How It Works

The application uses a **two-step intelligent cleaning algorithm**:

### Step 1: Remove Empty Citation Tags
Removes entire HTML tags that contain ONLY cite markers (no other text):

| Before | After |
|--------|-------|
| `<p>[cite_start]</p>` | *(removed)* |
| `<p>[cite: 123]</p>` | *(removed)* |
| `<div>[cite_start]</div>` | *(removed)* |
| `<span>[cite: 456, 789]</span>` | *(removed)* |

### Step 2: Remove Inline Citation Markers
Removes cite markers from tags that contain other content:

| Before | After |
|--------|-------|
| `<p>Some text [cite: 123]</p>` | `<p>Some text </p>` |
| `[cite_start]Other text` | `Other text` |
| `Text [cite: 124, 125] more` | `Text  more` |
| `Formula \(C_6H_{14}\) [cite: 130]` | `Formula \(C_6H_{14}\)` |

**✅ The HTML structure and LaTeX formulas remain completely intact!**

## 🌐 Deployment

### Deploy to Azure (Free Tier)

```bash
# Using Azure CLI
az webapp up --name your-app-name --resource-group your-rg --runtime "PYTHON:3.11" --sku F1 --location centralindia
```

**Supported Regions:**
- `centralindia` - Best for India/Asia
- `eastus` - Best for US East Coast
- `westus2` - Best for US West Coast
- `southeastasia` - Best for Southeast Asia
- `westeurope` - Best for Europe
- `uksouth` - Best for UK

### Deploy to Render (Free Tier)

1. Fork this repository
2. Go to [Render Dashboard](https://render.com)
3. Click "New +" → "Web Service"
4. Connect your GitHub repo
5. Render auto-detects `render.yaml` configuration
6. Click "Create Web Service"

**Auto-deploys** on every push to main branch!

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Main web interface |
| `POST` | `/upload` | Upload and clean HTML file |
| `GET` | `/download/{filename}` | Download cleaned file |
| `GET` | `/static/*` | Serve static assets (CSS/JS) |
| `GET` | `/templates/public/*` | Serve public assets (images) |

## 💡 Example Transformation

## 💡 Example Transformation

**Input HTML:**
```html
<p>[cite_start]</p>
<div>The Lewis electron-dot diagrams [cite: 124, 125] show molecular structure.</div>
<p>\(HClO_{3}\) is the stronger acid [cite: 130] due to electronegativity.</p>
```

**Output HTML:**
```html

<div>The Lewis electron-dot diagrams  show molecular structure.</div>
<p>\(HClO_{3}\) is the stronger acid  due to electronegativity.</p>
```

**✨ Notice:** LaTeX `\(HClO_{3}\)` is perfectly preserved!

## 🛡️ Technology Stack

- **Backend**: FastAPI (Python 3.11+)
- **ASGI Server**: Uvicorn with Gunicorn workers
- **Frontend**: HTML5, CSS3 (Glass Morphism), Vanilla JavaScript
- **Math Rendering**: MathJax 3
- **Deployment**: Azure App Service (Free F1), Render (Free)
- **CI/CD**: GitHub Actions
- **Version Control**: Git/GitHub

## 📊 Performance

- ⚡ **Fast Processing**: Handles large HTML files (100KB+) in milliseconds
- 🎯 **Accuracy**: 100% citation removal without structure damage
- 📱 **Responsive**: Works on devices from 320px to 4K displays
- 🔄 **Auto-Deploy**: GitHub push → Live in 2 minutes
- 💾 **Memory Efficient**: Minimal server resource usage

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Nishant Pratap Singh**
- GitHub: [@algsoch](https://github.com/algsoch)
- LinkedIn: [Connect with me](https://linkedin.com/in/your-profile)

## 🙏 Acknowledgments

- FastAPI for the amazing web framework
- MathJax for LaTeX rendering support
- Microsoft Azure for free hosting
- Render for seamless deployment

## 📞 Support

If you found this project helpful, please give it a ⭐️!

For issues or questions, please [open an issue](https://github.com/algsoch/html-checker/issues).

---

<div align="center">
Made with ❤️ for the academic community | Deployed on Azure & Render
</div>
