const API_BASE_URL = 'http://localhost:8080';

// Generate a unique thread ID
function generateThreadID() {
    const threadId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    document.getElementById('thread-id').value = threadId;
    showStatus('graph-status', 'New session ID generated', 'success');
}

// Initialize with a thread ID on page load
window.onload = function() {
    generateThreadID();
};

// Show status message
function showStatus(elementId, message, type) {
    const statusEl = document.getElementById(elementId);
    statusEl.textContent = message;
    statusEl.className = `status-message ${type}`;
}

// Validate and Set API Keys
async function validateAndSetAPI() {
    const gemini = document.getElementById('gemini-api').value.trim();
    const groq = document.getElementById('groq-api').value.trim();
    const tavily = document.getElementById('tavily-api').value.trim();

    if (!gemini || !groq || !tavily) {
        showStatus('api-status', 'Please fill in all API keys', 'error');
        return;
    }

    showStatus('api-status', 'Validating API keys...', 'loading');

    try {
        const response = await fetch(`${API_BASE_URL}/validate_and_set_api`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                gemini: gemini,
                groq: groq,
                tavily: tavily
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            try {
                const errorData = JSON.parse(errorText);
                showStatus('api-status', `Error: ${errorData.detail}`, 'error');
            } catch {
                showStatus('api-status', `Error: ${errorText}`, 'error');
            }
            return;
        }

        const data = await response.json();
        showStatus('api-status', 'API keys validated successfully! ✓', 'success');
    } catch (error) {
        showStatus('api-status', `Error: ${error.message}`, 'error');
    }
}

// Start Graph Analysis
async function startGraph() {
    const threadId = document.getElementById('thread-id').value;
    const text = document.getElementById('patient-summary').value;
    const diagnosisCount = document.getElementById('diagnosis-count').value;
    const medicalReport = document.getElementById('medical-report').value;

    if (!threadId || !text) {
        showStatus('graph-status', 'Please generate a session ID and enter patient summary', 'error');
        return;
    }

    showStatus('graph-status', 'Starting analysis... This may take a few minutes.', 'loading');

    try {
        const response = await fetch(`${API_BASE_URL}/graphstart/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                thread_id: threadId,
                text: text,
                diagnosis_count: diagnosisCount,
                medical_report: medicalReport || ""
            })
        });

        if (!response.ok) {
            throw new Error('Failed to start analysis');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let nodes = [];

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');
            
            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const nodeName = line.substring(6).trim();
                    if (nodeName) {
                        nodes.push(nodeName);
                    }
                }
            }
        }

        showStatus('graph-status', `Analysis complete! Processed nodes: ${nodes.join(' → ')}`, 'success');
    } catch (error) {
        showStatus('graph-status', `Error: ${error.message}`, 'error');
    }
}

// Upload Documents
async function uploadDocuments() {
    const threadId = document.getElementById('thread-id').value;
    const files = document.getElementById('pdf-files').files;

    if (!threadId || files.length === 0) {
        showStatus('upload-status', 'Please select PDF files to upload', 'error');
        return;
    }

    showStatus('upload-status', 'Uploading documents and creating vector database...', 'loading');

    const formData = new FormData();
    formData.append('thread_id', threadId);
    
    for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i]);
    }

    try {
        const response = await fetch(`${API_BASE_URL}/addFilesAndCreateVectorDB`, {
            method: 'POST',
            body: formData
        });

        const data = await response.json();
        
        if (response.ok && data.success) {
            showStatus('upload-status', `Success: ${data.message}`, 'success');
        } else {
            showStatus('upload-status', `Error: ${data.detail || data.message}`, 'error');
        }
    } catch (error) {
        showStatus('upload-status', `Error: ${error.message}`, 'error');
    }
}

// Extract Medical Details
async function extractMedicalDetails() {
    const threadId = document.getElementById('thread-id').value;
    const files = document.getElementById('pdf-files').files;

    if (!threadId || files.length === 0) {
        showStatus('upload-status', 'Please select PDF files', 'error');
        return;
    }

    showStatus('upload-status', 'Extracting medical insights...', 'loading');

    const formData = new FormData();
    formData.append('thread_id', threadId);
    
    for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i]);
    }

    try {
        const response = await fetch(`${API_BASE_URL}/extractMedicalDetails`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Failed to extract medical details');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let nodes = [];

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');
            
            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const nodeName = line.substring(6).trim();
                    if (nodeName) {
                        nodes.push(nodeName);
                    }
                }
            }
        }

        showStatus('upload-status', `Extraction complete! Processed: ${nodes.join(' → ')}`, 'success');
    } catch (error) {
        showStatus('upload-status', `Error: ${error.message}`, 'error');
    }
}

// RAG Search
async function ragSearch() {
    const threadId = document.getElementById('thread-id').value;
    const question = document.getElementById('rag-question').value;

    if (!threadId || !question) {
        showStatus('rag-status', 'Please enter a question', 'error');
        return;
    }

    showStatus('rag-status', 'Searching documents...', 'loading');
    document.getElementById('rag-answer').classList.remove('show');

    try {
        const response = await fetch(`${API_BASE_URL}/ragSearch`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                thread_id: threadId,
                question: question,
                gemini: null
            })
        });

        if (!response.ok) {
            throw new Error('Failed to search documents');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            const chunk = decoder.decode(value);
            // Just acknowledge processing
        }

        // Get the answer
        const answerResponse = await fetch(`${API_BASE_URL}/ragAnswer`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ thread_id: threadId })
        });

        const answerReader = answerResponse.body.getReader();
        const answerDecoder = new TextDecoder();
        let answer = '';

        while (true) {
            const { done, value } = await answerReader.read();
            if (done) break;
            answer += answerDecoder.decode(value);
        }

        const answerBox = document.getElementById('rag-answer');
        answerBox.innerHTML = marked.parse ? marked.parse(answer) : answer;
        answerBox.classList.add('show');
        showStatus('rag-status', 'Search complete!', 'success');
    } catch (error) {
        showStatus('rag-status', `Error: ${error.message}`, 'error');
    }
}

// Get Report
async function getReport(type) {
    const threadId = document.getElementById('thread-id').value;

    if (!threadId) {
        showStatus('graph-status', 'Please generate a session ID first', 'error');
        return;
    }

    const endpoints = {
        'ner': '/nerReport',
        'prelim': '/prelimReport',
        'bestprac': '/bestpracReport',
        'medical': '/medicalInsightReport'
    };

    try {
        const response = await fetch(`${API_BASE_URL}${endpoints[type]}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ thread_id: threadId })
        });

        if (!response.ok) {
            throw new Error('Failed to fetch report');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let report = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            report += decoder.decode(value);
        }

        const reportBox = document.getElementById('report-output');
        reportBox.innerHTML = formatMarkdown(report);
        reportBox.classList.add('show');
    } catch (error) {
        const reportBox = document.getElementById('report-output');
        reportBox.textContent = `Error: ${error.message}`;
        reportBox.classList.add('show');
    }
}

