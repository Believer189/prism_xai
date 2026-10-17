# project_root/backend/decoder/identifier.py

SUTRA_KNOWLEDGE_BASE = {
    "baudhayana_sqrt": {
        "keywords": ["samasya", "dvikarani", "pramana", "bakhshali", "square", "root", "समस्य", "द्विकरणी", "प्रमाणं"],
        "method_name": "Baudhayana / Bakhshali Square Root Approximation",
        "usage": "Used historically in Sulba Sutras for constructing complex fire altars requiring precise diagonal measurements.",
        "solves": "Calculates the square root of non-perfect squares iteratively.",
        "significance": "Provides a highly accurate rational approximation of surds (like √2) using iterative geometric error correction."
    },
    "aryabhata_pi": {
        "keywords": ["chaturadhikam", "shatamashtagunam", "ayutadvaya", "vishkambhasya", "circle", "circumference", "चतुरधिकं", "वृत्तपरिणाहः", "शतमष्टगुणं"],
        "method_name": "Aryabhata's Pi Approximation",
        "usage": "Used in astronomy for calculating planetary orbits and the circumference of celestial spheres.",
        "solves": "Approximates the ratio of a circle's circumference to its diameter (π).",
        "significance": "Gives a highly accurate four-decimal-place value of π (3.1416) and historically hinted at its incommensurability (irrational nature)."
    },
    "kuttaka_diophantine": {
        "keywords": ["kuttaka", "pulverizer", "dividend", "divisor", "remainder", "diophantine", "ax", "अधिकाग्र", "च्छेदगुणं", "कुट्टक"],
        "method_name": "Kuttaka (The Pulverizer) Method",
        "usage": "Used extensively in Indian astronomy to calculate planetary conjunctions and cyclical time periods.",
        "solves": "Solves linear Diophantine equations of the form ax + by = c for integer variables.",
        "significance": "Historically equivalent to the Extended Euclidean Algorithm, breaking down large remainders into successively smaller ones."
    },
    "chakravala_pell": {
        "keywords": ["chakravala", "pell", "square", "prakriti", "gunaka", "चक्रवाल", "प्रकृति", "वर्ग"],
        "method_name": "Bhaskara II's Chakravala Method",
        "usage": "Used in ancient Indian algebra to solve indeterminate quadratic equations (Pell's equations) of the form Ax² + 1 = y².",
        "solves": "Finds integer solutions for cyclic quadratic systems iteratively.",
        "significance": "A recursive cyclic algorithm centuries ahead of its European counterparts, praised by modern historians for its efficiency."
    }
}

def decode_sutra(sutra_text: str) -> dict:
    text_lower = sutra_text.lower()
    
    for method_id, data in SUTRA_KNOWLEDGE_BASE.items():
        if any(keyword in text_lower for keyword in data["keywords"]):
            return {
                "status": "success",
                "method_id": method_id,
                "metadata": {
                    "name": data["method_name"],
                    "usage": data["usage"],
                    "solves": data["solves"],
                    "significance": data["significance"]
                }
            }
            
    return {
        "status": "error",
        "message": "Sutra not recognized. Please ensure the text contains identifiable terms."
    }