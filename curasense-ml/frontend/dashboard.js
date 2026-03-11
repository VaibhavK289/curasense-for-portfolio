// Global state
let currentSection = 'home';
let uploadedFile = null;
let analysisResults = null;
let conversationHistory = []; // Track conversation for context

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    initializeUpload();
    loadRecentReports();
    initializeChatbot();
});

// Navigation
function initializeNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            switchSection(section);
        });
    });
}

function switchSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show target section
    document.getElementById(`section-${sectionName}`).classList.add('active');
    
    // Update navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-section') === sectionName) {
            item.classList.add('active');
        }
    });
    
    currentSection = sectionName;
}

// File Upload
function initializeUpload() {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    
    dropZone.addEventListener('click', () => fileInput.click());
    
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });
    
    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });
    
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileSelect(files[0]);
        }
    });
    
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFileSelect(e.target.files[0]);
        }
    });
}

async function handleFileSelect(file) {
    uploadedFile = file;
    showLoading();
    
    try {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch('/diagnose/pdf/', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        hideLoading();
        
        if (data.status === 'success') {
            displayAnalysisResults(data.report);
            showNotification('Analysis complete!', 'success');
        } else {
            showNotification('Error: ' + data.error, 'error');
        }
    } catch (error) {
        hideLoading();
        showNotification('Upload failed: ' + error.message, 'error');
    }
}

// Medicine Analysis
async function analyzeMedicine() {
    const inputText = document.getElementById('manualEntry').value.trim();
    
    if (!inputText) {
        showNotification('Please enter medicine details', 'warning');
        return;
    }
    
    showLoading();
    
    try {
        const response = await fetch('/diagnose/text/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text: inputText })
        });
        
        const data = await response.json();
        hideLoading();
        
        if (data.status === 'success') {
            displayAnalysisResults(data.report);
            addToRecentReports(inputText);
            showNotification('Analysis complete!', 'success');
        } else {
            showNotification('Error: ' + data.error, 'error');
        }
    } catch (error) {
        hideLoading();
        showNotification('Analysis failed: ' + error.message, 'error');
    }
}

