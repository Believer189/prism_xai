// frontend/src/components/SutraInput.jsx
import React, { useState } from 'react';
import { BookOpen, Search, AlertCircle, ChevronDown } from 'lucide-react';

const PRESET_SUTRAS = [
    {
        id: "default",
        label: "Select a predefined Sanskrit sutra (Optional)",
        text: "",
        method_id: null
    },
    {
        id: "baudhayana",
        label: "Baudhayana Square Root (Sulba Sutras)",
        text: "समस्य द्विकरणी। प्रमाणं तृतीयेन वर्धयेत्तच्चतुर्थेनात्मचतुस्त्रिंशोनेन सविशेषः。",
        method_id: "baudhayana_sqrt"
    },
    {
        id: "aryabhata",
        label: "Aryabhata's Pi (Aryabhatiya)",
        text: "चतुरधिकं शतमष्टगुणं द्वाषष्टिस्तथा सहस्राणाम्। अयुतद्वयविष्कम्भस्यासन्नो वृत्तपरिणाहः॥",
        method_id: "aryabhata_pi"
    },
    {
        id: "kuttaka",
        label: "Kuttaka Method (Diophantine Equations)",
        text: "अधिकाग्रच्छेदगुणं विद्यादुनाग्रच्छेदभाजिते। शेषपरस्परभक्तं मतिगुणमग्रान्तरे क्षिप्तम्॥",
        method_id: "kuttaka_diophantine"
    },
    {
        id: "chakravala",
        label: "Chakravala Method (Bhaskara II, Bijaganita)",
        text: "प्रकृतेर्गुणको वर्गः क्षेपसंशुद्धिसंयुतः। पदयोः कल्पितं तत्र गुणकं ताडयेत्पदाभ्याम्॥",
        method_id: "chakravala_pell"
    }
];

const SUTRA_METADATA = {
    "baudhayana_sqrt": {
        "name": "Baudhayana / Bakhshali Square Root Approximation",
        "meaning": "The measure of a square's diagonal [its root]. Increase the [base] by its third part, add that third part's fourth part, and subtract from it the thirty-fourth part of that fourth. This is the special approximate value.",
        "formula": "xₙ₊₁ = xₙ - [ (xₙ² - N) / (2 * xₙ) ]",
        "word_meanings": [
            { sanskrit: "समस्य (samasya)", meaning: "Of a geometric square" },
            { sanskrit: "द्विकरणी (dvikaraṇī)", meaning: "Diagonal / Square root" },
            { sanskrit: "प्रमाणं (pramāṇaṃ)", meaning: "The base / measure" },
            { sanskrit: "तृतीयेन (tṛtīyena)", meaning: "By its third part" },
            { sanskrit: "वर्धयेत् (vardhayet)", meaning: "Should increase" },
            { sanskrit: "चतुर्थेन (caturthena)", meaning: "By its fourth part" },
            { sanskrit: "चतुस्त्रिंशोनेन (catustriṃśonena)", meaning: "Minus its 34th part" },
            { sanskrit: "सविशेषः (saviśeṣaḥ)", meaning: "The special approximate value" }
        ],
        "usage": "Used historically in Sulba Sutras for constructing complex fire altars requiring precise diagonal measurements.",
        "solves": "Calculates the square root of non-perfect squares iteratively.",
        "significance": "Provides a highly accurate rational approximation of surds using iterative geometric error correction."
    },
    "aryabhata_pi": {
        "name": "Aryabhata's Pi Approximation",
        "meaning": "Add 4 to 100, multiply by 8, and add 62,000. This is the approximate circumference of a circle whose diameter is 20,000.",
        "formula": "π ≈ [ 8 * (100 + 4) + 62000 ] / 20000 = 62832 / 20000 = 3.1416",
        "word_meanings": [
            { sanskrit: "चतुरधिकं (caturadhikaṃ)", meaning: "Exceeding by four (104)" },
            { sanskrit: "शतं (śataṃ)", meaning: "One hundred (100)" },
            { sanskrit: "अष्टगुणं (aṣṭaguṇaṃ)", meaning: "Multiplied by eight (8)" },
            { sanskrit: "द्वाषष्टिः (dvāṣaṣṭiḥ)", meaning: "Sixty-two (62)" },
            { sanskrit: "सहस्राणाम् (sahasrāṇām)", meaning: "Of thousands (62,000)" },
            { sanskrit: "अयुतद्वय (ayutadvaya)", meaning: "Two myriads / 20,000" },
            { sanskrit: "विष्कम्भस्य (viṣkambhasya)", meaning: "Of the diameter" },
            { sanskrit: "वृत्तपरिणाहः (vṛttapariṇāhaḥ)", meaning: "Circumference of a circle" }
        ],
        "usage": "Used in astronomy for calculating planetary orbits and the circumference of celestial spheres.",
        "solves": "Approximates the ratio of a circle's circumference to its diameter (π).",
        "significance": "Gives a highly accurate four-decimal-place value of π (3.1416)."
    },
    "kuttaka_diophantine": {
        "name": "Kuttaka (The Pulverizer) Method",
        "meaning": "Divide the larger number by the smaller remainder successively until the remainder becomes zero. Work backwards through the quotients to find the multipliers.",
        "formula": "a * x + b * y = c",
        "word_meanings": [
            { sanskrit: "अधिकाग्र (adhikāgra)", meaning: "Of the greater remainder" },
            { sanskrit: "च्छेदगुणं (cchedaguṇaṃ)", meaning: "Multiplied by divisor" },
            { sanskrit: "विद्यात् (vidyāt)", meaning: "One should know" },
            { sanskrit: "भाजिते (bhājite)", meaning: "When divided" },
            { sanskrit: "शेषपरस्पर (śeṣaparaspara)", meaning: "Mutual remainders" },
            { sanskrit: "मतिगुणम् (matiguṇam)", meaning: "Multiplier by intelligence" },
            { sanskrit: "अग्रान्तरे (agrāntare)", meaning: "In remainder difference" },
            { sanskrit: "क्षिप्तम् (kṣiptam)", meaning: "Added / adjusted" }
        ],
        "usage": "Used extensively in Indian astronomy to calculate planetary conjunctions.",
        "solves": "Solves linear Diophantine equations of the form ax + by = c for integer variables.",
        "significance": "Historically equivalent to the Extended Euclidean Algorithm."
    },
    "chakravala_pell": {
        "name": "Bhaskara II's Chakravala Method",
        "meaning": "The square of the multiplier of the Prakriti, combined with the interpolator... [Cyclic method generating infinite integer solutions from initial bases].",
        "formula": "A * x² + 1 = y²",
        "word_meanings": [
            { sanskrit: "प्रकृतेः (prakṛteḥ)", meaning: "Of the coefficient (Prakriti)" },
            { sanskrit: "गुणकः (guṇakaḥ)", meaning: "Multiplier" },
            { sanskrit: "वर्गः (vargaḥ)", meaning: "Square" },
            { sanskrit: "क्षेपसंशुद्धि (kṣepasaṃśuddhi)", meaning: "Interpolator purification" },
            { sanskrit: "पदयोः (padayoḥ)", meaning: "Of the roots/legs" },
            { sanskrit: "कल्पितं (kalpitaṃ)", meaning: "Assumed / supposed" },
            { sanskrit: "ताडयेत् (tāḍayet)", meaning: "Should multiply" },
            { sanskrit: "पदाभ्याम् (padābhyām)", meaning: "By the roots" }
        ],
        "usage": "Used in ancient Indian algebra to solve indeterminate quadratic equations (Pell's equations).",
        "solves": "Finds integer solutions for cyclic quadratic systems iteratively.",
        "significance": "A recursive cyclic algorithm centuries ahead of its European counterparts."
    }
};

