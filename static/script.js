let selectedFile = null;
let cleanedHtmlContent = '';
let originalHtmlContent = '';
let currentMode = 'paste';

// Get DOM elements
const uploadBox = document.getElementById('uploadBox');
const fileInput = document.getElementById('fileInput');
const fileInfo = document.getElementById('fileInfo');
const fileName = document.getElementById('fileName');
const visualization = document.getElementById('visualization');
const errorMessage = document.getElementById('errorMessage');
const uploadBtn = document.querySelector('.upload-btn');
const loader = document.getElementById('loader');
const uploadBtnText = document.getElementById('uploadBtnText');
const htmlInput = document.getElementById('htmlInput');
const pasteMode = document.getElementById('pasteMode');
const uploadMode = document.getElementById('uploadMode');

// Mode switching
function switchMode(mode) {
    currentMode = mode;
    
    // Update button states
    document.getElementById('pasteBtn').classList.toggle('active', mode === 'paste');
    document.getElementById('uploadBtn').classList.toggle('active', mode === 'upload');
    
    // Toggle sections
    pasteMode.classList.toggle('hidden', mode !== 'paste');
    uploadMode.classList.toggle('hidden', mode !== 'upload');
    
    // Hide results
    visualization.classList.add('hidden');
    errorMessage.style.display = 'none';
}

// Clean pasted code
function cleanPastedCode() {
    const htmlCode = htmlInput.value.trim();
    
    if (!htmlCode) {
        showError('Please paste some HTML code first');
        return;
    }
    
    // Store original for preview
    originalHtmlContent = htmlCode;
    
    // Count citations before cleaning (handles commas AND dashes: [cite: 124, 125] or [cite: 105-107])
    const citeWithNumbersMatches = htmlCode.match(/\[cite:\s*[\d,\s\-]+\]/g) || [];
    const citeStartMatches = htmlCode.match(/\[cite_start\]/g) || [];
    
    const citeWithNumbers = citeWithNumbersMatches.length;
    const citeStart = citeStartMatches.length;
    const totalCitations = citeWithNumbers + citeStart;
    
    // Clean the HTML
    let cleaned = htmlCode;
    
    // First, remove tags that ONLY contain cite markers
    cleaned = cleaned.replace(/<p>\s*\[cite_start\]\s*<\/p>/g, '');
    cleaned = cleaned.replace(/<div>\s*\[cite_start\]\s*<\/div>/g, '');
    cleaned = cleaned.replace(/<span>\s*\[cite_start\]\s*<\/span>/g, '');
    
    cleaned = cleaned.replace(/<p>\s*\[cite:\s*[\d,\s\-]+\]\s*<\/p>/g, '');
    cleaned = cleaned.replace(/<div>\s*\[cite:\s*[\d,\s\-]+\]\s*<\/div>/g, '');
    cleaned = cleaned.replace(/<span>\s*\[cite:\s*[\d,\s\-]+\]\s*<\/span>/g, '');
    
    // Then remove cite markers from content (where tags have other text)
    cleaned = cleaned.replace(/\[cite:\s*[\d,\s\-]+\]/g, '');
    cleaned = cleaned.replace(/\[cite_start\]/g, '');
    
    // Store cleaned content
    cleanedHtmlContent = cleaned;
    
    // Copy to clipboard automatically
    copyToClipboard(cleaned);
    
    // Always update live preview
    updateLivePreview(htmlCode, cleaned);
    
    // Display results in visualization section
    displayVisualization(htmlCode, cleaned, totalCitations, citeWithNumbers, citeStart);
}

