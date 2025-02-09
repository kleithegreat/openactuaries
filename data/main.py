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
INTERIM_DIR = Path(__file__).parent / "interim_results"
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

def save_interim_results(exam_code: str, page_num: int, data: List[Dict], output_type: str) -> None:
    """Save intermediate results for a specific page"""
    if not INTERIM_DIR.exists():
        INTERIM_DIR.mkdir(parents=True)
        
    output_path = INTERIM_DIR / f"{exam_code.lower()}_{output_type}_page_{page_num}.json"
    with open(output_path, "w") as f:
        json.dump(data, f, indent=2)
    logging.info(f"Saved interim results for {exam_code} {output_type} page {page_num}")

def load_interim_results(exam_code: str, output_type: str) -> Dict[int, List[Dict]]:
    """Load all existing interim results for an exam"""
    results = {}
    if not INTERIM_DIR.exists():
        return results
        
    pattern = f"{exam_code.lower()}_{output_type}_page_*.json"
    for file_path in INTERIM_DIR.glob(pattern):
        try:
            page_num = int(file_path.stem.split('_')[-1])
            with open(file_path) as f:
                results[page_num] = json.load(f)
        except (ValueError, json.JSONDecodeError) as e:
            logging.error(f"Failed to load interim results from {file_path}: {e}")
    
    return results

def save_debug_image(image: Image.Image, exam_code: str, page_num: int, type_prefix: str) -> None:
    """Save a debug image during test mode"""
    debug_dir = Path(__file__).parent / "debug_images"
    if not debug_dir.exists():
        debug_dir.mkdir(parents=True)
    
    output_path = debug_dir / f"{exam_code.lower()}_{type_prefix}_page_{page_num}.png"
    image.save(output_path)
    logging.info(f"Saved debug image to {output_path}")

def pdf_to_base64(
    pdf_path: Path, 
    page_range: Tuple[int, int], 
    exam_code: str = None,
    type_prefix: str = None,
    test_mode: bool = False
) -> List[str]:
    """Convert PDF pages to base64-encoded PNG images"""
    try:
        pages = convert_from_path(
            pdf_path,
            first_page=page_range[0] + 1,  # pdf2image uses 1-based indexing
            last_page=page_range[1]
        )
        
        encoded_pages = []
        for i, page in enumerate(pages):
            # if test_mode and exam_code and type_prefix:
            #     save_debug_image(page, exam_code, i, type_prefix)
            
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
    page_num: int,
) -> List[Dict]:
    """Process a single page through Claude API with interim saves"""
    existing_results = load_interim_results(exam_code, output_type)
    if page_num in existing_results:
        logging.info(f"Loading cached results for {exam_code} {output_type} page {page_num}")
        return existing_results[page_num]
    
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
        
        try:
            results = json.loads(response.content[0].text)
            save_interim_results(exam_code, page_num, results, output_type)
            return results
        except json.JSONDecodeError as e:
            logging.error(f"Failed to parse JSON for page {page_num}: {e}")
            logging.error(f"Raw response: {response.content[0].text}")
            return []
            
    except APIError as e:
        logging.error(f"API processing failed for page {page_num}: {e}")
        return []

