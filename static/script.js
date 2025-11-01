let selectedFile = null;

// Get DOM elements
const uploadBox = document.getElementById('uploadBox');
const fileInput = document.getElementById('fileInput');
const fileInfo = document.getElementById('fileInfo');
const fileName = document.getElementById('fileName');
const results = document.getElementById('results');
const errorMessage = document.getElementById('errorMessage');
const uploadBtn = document.querySelector('.upload-btn');
const loader = document.getElementById('loader');
const uploadBtnText = document.getElementById('uploadBtnText');

// Drag and drop handlers
uploadBox.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadBox.classList.add('drag-over');
});

uploadBox.addEventListener('dragleave', () => {
    uploadBox.classList.remove('drag-over');
});

uploadBox.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadBox.classList.remove('drag-over');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFileSelect(files[0]);
    }
});

// Click to upload
uploadBox.addEventListener('click', () => {
    fileInput.click();
});

// File input change
fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handleFileSelect(e.target.files[0]);
    }
});

function handleFileSelect(file) {
    // Validate file type
    if (!file.name.endsWith('.html')) {
        showError('Please select an HTML file (.html)');
        return;
    }
    
    selectedFile = file;
    fileName.textContent = file.name;
    
    // Hide upload box and show file info
    uploadBox.style.display = 'none';
    fileInfo.style.display = 'block';
    results.style.display = 'none';
    errorMessage.style.display = 'none';
}

function clearFile() {
    selectedFile = null;
    fileInput.value = '';
    uploadBox.style.display = 'block';
    fileInfo.style.display = 'none';
    results.style.display = 'none';
    errorMessage.style.display = 'none';
}

async function uploadFile() {
    if (!selectedFile) {
        showError('Please select a file first');
        return;
    }
    
    // Show loader
    uploadBtn.disabled = true;
    loader.style.display = 'block';
    uploadBtnText.textContent = 'Processing...';
    errorMessage.style.display = 'none';
    
    const formData = new FormData();
    formData.append('file', selectedFile);
    
    try {
        const response = await fetch('/upload', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.detail || 'Upload failed');
        }
        
        // Show results
        displayResults(data);
        
    } catch (error) {
        showError(error.message || 'An error occurred while processing the file');
        uploadBtn.disabled = false;
        loader.style.display = 'none';
        uploadBtnText.textContent = 'Clean & Download';
    }
}

function displayResults(data) {
    // Update statistics
    document.getElementById('totalCitations').textContent = 
        data.statistics.total_citations_removed;
    document.getElementById('citeWithNumbers').textContent = 
        data.statistics.cite_with_numbers;
    document.getElementById('citeStart').textContent = 
        data.statistics.cite_start_markers;
    
    // Set download link
    const downloadLink = document.getElementById('downloadLink');
    downloadLink.href = data.download_url;
    downloadLink.download = data.output_filename;
    
    // Hide file info and show results
    fileInfo.style.display = 'none';
    results.style.display = 'block';
    
    // Reset upload button
    uploadBtn.disabled = false;
    loader.style.display = 'none';
    uploadBtnText.textContent = 'Clean & Download';
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    
    // Auto hide after 5 seconds
    setTimeout(() => {
        errorMessage.style.display = 'none';
    }, 5000);
}

function resetForm() {
    selectedFile = null;
    fileInput.value = '';
    uploadBox.style.display = 'block';
    fileInfo.style.display = 'none';
    results.style.display = 'none';
    errorMessage.style.display = 'none';
    uploadBtn.disabled = false;
    loader.style.display = 'none';
    uploadBtnText.textContent = 'Clean & Download';
}