function displayAnalysisResults(report) {
    analysisResults = report;
    
    // Show NER results section
    const nerResults = document.getElementById('nerResults');
    nerResults.style.display = 'block';
    
    // Parse NER data from report
    const nerTableBody = document.getElementById('nerTableBody');
    try {
        // Extract medicine information from the report
        const medicines = extractMedicinesFromReport(report);
        
        if (medicines.length > 0) {
            nerTableBody.innerHTML = medicines.map(med => `
                <tr>
                    <td>${med.name || 'N/A'}</td>
                    <td>${med.dosage || 'N/A'}</td>
                    <td>${med.frequency || 'N/A'}</td>
                    <td>${med.duration || 'N/A'}</td>
                    <td><span class="status-badge ${med.status}">${med.statusText}</span></td>
                </tr>
            `).join('');
        } else {
            nerTableBody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center;">Processing NER data from report...</td>
                </tr>
            `;
        }
    } catch (e) {
        console.error('Error parsing NER data:', e);
        nerTableBody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center;">Unable to extract structured data</td>
            </tr>
        `;
    }
    
    // Update analysis section
    const analysisContent = document.querySelector('#analysisResults .analysis-content');
    if (analysisContent) {
        analysisContent.innerHTML = `<div class="markdown-content">${markdownToHtml(report)}</div>`;
    }
    
    // Update final report
    const finalReport = document.getElementById('finalReportContent');
    if (finalReport) {
        finalReport.innerHTML = `<div class="markdown-content">${markdownToHtml(report)}</div>`;
    }
    
    // Notify user they can ask questions about the report
    addChatMessage('📋 Analysis complete! I now have access to your diagnosis report. You can ask me questions about:\n- Medicines and dosages\n- Diagnosis details\n- Side effects and safety\n- Treatment recommendations\n\nWhat would you like to know?', 'bot');
}

function extractMedicinesFromReport(report) {
    // Try to extract medicine information from the report
    // This is a simplified parser - adjust based on actual report format
    const medicines = [];
    
    // Look for common patterns in medical reports
    const lines = report.split('\n');
    let inMedicineSection = false;
    
    for (const line of lines) {
        // Detect medicine sections
        if (line.toLowerCase().includes('medication') || 
            line.toLowerCase().includes('prescription') ||
            line.toLowerCase().includes('drug')) {
            inMedicineSection = true;
            continue;
        }
        
        // Parse medicine entries (adjust regex based on actual format)
        if (inMedicineSection && line.trim()) {
            // Example patterns to match
            const medMatch = line.match(/(\w+)\s*(\d+\s*mg)?/i);
            if (medMatch) {
                medicines.push({
                    name: medMatch[1],
                    dosage: medMatch[2] || 'Not specified',
                    frequency: 'See report',
                    duration: 'See report',
                    status: 'validated',
                    statusText: 'Validated'
                });
            }
        }
        
        // Stop parsing after certain sections
        if (line.toLowerCase().includes('diagnosis') || 
            line.toLowerCase().includes('conclusion')) {
            inMedicineSection = false;
        }
    }
    
    return medicines;
}

function markdownToHtml(markdown) {
    // Use marked.js if available, otherwise fallback to simple conversion
    if (!markdown) return '<p>No report available</p>';
    
    if (typeof marked !== 'undefined') {
        try {
            return marked.parse(markdown);
        } catch (e) {
            console.error('Marked.js error:', e);
        }
    }
    
    // Fallback simple conversion
    return markdown
        .replace(/#{3} (.*?)$/gm, '<h3>$1</h3>')
        .replace(/#{2} (.*?)$/gm, '<h2>$1</h2>')
        .replace(/#{1} (.*?)$/gm, '<h1>$1</h1>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/^\* (.*?)$/gm, '<li>$1</li>')
        .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
        .replace(/\n\n/g, '</p><p>')
        .replace(/^(.+)$/gm, '<p>$1</p>');
}

// Smart Parse
async function smartParse() {
    const inputText = document.getElementById('manualEntry').value.trim();
    
    if (!inputText) {
        showNotification('Please enter text to parse', 'warning');
        return;
    }
    
    showLoading();
    // Simulate parsing delay
    setTimeout(() => {
        hideLoading();
        showNotification('Smart parsing complete!', 'success');
        
        // Fill in parsed data
        document.getElementById('patientName').value = 'John D.';
        document.getElementById('patientAge').value = '45';
    }, 1500);
}

// Recent Reports
function loadRecentReports() {
    const reportsContainer = document.getElementById('recentReports');
    const reports = getStoredReports();
    
    if (reports.length === 0) {
        reportsContainer.innerHTML = '<p class="no-data">No recent reports. Upload a prescription to get started.</p>';
        return;
    }
    
    reportsContainer.innerHTML = reports.map(report => `
        <div class="report-item" onclick="viewReport('${report.id}')">
            <strong>${report.patientName || 'Patient'}</strong> - ${report.type}
            <span class="report-date">Created ${report.date}</span>
        </div>
    `).join('');
}

function addToRecentReports(text) {
    const reports = getStoredReports();
    reports.unshift({
        id: Date.now(),
        patientName: document.getElementById('patientName').value || 'Unknown',
        type: 'Pain Management',
        date: new Date().toLocaleDateString(),
        content: text
    });
    
    localStorage.setItem('curasenseReports', JSON.stringify(reports.slice(0, 10)));
    loadRecentReports();
}

function getStoredReports() {
    const stored = localStorage.getItem('curasenseReports');
    return stored ? JSON.parse(stored) : [];
}

function viewReport(reportId) {
    const reports = getStoredReports();
    const report = reports.find(r => r.id == reportId);
    if (report) {
        document.getElementById('finalReportContent').innerHTML = `
            <h3>${report.patientName} - ${report.type}</h3>
            <p>${report.content}</p>
        `;
        switchSection('reports');
    }
}

// Assistant Chatbot
function initializeChatbot() {
    // Add welcome message
    setTimeout(() => {
        addChatMessage('Hello! I\'m your CuraSense AI assistant. Upload a prescription and I can answer questions about your diagnosis report, medicines, dosages, side effects, and treatment recommendations. How can I help you today?', 'bot');
    }, 500);
}

function toggleAssistant() {
    const sidebar = document.getElementById('assistantSidebar');
    const toggleBtn = document.querySelector('.assistant-toggle');
    sidebar.classList.toggle('open');
    
    // Hide toggle button when sidebar is open to prevent overlap
    if (sidebar.classList.contains('open')) {
        toggleBtn.style.opacity = '0';
        toggleBtn.style.pointerEvents = 'none';
        toggleBtn.style.transform = 'scale(0.5)';
    } else {
        toggleBtn.style.opacity = '1';
        toggleBtn.style.pointerEvents = 'auto';
        toggleBtn.style.transform = 'scale(1)';
    }
}

async function sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Add user message to UI and history
    addChatMessage(message, 'user');
    conversationHistory.push({ role: 'user', content: message });
    input.value = '';
    
    // Show typing indicator
    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'chat-message bot typing';
    typingIndicator.innerHTML = '<p>AI is thinking...</p>';
    const messagesContainer = document.getElementById('chatMessages');
    messagesContainer.appendChild(typingIndicator);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    try {
        // Call backend API with full context
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                message: message,
                report_context: analysisResults || '',
                conversation_history: conversationHistory.slice(-10) // Send last 10 messages
            })
        });
        
        // Remove typing indicator
        typingIndicator.remove();
        
        const data = await response.json();
        const botResponse = data.response || 'Sorry, I could not process that.';
        
        // Add bot response to UI and history
        addChatMessage(botResponse, 'bot');
        conversationHistory.push({ role: 'assistant', content: botResponse });
        
        // Keep conversation history manageable (last 20 messages)
        if (conversationHistory.length > 20) {
            conversationHistory = conversationHistory.slice(-20);
        }
        
    } catch (error) {
        console.error('Chat error:', error);
        typingIndicator.remove();
        
        // Fallback error message
        const errorMsg = 'I\'m having trouble connecting right now. Please try again in a moment.';
        addChatMessage(errorMsg, 'bot');
    }
}