const SutraInput = ({ onDecodeSuccess }) => {
    const [inputText, setInputText] = useState("");
    const [selectedMethodId, setSelectedMethodId] = useState(null);
    const [error, setError] = useState(null);

    const handleSelectChange = (e) => {
        const selectedId = e.target.value;
        const selectedSutra = PRESET_SUTRAS.find(sutra => sutra.id === selectedId);
        if (selectedSutra) {
            setInputText(selectedSutra.text);
            setSelectedMethodId(selectedSutra.method_id);
            setError(null);
        }
    };

    const handleDecode = () => {
        if (!inputText.trim()) {
            setError("Please select or enter a valid sutra text.");
            return;
        }
        
        if (!selectedMethodId) {
            setError("Could not map this text to a known method. Please select from the dropdown.");
            return;
        }

        setError(null);
        onDecodeSuccess({
            method_id: selectedMethodId,
            metadata: SUTRA_METADATA[selectedMethodId]
        });
    };

    return (
        <div className="w-full max-w-4xl mx-auto bg-slate-50 rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-800 px-6 py-4 border-b border-slate-700 flex items-center gap-3">
                <BookOpen className="text-emerald-400 w-5 h-5" />
                <h2 className="text-lg font-semibold text-white tracking-wide">
                    Sutra Translation & Identification Engine
                </h2>
            </div>
            
            <div className="p-6">
                <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                    Select a classical verse from the dropdown to automatically load and configure its computational engine.
                </p>

                <div className="mb-4 relative">
                    <select 
                        onChange={handleSelectChange}
                        className="w-full p-3 pr-10 bg-white border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-emerald-500 outline-none appearance-none text-slate-700 font-medium cursor-pointer"
                    >
                        {PRESET_SUTRAS.map((sutra) => (
                            <option key={sutra.id} value={sutra.id}>
                                {sutra.label}
                            </option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                </div>
                
                <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Select from dropdown above..."
                    className="w-full h-24 p-4 bg-white border border-slate-300 rounded-lg shadow-inner focus:ring-2 focus:ring-emerald-500 outline-none resize-none text-slate-800 font-serif text-lg leading-relaxed"
                />
                
                {error && (
                    <div className="mt-4 p-3 bg-red-50 border-l-4 border-red-500 flex items-start gap-2 text-red-700 text-sm">
                        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <p>{error}</p>
                    </div>
                )}
                
                <div className="mt-5 flex justify-end">
                    <button
                        onClick={handleDecode}
                        className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-6 py-2.5 rounded-md font-medium transition-colors shadow-sm cursor-pointer"
                    >
                        <Search className="w-4 h-4" />
                        Decode Sutra
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SutraInput;