// Display visualization
function displayVisualization(beforeHtml, afterHtml, totalCitations, citeWithNumbers, citeStart) {
    // Create stats object
    const stats = {
        total_citations_removed: totalCitations,
        cite_with_numbers: citeWithNumbers,
        cite_start_markers: citeStart
    };
    
    // First escape ALL HTML to show it as text
    let escapedHtml = escapeHtml(beforeHtml);
    
    // Now highlight citations in the escaped HTML
    let highlightedBefore = escapedHtml
        // Highlight tags containing only cite_start (already escaped)
        .replace(/&lt;p&gt;\s*\[cite_start\]\s*&lt;\/p&gt;/g, '<span class="highlight-cite">&lt;p&gt;[cite_start]&lt;/p&gt;</span>')
        .replace(/&lt;div&gt;\s*\[cite_start\]\s*&lt;\/div&gt;/g, '<span class="highlight-cite">&lt;div&gt;[cite_start]&lt;/div&gt;</span>')
        .replace(/&lt;span&gt;\s*\[cite_start\]\s*&lt;\/span&gt;/g, '<span class="highlight-cite">&lt;span&gt;[cite_start]&lt;/span&gt;</span>')
        // Highlight cite with numbers (handles commas AND dashes)
        .replace(/\[cite:\s*[\d,\s\-]+\]/g, match => `<span class="highlight-cite">${match}</span>`)
        // Highlight remaining cite_start
        .replace(/\[cite_start\]/g, '<span class="highlight-cite">[cite_start]</span>');
    
    // Update before/after displays
    document.getElementById('beforeCode').innerHTML = highlightedBefore;
    document.getElementById('afterCode').textContent = afterHtml;
    
    // Update statistics
    document.getElementById('totalCitations').textContent = stats.total_citations_removed;
    document.getElementById('totalCitationsViz').textContent = stats.total_citations_removed;
    document.getElementById('citeWithNumbers').textContent = stats.cite_with_numbers;
    document.getElementById('citeStart').textContent = stats.cite_start_markers;
    
    // Update count badges
    const beforeCount = stats.cite_with_numbers + stats.cite_start_markers;
    document.getElementById('beforeCount').textContent = `${beforeCount} citation${beforeCount !== 1 ? 's' : ''}`;
    document.getElementById('afterCount').textContent = 'Clean! ✓';
    
    // Show visualization
    visualization.classList.remove('hidden');
    
    // Scroll to visualization
    setTimeout(() => {
        visualization.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
}

// Escape HTML for display
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Helper function to copy text to clipboard
function copyToClipboard(text, showFeedback = true) {
    // Try modern clipboard API first
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(() => {
            if (showFeedback) {
                showNotification('✓ Cleaned code copied to clipboard!');
            }
        }).catch(err => {
            console.error('Clipboard API failed:', err);
            fallbackCopyToClipboard(text, showFeedback);
        });
    } else {
        fallbackCopyToClipboard(text, showFeedback);
    }
}

// Fallback copy method for older browsers
function fallbackCopyToClipboard(text, showFeedback = true) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    textarea.style.top = '0';
    document.body.appendChild(textarea);
    
    textarea.select();
    textarea.setSelectionRange(0, 99999);
    
    let success = false;
    try {
        success = document.execCommand('copy');
    } catch (err) {
        console.error('Copy failed:', err);
    }
    
    document.body.removeChild(textarea);
    
    if (success && showFeedback) {
        showNotification('✓ Cleaned code copied to clipboard!');
    } else if (!success) {
        showError('Copy failed. Please copy manually.');
    }
}

// Copy cleaned code to clipboard
function copyCleanedCode() {
    if (!cleanedHtmlContent) {
        showError('No cleaned code to copy');
        return;
    }
    
    copyToClipboard(cleanedHtmlContent);
    
    // Visual feedback on button
    if (event && event.target) {
        showCopySuccess(event.target);
    }
}