function addChatMessage(message, sender) {
    const messagesContainer = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${sender}`;
    
    // Format message with line breaks and better styling
    const formattedMessage = message.replace(/\n/g, '<br>');
    messageDiv.innerHTML = `<p>${formattedMessage}</p>`;
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function generateBotResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('paracetamol') || lowerMessage.includes('safe')) {
        return 'Paracetamol is generally preferred, but keep total <3g/day to avoid liver issues under 2-3 gm/day and consult your doctor.';
    } else if (lowerMessage.includes('warfarin')) {
        return 'Is Paracetamol safe with Warfarin? Paracetamol is generally preferred, but keep total <3g/day to avoid liver issues under 2-3 gm/day and consult your doctor.';
    } else {
        return 'I can help you analyze prescriptions and check medicine safety. Upload a prescription or ask about specific medicines!';
    }
}

// Modal Functions
function showUploadModal() {
    document.getElementById('fileInput').click();
}

function showManualEntryModal() {
    switchSection('home');
    document.getElementById('manualEntry').focus();
}

function showCompareModal() {
    switchSection('compare');
}

// Search
function searchContent() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    if (!searchTerm) return;
    
    showNotification(`Searching for: ${searchTerm}`, 'info');
}

// Report Actions
function downloadReport() {
    const reportContent = document.getElementById('finalReportContent').innerText;
    
    if (!reportContent || reportContent.includes('No analysis')) {
        showNotification('No report to download. Complete an analysis first.', 'warning');
        return;
    }
    
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `medical-report-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    
    showNotification('Report downloaded successfully!', 'success');
}

function shareWithDoctor() {
    const reportContent = document.getElementById('finalReportContent').innerText;
    
    if (!reportContent || reportContent.includes('No analysis')) {
        showNotification('No report to share. Complete an analysis first.', 'warning');
        return;
    }
    
    // Show share modal
    document.getElementById('shareModal').style.display = 'flex';
    document.getElementById('emailForm').style.display = 'none';
    document.querySelector('.share-options').style.display = 'grid';
}