// Upload Image for Vision Analysis
async function uploadImage() {
    const threadId = document.getElementById('thread-id').value;
    const imageFile = document.getElementById('image-upload').files[0];

    if (!threadId || !imageFile) {
        showStatus('vision-status', 'Please select an image', 'error');
        return;
    }

    showStatus('vision-status', 'Uploading image...', 'loading');

    const formData = new FormData();
    formData.append('thread_id', threadId);
    formData.append('image', imageFile);

    try {
        const response = await fetch(`${API_BASE_URL}/input-image/`, {
            method: 'POST',
            body: formData
        });

        const data = await response.json();
        showStatus('vision-status', 'Image uploaded successfully! Now enter your query.', 'success');
    } catch (error) {
        showStatus('vision-status', `Error: ${error.message}`, 'error');
    }
}

// Query Image
async function queryImage() {
    const threadId = document.getElementById('thread-id').value;
    const query = document.getElementById('image-query').value;

    if (!threadId || !query) {
        showStatus('vision-status', 'Please enter a query', 'error');
        return;
    }

    showStatus('vision-status', 'Analyzing image...', 'loading');

    try {
        // Submit query
        const queryResponse = await fetch(`${API_BASE_URL}/input-query/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                thread_id: threadId,
                query: query
            })
        });

        if (!queryResponse.ok) {
            throw new Error('Failed to process query');
        }

        // Get answer
        const answerResponse = await fetch(`${API_BASE_URL}/vision-answer/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ thread_id: threadId })
        });

        const reader = answerResponse.body.getReader();
        const decoder = new TextDecoder();
        let answer = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            answer += decoder.decode(value);
        }

        const answerBox = document.getElementById('vision-answer');
        answerBox.innerHTML = formatMarkdown(answer);
        answerBox.classList.add('show');
        showStatus('vision-status', 'Analysis complete!', 'success');
    } catch (error) {
        showStatus('vision-status', `Error: ${error.message}`, 'error');
    }
}

// Simple markdown formatter
function formatMarkdown(text) {
    if (!text) return '';
    
    // Convert markdown to HTML
    let html = text
        // Headers
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        // Bold
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        // Italic
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        // Lists
        .replace(/^\- (.*$)/gim, '<li>$1</li>')
        // Line breaks
        .replace(/\n\n/g, '<br><br>')
        .replace(/\n/g, '<br>');
    
    // Wrap lists
    html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
    
    return html;
}