// Select all cleaned code text
function selectCleanedCode() {
    const afterCodeElement = document.getElementById('afterCode');
    
    if (!afterCodeElement || !cleanedHtmlContent) {
        showError('No cleaned code to select');
        return;
    }
    
    // Highlight the code panel
    afterCodeElement.classList.add('selectable');
    
    // Create a range and select the text
    if (window.getSelection) {
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(afterCodeElement);
        selection.removeAllRanges();
        selection.addRange(range);
        
        // Show success message
        const btn = event.target;
        const originalText = btn.textContent;
        btn.textContent = '✓ Text Selected!';
        btn.style.background = 'linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)';
        
        setTimeout(() => {
            btn.textContent = originalText;
            btn.style.background = '';
            afterCodeElement.classList.remove('selectable');
        }, 3000);
        
        // Scroll to the selected text
        afterCodeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

// Show copy success feedback
function showCopySuccess(btn, message = '✓ Copied!') {
    const originalText = btn.textContent;
    btn.textContent = message;
    btn.style.background = 'linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)';
    
    setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = '';
    }, 2000);
}

// Show notification message
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        background: ${type === 'success' ? 'linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)' : 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        font-weight: 600;
        animation: slideInRight 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Download cleaned code as file
function downloadCleanedCode() {
    if (!cleanedHtmlContent) {
        showError('No cleaned code to download');
        return;
    }
    
    const blob = new Blob([cleanedHtmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cleaned_code.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Toggle live preview
function togglePreview() {
    const checkbox = document.getElementById('showPreview');
    const previewSection = document.getElementById('livePreviewSection');
    const htmlInput = document.getElementById('htmlInput');
    
    if (checkbox.checked) {
        previewSection.classList.remove('hidden');
        const html = htmlInput.value.trim();
        if (html) {
            const cleaned = cleanHtmlContent(html);
            updateLivePreview(html, cleaned);
        }
    } else {
        previewSection.classList.add('hidden');
    }
}

// Update live preview panels with rendered HTML
function updateLivePreview(originalHtml, cleanedHtml) {
    const beforePreview = document.getElementById('beforePreview');
    const afterPreview = document.getElementById('afterPreview');
    const previewSection = document.getElementById('livePreviewSection');
    
    if (beforePreview && afterPreview) {
        // Render HTML content with highlighted citations in before preview
        beforePreview.innerHTML = originalHtml;
        afterPreview.innerHTML = cleanedHtml;
        
        // Highlight citations in the rendered preview
        highlightCitationsInPreview(beforePreview);
        
        // Show the preview section
        if (previewSection) {
            previewSection.classList.remove('hidden');
        }
        
        // Render LaTeX/MathJax if present
        if (window.MathJax && window.MathJax.typesetPromise) {
            MathJax.typesetPromise([beforePreview, afterPreview]).catch((err) => {
                console.log('MathJax rendering error:', err);
            });
        }
    }
}

// Highlight citations in the rendered preview
function highlightCitationsInPreview(element) {
    if (!element) return;
    
    // Get all text nodes
    const walker = document.createTreeWalker(
        element,
        NodeFilter.SHOW_TEXT,
        null,
        false
    );
    
    const textNodes = [];
    let node;
    while (node = walker.nextNode()) {
        textNodes.push(node);
    }
    
    // Process each text node
    textNodes.forEach(textNode => {
        const text = textNode.textContent;
        
        // Check if text contains citations
        if (text.match(/\[cite(_start|:\s*[\d,\s\-]+)\]/)) {
            const parent = textNode.parentNode;
            const fragment = document.createDocumentFragment();
            let lastIndex = 0;
            
            // Match all citation patterns
            const regex = /\[cite(_start|:\s*[\d,\s\-]+)\]/g;
            let match;
            
            while ((match = regex.exec(text)) !== null) {
                // Add text before citation
                if (match.index > lastIndex) {
                    fragment.appendChild(
                        document.createTextNode(text.substring(lastIndex, match.index))
                    );
                }
                
                // Add highlighted citation
                const span = document.createElement('span');
                span.className = 'preview-cite-highlight';
                span.textContent = match[0];
                span.title = 'This citation will be removed';
                fragment.appendChild(span);
                
                lastIndex = match.index + match[0].length;
            }
            
            // Add remaining text
            if (lastIndex < text.length) {
                fragment.appendChild(
                    document.createTextNode(text.substring(lastIndex))
                );
            }
            
            // Replace the text node with the fragment
            parent.replaceChild(fragment, textNode);
        }
    });
}

// Clean HTML content (helper function)
function cleanHtmlContent(html) {
    let cleaned = html;
    
    // First, remove tags that ONLY contain cite markers
    cleaned = cleaned.replace(/<p>\s*\[cite_start\]\s*<\/p>/g, '');
    cleaned = cleaned.replace(/<div>\s*\[cite_start\]\s*<\/div>/g, '');
    cleaned = cleaned.replace(/<span>\s*\[cite_start\]\s*<\/span>/g, '');
    
    cleaned = cleaned.replace(/<p>\s*\[cite:\s*[\d,\s\-]+\]\s*<\/p>/g, '');
    cleaned = cleaned.replace(/<div>\s*\[cite:\s*[\d,\s\-]+\]\s*<\/div>/g, '');
    cleaned = cleaned.replace(/<span>\s*\[cite:\s*[\d,\s\-]+\]\s*<\/span>/g, '');
    
    // Then remove cite markers from content (handles commas AND dashes)
    cleaned = cleaned.replace(/\[cite:\s*[\d,\s\-]+\]/g, '');
    cleaned = cleaned.replace(/\[cite_start\]/g, '');
    
    return cleaned;
}

// Auto-update preview on input
document.addEventListener('DOMContentLoaded', function() {
    const htmlInput = document.getElementById('htmlInput');
    if (htmlInput) {
        let typingTimer;
        const doneTypingInterval = 500; // Wait 500ms after user stops typing
        
        htmlInput.addEventListener('input', function() {
            clearTimeout(typingTimer);
            const checkbox = document.getElementById('showPreview');
            
            if (checkbox && checkbox.checked) {
                typingTimer = setTimeout(function() {
                    const html = htmlInput.value.trim();
                    if (html) {
                        const cleaned = cleanHtmlContent(html);
                        updateLivePreview(html, cleaned);
                    }
                }, doneTypingInterval);
            }
        });
    }
});

// Copy as Rich Text (HTML format)
function copyAsRichText() {
    if (!cleanedHtmlContent) {
        showError('No cleaned code to copy');
        return;
    }
    
    // Try to copy as HTML using clipboard API
    if (navigator.clipboard && window.ClipboardItem) {
        const blob = new Blob([cleanedHtmlContent], { type: 'text/html' });
        const clipboardItem = new ClipboardItem({ 'text/html': blob });
        
        navigator.clipboard.write([clipboardItem])
            .then(() => {
                showCopySuccess(event.target, '✓ Copied as Rich Text!');
            })
            .catch(() => {
                // Fallback to plain copy
                copyCleanedCode();
            });
    } else {
        // Fallback to regular copy
        copyCleanedCode();
    }
}

// Copy with formatting (indented HTML)
function copyFormatted() {
    if (!cleanedHtmlContent) {
        showError('No cleaned code to copy');
        return;
    }
    
    const formatted = formatHTML(cleanedHtmlContent);
    
    const textarea = document.createElement('textarea');
    textarea.value = formatted;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    
    let success = false;
    try {
        success = document.execCommand('copy');
    } catch (err) {
        console.error('Copy failed:', err);
    }
    
    document.body.removeChild(textarea);
    
    if (success) {
        showCopySuccess(event.target, '✨ Copied Formatted!');
    } else {
        showError('Auto-copy failed. Please try another copy method');
    }
}

// Simple HTML formatter
function formatHTML(html) {
    let formatted = '';
    let indent = 0;
    const tab = '  ';
    
    // Split by tags but keep them
    const parts = html.split(/(<[^>]+>)/g);
    
    parts.forEach(part => {
        const trimmed = part.trim();
        if (!trimmed) return;
        
        if (trimmed.startsWith('</')) {
            // Closing tag - decrease indent before adding
            indent = Math.max(0, indent - 1);
            formatted += tab.repeat(indent) + trimmed + '\n';
        } else if (trimmed.startsWith('<') && !trimmed.endsWith('/>')) {
            // Opening tag - add then increase indent
            formatted += tab.repeat(indent) + trimmed + '\n';
            if (!trimmed.startsWith('<!')) {
                indent++;
            }
        } else if (trimmed.startsWith('<') && trimmed.endsWith('/>')) {
            // Self-closing tag
            formatted += tab.repeat(indent) + trimmed + '\n';
        } else {
            // Text content
            formatted += tab.repeat(indent) + trimmed + '\n';
        }
    });
    
    return formatted;
}

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
    uploadBox.classList.add('hidden');
    fileInfo.classList.remove('hidden');
    visualization.classList.add('hidden');
    errorMessage.style.display = 'none';
}

function clearFile() {
    selectedFile = null;
    fileInput.value = '';
    uploadBox.classList.remove('hidden');
    fileInfo.classList.add('hidden');
    visualization.classList.add('hidden');
    errorMessage.style.display = 'none';
}

async function uploadFile() {
    if (!selectedFile) {
        showError('Please select a file first');
        return;
    }
    
    // Read file and process like pasted code
    const reader = new FileReader();
    reader.onload = function(e) {
        const htmlCode = e.target.result;
        
        // Count citations before cleaning (handles commas AND dashes)
        const citeWithNumbersMatches = htmlCode.match(/\[cite:\s*[\d,\s\-]+\]/g) || [];
        const citeStartMatches = htmlCode.match(/\[cite_start\]/g) || [];
        
        const citeWithNumbers = citeWithNumbersMatches.length;
        const citeStart = citeStartMatches.length;
        const totalCitations = citeWithNumbers + citeStart;
        
        // Clean the HTML
        let cleaned = htmlCode;
        
        // First, remove tags that ONLY contain cite markers
        cleaned = cleaned.replace(/<p>\s*\[cite_start\]\s*<\/p>/g, '');
        cleaned = cleaned.replace(/<div>\s*\[cite_start\]\s*<\/div>/g, '');
        cleaned = cleaned.replace(/<span>\s*\[cite_start\]\s*<\/span>/g, '');
        
        cleaned = cleaned.replace(/<p>\s*\[cite:\s*[\d,\s\-]+\]\s*<\/p>/g, '');
        cleaned = cleaned.replace(/<div>\s*\[cite:\s*[\d,\s\-]+\]\s*<\/div>/g, '');
        cleaned = cleaned.replace(/<span>\s*\[cite:\s*[\d,\s\-]+\]\s*<\/span>/g, '');
        
        // Then remove cite markers from content (handles commas AND dashes)
        cleaned = cleaned.replace(/\[cite:\s*[\d,\s\-]+\]/g, '');
        cleaned = cleaned.replace(/\[cite_start\]/g, '');
        
        cleanedHtmlContent = cleaned;
        
        // Display visualization
        displayVisualization(htmlCode, cleaned, totalCitations, citeWithNumbers, citeStart);
        
        // Hide file info
        fileInfo.classList.add('hidden');
    };
    
    reader.onerror = function() {
        showError('Failed to read file');
    };
    
    reader.readAsText(selectedFile);
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
    htmlInput.value = '';
    cleanedHtmlContent = '';
    
    if (currentMode === 'paste') {
        visualization.classList.add('hidden');
    } else {
        uploadBox.classList.remove('hidden');
        fileInfo.classList.add('hidden');
        visualization.classList.add('hidden');
    }
    
    errorMessage.style.display = 'none';
    
    // Scroll to the input section based on current mode
    if (currentMode === 'paste') {
        const pasteSection = document.getElementById('pasteMode');
        if (pasteSection) {
            pasteSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            // Focus on the textarea after scrolling
            setTimeout(() => {
                htmlInput.focus();
            }, 500);
        }
    } else {
        const uploadSection = document.getElementById('uploadMode');
        if (uploadSection) {
            uploadSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
}