function closeShareModal() {
    document.getElementById('shareModal').style.display = 'none';
    document.getElementById('emailForm').style.display = 'none';
    document.querySelector('.share-options').style.display = 'grid';
}

function shareViaEmail() {
    document.querySelector('.share-options').style.display = 'none';
    document.getElementById('emailForm').style.display = 'block';
}

function backToShareOptions() {
    document.getElementById('emailForm').style.display = 'none';
    document.querySelector('.share-options').style.display = 'grid';
}

function sendEmailReport() {
    const doctorEmail = document.getElementById('doctorEmail').value;
    const patientEmail = document.getElementById('patientEmail').value;
    const message = document.getElementById('emailMessage').value;
    const reportContent = document.getElementById('finalReportContent').innerText;
    
    if (!doctorEmail || !patientEmail) {
        showNotification('Please fill in all required email fields', 'warning');
        return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(doctorEmail) || !emailRegex.test(patientEmail)) {
        showNotification('Please enter valid email addresses', 'warning');
        return;
    }
    
    // Create email body
    const subject = encodeURIComponent('Medical Report - CuraSense Diagnosis');
    const body = encodeURIComponent(
        `Dear Doctor,\n\n${message ? message + '\n\n' : ''}` +
        `Please find the medical analysis report below:\n\n` +
        `${reportContent}\n\n` +
        `Best regards,\n` +
        `${patientEmail}\n\n` +
        `Generated by CuraSense Diagnosis System\n` +
        `Date: ${new Date().toLocaleString()}`
    );
    
    // Open default email client
    window.location.href = `mailto:${doctorEmail}?subject=${subject}&body=${body}`;
    
    showNotification('Opening email client...', 'success');
    closeShareModal();
}

function copyReportLink() {
    const reportContent = document.getElementById('finalReportContent').innerText;
    
    // Create a shareable text version
    const shareableText = `Medical Report - CuraSense Diagnosis\n` +
        `Generated: ${new Date().toLocaleString()}\n` +
        `\n${reportContent}\n\n` +
        `Generated by CuraSense AI-Powered Medical Analysis`;
    
    // Copy to clipboard
    navigator.clipboard.writeText(shareableText).then(() => {
        showNotification('Report content copied to clipboard!', 'success');
        closeShareModal();
    }).catch(err => {
        showNotification('Failed to copy. Please try downloading instead.', 'error');
    });
}