def build_prompts(exam_code: str) -> Tuple[str, str]:
    """Construct processing prompts for questions and answers"""
    question_prompt = f"""
    Process this SOA {exam_code} practice exam page. Return a JSON array of exam questions. If no questions are found on the page (e.g., cover pages, introductions), return an empty array [].

    Each question object must have this exact structure:
    {{
        "exam": "{exam_code}",
        "question": number,
        "content": "markdown compliant string with KaTeX math",
        "choices": [
            {{
                "letter": "A",
                "content": "markdown compliant choice text with KaTeX for math"
            }},
            ...
        ],
        "syllabus_category": "string from {SYLLABUS_CATEGORIES.get(exam_code, [])} that best represents this question",
        "severity": "number from 1 to 5 representing how confidently you believe your transcription is correct, 5 being the least confident"
    }}

    IMPORTANT: You must ALWAYS return a valid JSON array, even if empty. Do not include any explanatory text or messages. If you believe the page definitely requires manual review, set the severity to 5.
    Some questions will contain tables; use markdown to represent them as best as possible.
    Include all numbers in the question and answer choices as math expressions.
    If a number is used with a percent sign (like 25%), use the percent sign in the math expression and escape it accordingly.
    Make sure that all dollar amounts are represented as "X dollars".
    For example, $100 should be represented as "100 dollars". DO NOT FORGET THIS RULE. IF YOU FORGET THIS RULE, ONE MILLION KITTENS WILL BE SAD.
    If a question contains a list of information, use a markdown list.
    If the order of the list content does not matter, use an unordered list.
    If the order of the list content does matter, use an ordered list (1., 2., 3., etc.).
    If a question contains ambiguous or unclear content, do your best to transcribe it accurately.

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
    Process this SOA {exam_code} practice exam page for answers. Return a JSON array of answers. If no answers are found on the page (e.g., cover pages, introductions), return an empty array [].

    Each answer object must have this exact structure:
    {{
        "question": number,
        "answer": "letter"
        "explanation": "markdown compliant string with KaTeX math"
    }}

    IMPORTANT: You must ALWAYS return a valid JSON array, even if empty. Do not include any explanatory text or messages.

    Example responses:
    1. For a page with no answers: []
    2. For a page with answers:
    [
        {{
            "question": 1,
            "answer": "B"
            "explanation": "The probability of $X > 3$ is calculated by..."
        }}
    ]
    """
    return question_prompt, answer_prompt

def merge_data(questions: List[Dict], answers: List[Dict]) -> List[Dict]:
    """Merge questions with their answers and explanations"""
    answer_map = {
        a["question"]: {
            "answer": a["answer"],
            "explanation": a["explanation"]
        } for a in answers
    }
    
    return [
        {
            **q,
            "answer": answer_map.get(q["question"], {}).get("answer"),
            "explanation": answer_map.get(q["question"], {}).get("explanation")
        }
        for q in questions
    ]

def process_exam(
    client: Anthropic,
    exam_code: str,
    test_mode: bool = False,
) -> Optional[List[Dict]]:
    """Process complete exam data with interim saves"""
    try:
        q_path = PDF_DIR / EXAM_CONFIG[exam_code]["questions"]
        a_path = PDF_DIR / EXAM_CONFIG[exam_code]["answers"]
        
        page_range = (1, 6) if test_mode else None
        question_pages = pdf_to_base64(
            q_path, 
            page_range or (0, len(pypdf.PdfReader(q_path).pages)),
            exam_code=exam_code,
            type_prefix="questions",
            test_mode=test_mode
        )
        q_prompt, a_prompt = build_prompts(exam_code)
        
        questions = []
        for page_num, page in enumerate(question_pages):
            page_questions = process_page(
                client, exam_code, page, q_prompt, "questions", page_num
            )
            questions.extend(page_questions)
            logging.info(f"Processed question page {page_num + 1}/{len(question_pages)}")
        
        answer_pages = pdf_to_base64(
            a_path, 
            page_range or (0, len(pypdf.PdfReader(a_path).pages)),
            exam_code=exam_code,
            type_prefix="answers",
            test_mode=test_mode
        )
        answers = []
        for page_num, page in enumerate(answer_pages):
            page_answers = process_page(
                client, exam_code, page, a_prompt, "answers", page_num
            )
            answers.extend(page_answers)
            logging.info(f"Processed answer page {page_num + 1}/{len(answer_pages)}")
        
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
    
    client = Anthropic(api_key=api_key)
    
    for directory in [OUTPUT_DIR, INTERIM_DIR]:
        if not directory.exists():
            directory.mkdir(parents=True)
    
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