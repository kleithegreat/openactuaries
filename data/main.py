"""
Usage:
- Set ANTHROPIC_API_KEY environment variable
- Modify EXAM_CONFIG and SYLLABUS_CATEGORIES as needed
- Run with --test for quick verification
"""

import os
import base64
import json
import logging
from pdf2image import convert_from_path
import io
from PIL import Image
from pathlib import Path
from typing import Dict, List, Tuple, Optional
import pypdf
from anthropic import Anthropic, APIError

# Constants
PDF_DIR = Path(__file__).parent / "pdf"
OUTPUT_DIR = Path(__file__).parent / "processed"
EXAM_CONFIG = {
    "P": {
        "questions": "edu-exam-p-sample-quest.pdf",
        "answers": "edu-exam-p-sample-sol.pdf",
    },
    "FM": {
        "questions": "exam-fm-sample-questions.pdf",
        "answers": "2018-10-exam-fm-sample-solutions.pdf",
    },
}

SYLLABUS_CATEGORIES = {
    "P": [
        "General Probability",
        "Univariate Random Variables",
        "Multivariate Random Variables",
    ],
    "FM": [
        "Time Value of Money",
        "Annuities",
        "Bonds",
        "Cash Flows, Portfolios, and Asset Liability Management",
    ],
}

API_CONFIG = {
    "model": "claude-3-5-sonnet-20241022",
    "max_tokens": 4096,
    "temperature": 0,
}

def setup_logging() -> None:
    logging.basicConfig(
        format="%(asctime)s - %(levelname)s - %(message)s",
        level=logging.INFO,
    )

def pdf_to_base64(pdf_path: Path, page_range: Tuple[int, int]) -> List[str]:
    """Convert PDF pages to base64-encoded PNG images"""
    try:
        pages = convert_from_path(
            pdf_path,
            first_page=page_range[0] + 1,  # pdf2image uses 1-based indexing
            last_page=page_range[1]
        )
        
        encoded_pages = []
        for page in pages:
            img_byte_arr = io.BytesIO()
            page.save(img_byte_arr, format='PNG')
            img_byte_arr = img_byte_arr.getvalue()
            
            encoded = base64.b64encode(img_byte_arr).decode('utf-8')
            encoded_pages.append(encoded)
            
        return encoded_pages
            
    except Exception as e:
        logging.error(f"PDF processing failed: {e}")
        raise

def process_page(
    client: Anthropic,
    exam_code: str,
    page_base64: str,
    prompt_template: str,
    output_type: str,
) -> List[Dict]:
    """Process a single page through Claude API"""
    try:
        response = client.messages.create(
            **API_CONFIG,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt_template},
                        {
                            "type": "image",
                            "source": {
                                "type": "base64",
                                "media_type": "image/png",
                                "data": page_base64,
                            },
                        },
                    ],
                }
            ],
        )
        logging.info(f"Claude response: {response.content[0].text}")
        
        try:
            return json.loads(response.content[0].text)
        except json.JSONDecodeError as e:
            logging.error(f"Failed to parse JSON: {e}")
            logging.error(f"Raw response: {response.content[0].text}")
            return []
            
    except (APIError, json.JSONDecodeError) as e:
        logging.error(f"API processing failed: {e}")
        return []

def build_prompts(exam_code: str) -> Tuple[str, str]:
    """Construct processing prompts for questions and answers"""
    question_prompt = f"""
    Process this {exam_code} exam page. Return a JSON array of exam questions. If no questions are found on the page (e.g., cover pages, introductions), return an empty array [].

    Each question object must have this exact structure:
    {{
        "exam": "{exam_code}",
        "question": number,
        "content": "string with KaTeX math",
        "choices": [
            {{
                "letter": "A",
                "content": "choice text with KaTeX"
            }},
            ...
        ],
        "syllabus_category": "string from {SYLLABUS_CATEGORIES.get(exam_code, [])}",
        "severity": number (1-5, where 5=lowest confidence)
    }}

    IMPORTANT: You must ALWAYS return a valid JSON array, even if empty. Do not include any explanatory text or messages.

    Example responses:
    1. For a page with no questions: []
    2. For a page with questions:
    [
        {{
            "exam": "{exam_code}",
            "question": 1,
            "content": "Calculate $P(X > 3)$ where $X$ follows...",
            "choices": [
                {{
                    "letter": "A",
                    "content": "$0.25$"
                }},
                {{
                    "letter": "B",
                    "content": "$0.35$"
                }}
            ],
            "syllabus_category": "{SYLLABUS_CATEGORIES.get(exam_code, [])[0]}",
            "severity": 1
        }}
    ]
    """
    
    answer_prompt = f"""
    Process this {exam_code} exam page for answers. Return a JSON array of answers. If no answers are found on the page (e.g., cover pages, introductions), return an empty array [].

    Each answer object must have this exact structure:
    {{
        "question": number,
        "answer": "letter"
    }}

    IMPORTANT: You must ALWAYS return a valid JSON array, even if empty. Do not include any explanatory text or messages.

    Example responses:
    1. For a page with no answers: []
    2. For a page with answers:
    [
        {{
            "question": 1,
            "answer": "B"
        }}
    ]
    """
    return question_prompt, answer_prompt

def merge_data(questions: List[Dict], answers: List[Dict]) -> List[Dict]:
    """Merge questions with their answers"""
    answer_map = {a["question"]: a["answer"] for a in answers}
    return [
        {**q, "answer": answer_map.get(q["question"], None)}
        for q in questions
    ]

def process_exam(
    client: Anthropic,
    exam_code: str,
    test_mode: bool = False,
) -> Optional[List[Dict]]:
    """Process complete exam data"""
    try:
        q_path = PDF_DIR / EXAM_CONFIG[exam_code]["questions"]
        a_path = PDF_DIR / EXAM_CONFIG[exam_code]["answers"]
        
        page_range = (1, 2) if test_mode else None
        question_pages = pdf_to_base64(q_path, page_range or (0, len(pypdf.PdfReader(q_path).pages)))
        q_prompt, a_prompt = build_prompts(exam_code)
        
        questions = [
            q for page in question_pages
            for q in process_page(client, exam_code, page, q_prompt, "questions")
        ]
        
        answer_pages = pdf_to_base64(a_path, page_range or (0, len(pypdf.PdfReader(a_path).pages)))
        answers = [
            a for page in answer_pages
            for a in process_page(client, exam_code, page, a_prompt, "answers")
        ]
        
        return merge_data(questions, answers)
    except Exception as e:
        logging.error(f"Failed processing {exam_code}: {e}")
        return None

def main(test_mode: bool = False) -> None:
    """Main processing pipeline"""
    setup_logging()
    api_key = os.getenv("ANTHROPIC_API_KEY")
    logging.info(f"API key found: {bool(api_key)}")
    if not api_key:
        logging.error("No ANTHROPIC_API_KEY environment variable found")
        return
    client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
    
    if not OUTPUT_DIR.exists():
        OUTPUT_DIR.mkdir()
    
    for exam_code in EXAM_CONFIG:
        logging.info(f"Processing {exam_code} exam...")
        exam_data = process_exam(client, exam_code, test_mode)
        
        if exam_data:
            output_path = OUTPUT_DIR / f"{exam_code.lower()}_exam.json"
            with open(output_path, "w") as f:
                json.dump(exam_data, f, indent=2)
            logging.info(f"Saved {len(exam_data)} questions to {output_path}")

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Process actuarial exam data")
    parser.add_argument("--test", action="store_true", help="Test mode (first page only)")
    args = parser.parse_args()
    
    main(test_mode=args.test)