function downloadReportPDF() {
    const reportContent = document.getElementById('finalReportContent').innerText;
    const patientName = document.getElementById('patientName')?.value || 'Patient';
    
    // Create formatted text document (PDF generation would require a library)
    const formattedReport = 
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `       MEDICAL ANALYSIS REPORT\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
        `Patient: ${patientName}\n` +
        `Date: ${new Date().toLocaleString()}\n` +
        `Generated by: CuraSense Diagnosis AI\n\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
        `${reportContent}\n\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `This report was generated using AI-powered analysis.\n` +
        `Please consult with a qualified healthcare professional.\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
    
    const blob = new Blob([formattedReport], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `medical-report-${patientName.replace(/\s+/g, '-')}-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    
    showNotification('Report downloaded successfully!', 'success');
    closeShareModal();
}

function printReport() {
    const reportContent = document.getElementById('finalReportContent').innerHTML;
    const patientName = document.getElementById('patientName')?.value || 'Patient';
    
    // Create print window
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Medical Report - ${patientName}</title>
            <style>
                body {
                    font-family: 'Poppins', Arial, sans-serif;
                    max-width: 800px;
                    margin: 40px auto;
                    padding: 20px;
                    color: #1e293b;
                    line-height: 1.7;
                }
                h1 {
                    color: #3b82f6;
                    border-bottom: 3px solid #3b82f6;
                    padding-bottom: 10px;
                    margin-bottom: 20px;
                }
                .header {
                    text-align: center;
                    margin-bottom: 30px;
                }
                .patient-info {
                    background: #f8fafc;
                    padding: 15px;
                    border-radius: 8px;
                    margin-bottom: 20px;
                }
                .footer {
                    margin-top: 40px;
                    padding-top: 20px;
                    border-top: 2px solid #e2e8f0;
                    font-size: 12px;
                    color: #64748b;
                    text-align: center;
                }
                @media print {
                    body { margin: 0; }
                    .no-print { display: none; }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>🏥 CuraSense Medical Analysis Report</h1>
            </div>
            <div class="patient-info">
                <strong>Patient:</strong> ${patientName}<br>
                <strong>Date:</strong> ${new Date().toLocaleString()}<br>
                <strong>Generated by:</strong> CuraSense AI Diagnosis System
            </div>
            <div class="report-content">
                ${reportContent}
            </div>
            <div class="footer">
                <p>This report was generated using AI-powered analysis.</p>
                <p>Please consult with a qualified healthcare professional for medical advice.</p>
                <p>© 2025 CuraSense Diagnosis System</p>
            </div>
        </body>
        </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    
    // Wait for content to load then print
    setTimeout(() => {
        printWindow.print();
        printWindow.close();
    }, 500);
    
    showNotification('Opening print dialog...', 'info');
    closeShareModal();
}

function addPatientInfo() {
    const name = prompt('Enter patient name:');
    if (name) {
        document.getElementById('patientName').value = name;
        showNotification('Patient info added', 'success');
    }
}

// Loading & Notifications
function showLoading() {
    document.getElementById('loadingOverlay').style.display = 'flex';
}

function hideLoading() {
    document.getElementById('loadingOverlay').style.display = 'none';
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">✕</button>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : type === 'warning' ? '#ff9800' : '#2196f3'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        display: flex;
        align-items: center;
        gap: 15px;
        z-index: 3000;
        animation: slideIn 0.3s ease-out;
    `;
    
    notification.querySelector('button').style.cssText = `
        background: none;
        border: none;
        color: white;
        font-size: 1.2rem;
        cursor: pointer;
        padding: 0;
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// X-Ray Analysis Functions
const XRAY_API_BASE = 'http://localhost:8001'; // ML-FastAPI server
let xrayThreadId = null;
let xrayImageUploaded = false;
let xrayGeneratedReport = '';

// Initialize X-ray upload
document.addEventListener('DOMContentLoaded', function() {
    const xrayDropZone = document.getElementById('xrayDropZone');
    const xrayFileInput = document.getElementById('xrayFileInput');
    
    if (xrayDropZone && xrayFileInput) {
        // Click to upload
        xrayDropZone.addEventListener('click', (e) => {
            if (!e.target.classList.contains('btn-secondary')) {
                xrayFileInput.click();
            }
        });
        
        // Drag and drop
        xrayDropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            xrayDropZone.style.borderColor = '#357abd';
            xrayDropZone.style.background = '#eef5fb';
        });
        
        xrayDropZone.addEventListener('dragleave', () => {
            xrayDropZone.style.borderColor = '#4a90e2';
            xrayDropZone.style.background = '#f8fafc';
        });
        
        xrayDropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            xrayDropZone.style.borderColor = '#4a90e2';
            xrayDropZone.style.background = '#f8fafc';
            
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) {
                handleXrayFile(file);
            }
        });
        
        // File input change
        xrayFileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                handleXrayFile(file);
            }
        });
    }
});

function handleXrayFile(file) {
    // Show preview
    const placeholder = document.getElementById('xrayPlaceholder');
    const preview = document.getElementById('xrayPreview');
    const previewImage = document.getElementById('xrayPreviewImage');
    const uploadBtn = document.getElementById('uploadXrayBtn');
    
    const reader = new FileReader();
    reader.onload = (e) => {
        previewImage.src = e.target.result;
        placeholder.style.display = 'none';
        preview.style.display = 'block';
        uploadBtn.disabled = false;
    };
    reader.readAsDataURL(file);
    
    // Store file for upload
    window.xrayFile = file;
}

function removeXrayImage() {
    const placeholder = document.getElementById('xrayPlaceholder');
    const preview = document.getElementById('xrayPreview');
    const uploadBtn = document.getElementById('uploadXrayBtn');
    const fileInput = document.getElementById('xrayFileInput');
    
    placeholder.style.display = 'block';
    preview.style.display = 'none';
    uploadBtn.disabled = true;
    fileInput.value = '';
    window.xrayFile = null;
    
    // Reset all sections
    document.getElementById('xrayReportCard').style.display = 'none';
    document.getElementById('xrayQueryCard').style.display = 'none';
}

async function uploadAndAnalyzeXray() {
    if (!window.xrayFile) {
        showXrayStatus('Please select an image first', 'error');
        return;
    }
    
    // Generate unique thread ID
    xrayThreadId = 'xray_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    
    const formData = new FormData();
    formData.append('thread_id', xrayThreadId);
    formData.append('image', window.xrayFile);
    
    // Show report card with loading
    document.getElementById('xrayReportCard').style.display = 'block';
    document.getElementById('xrayLoading').style.display = 'block';
    document.getElementById('xrayReportResult').style.display = 'none';
    document.getElementById('xrayReportActions').style.display = 'none';
    showXrayStatus('Uploading image...', 'info');
    
    try {
        // Step 1: Upload image
        const uploadResponse = await fetch(`${XRAY_API_BASE}/input-image/`, {
            method: 'POST',
            body: formData
        });
        
        if (!uploadResponse.ok) {
            throw new Error('Failed to upload image');
        }
        
        const uploadData = await uploadResponse.json();
        console.log('Upload response:', uploadData);
        
        showXrayStatus('Image uploaded! Generating AI report...', 'info');
        xrayImageUploaded = true;
        
        // Step 2: Automatically generate initial report
        await generateInitialReport();
        
    } catch (error) {
        console.error('Error uploading X-ray:', error);
        document.getElementById('xrayLoading').style.display = 'none';
        showXrayStatus('❌ Failed to upload image. Make sure the X-ray analysis server is running on port 8001.', 'error');
    }
}

async function generateInitialReport() {
    try {
        // Submit automatic query for comprehensive report
        const initialQuery = "Please provide a comprehensive analysis of this medical image including: 1) Image quality and type, 2) Anatomical structures visible, 3) Any abnormalities or findings, 4) Clinical significance, and 5) Recommendations.";
        
        const queryResponse = await fetch(`${XRAY_API_BASE}/input-query/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                thread_id: xrayThreadId,
                query: initialQuery
            })
        });
        
        if (!queryResponse.ok) {
            throw new Error('Failed to process initial query');
        }
        
        console.log('Query submitted, fetching answer...');
        
        // Wait a moment for processing
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Get the generated report
        const answerResponse = await fetch(`${XRAY_API_BASE}/vision-answer/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ thread_id: xrayThreadId })
        });
        
        const reader = answerResponse.body.getReader();
        const decoder = new TextDecoder();
        let report = '';
        
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            report += decoder.decode(value);
        }
        
        // Store and display the report
        xrayGeneratedReport = report;
        document.getElementById('xrayLoading').style.display = 'none';
        document.getElementById('xrayReportResult').style.display = 'block';
        document.getElementById('xrayReportResult').innerHTML = marked.parse(report);
        document.getElementById('xrayReportActions').style.display = 'flex';
        
        showXrayStatus('✅ Report generated successfully!', 'success');
        
    } catch (error) {
        console.error('Error generating report:', error);
        document.getElementById('xrayLoading').style.display = 'none';
        document.getElementById('xrayReportResult').style.display = 'block';
        document.getElementById('xrayReportResult').innerHTML = 
            '<p style="color: red;">❌ Failed to generate report. Please try again or check if the X-ray analysis server is running.</p>';
    }
}

function showQuestionSection() {
    document.getElementById('xrayQueryCard').style.display = 'block';
    document.getElementById('xrayQuery').focus();
    
    // Scroll to question section
    document.getElementById('xrayQueryCard').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

async function askXrayQuestion() {
    const query = document.getElementById('xrayQuery').value.trim();
    
    if (!query) {
        showXrayStatus('Please enter a question', 'error');
        return;
    }
    
    if (!xrayImageUploaded) {
        showXrayStatus('Please upload an image first', 'error');
        return;
    }
    
    // Add user message to conversation
    addConversationMessage('user', query);
    
    // Clear input
    document.getElementById('xrayQuery').value = '';
    
    // Show typing indicator
    const typingId = addConversationMessage('assistant', '💭 Analyzing...', true);
    
    try {
        // Submit query
        const queryResponse = await fetch(`${XRAY_API_BASE}/input-query/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                thread_id: xrayThreadId,
                query: query
            })
        });
        
        if (!queryResponse.ok) {
            throw new Error('Failed to process query');
        }
        
        // Wait for processing
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Get answer
        const answerResponse = await fetch(`${XRAY_API_BASE}/vision-answer/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ thread_id: xrayThreadId })
        });
        
        const reader = answerResponse.body.getReader();
        const decoder = new TextDecoder();
        let answer = '';
        
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            answer += decoder.decode(value);
        }
        
        // Remove typing indicator
        removeConversationMessage(typingId);
        
        // Add assistant response
        addConversationMessage('assistant', answer);
        
    } catch (error) {
        console.error('Error asking question:', error);
        removeConversationMessage(typingId);
        addConversationMessage('assistant', '❌ Sorry, I encountered an error processing your question. Please try again.');
    }
}

function addConversationMessage(sender, content, isTyping = false) {
    const conversationArea = document.getElementById('xrayConversation');
    const messageId = 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `conversation-message ${sender}`;
    messageDiv.id = messageId;
    
    const label = sender === 'user' ? '👤 You' : '🤖 AI Assistant';
    
    const contentHtml = sender === 'assistant' && !isTyping 
        ? marked.parse(content) 
        : `<p>${content}</p>`;
    
    messageDiv.innerHTML = `
        <div class="label">${label}</div>
        <div class="content">${contentHtml}</div>
    `;
    
    conversationArea.appendChild(messageDiv);
    conversationArea.scrollTop = conversationArea.scrollHeight;
    
    return messageId;
}

function removeConversationMessage(messageId) {
    const message = document.getElementById(messageId);
    if (message) {
        message.remove();
    }
}

function showXrayStatus(message, type) {
    const statusDiv = document.getElementById('uploadStatus');
    statusDiv.textContent = message;
    statusDiv.className = `status-message ${type}`;
    statusDiv.style.display = 'block';
}

function downloadXrayReport() {
    const reportContent = xrayGeneratedReport || document.getElementById('xrayReportResult').innerText;
    const conversation = document.getElementById('xrayConversation').innerText;
    
    const fullReport = `═══════════════════════════════════════════════════════════
    CuraSense Diagnosis - Medical Image Analysis Report
═══════════════════════════════════════════════════════════

Generated: ${new Date().toLocaleString()}
Report ID: ${xrayThreadId}

───────────────────────────────────────────────────────────
INITIAL AI ANALYSIS
───────────────────────────────────────────────────────────

${reportContent}

${conversation ? `
───────────────────────────────────────────────────────────
Q&A SESSION
───────────────────────────────────────────────────────────

${conversation}
` : ''}

───────────────────────────────────────────────────────────
IMPORTANT DISCLAIMER
───────────────────────────────────────────────────────────

⚠️ This report is generated by an AI system for educational 
and informational purposes only. It should NOT be used as a 
substitute for professional medical advice, diagnosis, or 
treatment.

Always seek the advice of your physician or other qualified 
health provider with any questions you may have regarding a 
medical condition. Never disregard professional medical advice 
or delay in seeking it because of something you have read in 
this AI-generated report.

═══════════════════════════════════════════════════════════
`;
    
    const blob = new Blob([fullReport], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `xray-analysis-${xrayThreadId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    
    showXrayStatus('✅ Report downloaded successfully!', 'success');
}
