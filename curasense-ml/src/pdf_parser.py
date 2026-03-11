"""
PDF Parser Module for CuraSense Diagnosis
Extracts text content from PDF files for medical diagnosis processing.
"""

import io
import PyPDF2
import pdfplumber
from typing import Optional


def extract_text_pypdf2(pdf_file) -> str:
    """
    Extract text from PDF using PyPDF2.
    
    Args:
        pdf_file: File-like object or bytes of the PDF
        
    Returns:
        str: Extracted text content
    """
    try:
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        text = ""
        
        for page_num in range(len(pdf_reader.pages)):
            page = pdf_reader.pages[page_num]
            text += page.extract_text() + "\n"
        
        return text.strip()
    except Exception as e:
        raise Exception(f"PyPDF2 extraction failed: {str(e)}")


def extract_text_pdfplumber(pdf_file) -> str:
    """
    Extract text from PDF using pdfplumber (more accurate for complex layouts).
    
    Args:
        pdf_file: File-like object or bytes of the PDF
        
    Returns:
        str: Extracted text content
    """
    try:
        with pdfplumber.open(pdf_file) as pdf:
            text = ""
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
        
        return text.strip()
    except Exception as e:
        raise Exception(f"pdfplumber extraction failed: {str(e)}")


def extract_text_from_pdf(pdf_file, method: str = "pdfplumber") -> str:
    """
    Main function to extract text from PDF with fallback mechanism.
    
    Args:
        pdf_file: File-like object or bytes of the PDF
        method: Preferred extraction method ("pdfplumber" or "pypdf2")
        
    Returns:
        str: Extracted text content
        
    Raises:
        Exception: If text extraction fails with both methods
    """
    # Reset file pointer if it's a file-like object
    if hasattr(pdf_file, 'seek'):
        pdf_file.seek(0)
    
    # Try preferred method first
    try:
        if method == "pdfplumber":
            text = extract_text_pdfplumber(pdf_file)
            if text:
                return text
        else:
            text = extract_text_pypdf2(pdf_file)
            if text:
                return text
    except Exception as primary_error:
        print(f"Primary method ({method}) failed: {primary_error}")
    
    # Reset file pointer for fallback
    if hasattr(pdf_file, 'seek'):
        pdf_file.seek(0)
    
    # Try fallback method
    try:
        fallback_method = "pypdf2" if method == "pdfplumber" else "pdfplumber"
        if fallback_method == "pdfplumber":
            text = extract_text_pdfplumber(pdf_file)
        else:
            text = extract_text_pypdf2(pdf_file)
        
        if text:
            return text
        else:
            raise Exception("No text could be extracted from the PDF")
    except Exception as fallback_error:
        raise Exception(f"Both extraction methods failed. Last error: {fallback_error}")


def validate_pdf_content(text: str) -> tuple[bool, Optional[str]]:
    """
    Validate that the extracted text is suitable for medical analysis.
    
    Args:
        text: Extracted text content
        
    Returns:
        tuple: (is_valid, error_message)
    """
    if not text or len(text.strip()) == 0:
        return False, "PDF appears to be empty or contains only images"
    
    if len(text.strip()) < 10:
        return False, "PDF content is too short for meaningful analysis"
    
    # You can add more medical-specific validation here
    # For example, check for common medical terms
    
    return True, None


def process_pdf_file(file_content: bytes) -> dict:
    """
    Process uploaded PDF file and extract text (synchronous version).
    
    Args:
        file_content: Raw bytes of the uploaded PDF file
        
    Returns:
        dict: Contains 'text' and 'status' keys
    """
    try:
        # Create file-like object from bytes
        pdf_file = io.BytesIO(file_content)
        
        # Extract text
        text = extract_text_from_pdf(pdf_file)
        
        # Validate content
        is_valid, error_msg = validate_pdf_content(text)
        
        if not is_valid:
            return {
                "status": "error",
                "error": error_msg,
                "text": None
            }
        
        return {
            "status": "success",
            "text": text,
            "error": None
        }
        
    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
            "text": None
        }
