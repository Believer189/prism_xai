# File Location: backend/main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from decimal import Decimal, ROUND_HALF_UP
import math

DECIMAL_PLACES = 6
QUADRANT_LIMIT_DEG = 90.0
SINE_RADIUS_ARCMIN = 3438.0

app = FastAPI(title="PRISM Engine API", version="15.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ComputeRequest(BaseModel):
    method_id: str
    input_value: float = 0.0

SUTRAS_DB = {
    "aryabhata_sqrt": {
        "name": "1. Āryabhaṭa's Square Root Algorithm (Vargamūla)",
        "type": "Dynamic",
        "one_liner": "Computes the exact or multi-decimal square root (√N) of any positive number using alternating odd (varga) and even (avarga) place-value digit extraction.",
        "default_input": "55225",
        "author": "Āryabhaṭīya (499 CE), Gaṇitapāda, Verse 4",
        "source_citation": "Primary Book Source: 'Āryabhaṭīya of Āryabhaṭa', Edited & Translated by K. S. Shukla and K. V. Sarma (Indian National Science Academy, New Delhi, 1976), Gaṇitapāda, Verse 4.",
        "modern_citation": "Modern Benchmark Source: 'Introductory Methods of Numerical Analysis' by S. S. Sastry (5th Ed., PHI Learning) & IEEE 754-2019 Floating-Point Standard (Newton-Raphson Quadratic Convergence).",
        "sanskrit": "भागं हरेदवर्गान्नित्यं द्विगुणेन वर्गमूलेन ।\nवर्गाद्वर्गे शुद्धे लब्धं स्थानान्तरे मूलम् ॥ ४ ॥",
        "transliteration": "bhāgaṃ haredavargānnityaṃ dviguṇena vargamūlena |\nvargādvarge śuddhe labdhaṃ sthānāntare mūlam || 4 ||",
        "summary": "(Having subtracted the greatest possible square from the last odd place and then having written down the square root of the number subtracted in the line of the square root) always divide the even place (standing on the right) by twice the square root. Then, having subtracted the square (of the quotient) from the odd place (standing on the right), set down the quotient at the next place (i.e., on the right of the number already written in the line of the square root). This is the square root. (Repeat the process if there are still digits on the right).",
        "meaning": "• bhāgam haret avargāt nityam: Always divide the even (non-square / avarga) place standing on the right.\n• dviguṇena vargamūlena: By twice the square root obtained so far.\n• vargāt varge śuddhe: Having subtracted the square (of the quotient) from the odd (square / varga) place standing on the right.\n• labdham sthānāntare mūlam: The quotient set down at the next place in the line of the square root gives the root.\n• Footnote 1 (Shukla & Sarma, Gaṇitapāda 4): In dividing, the quotient should be taken as great as will allow the subtraction of its square from the next odd place.",
        "input_guideline": "Dynamic Sutra: Enter any positive number N (e.g., textbook example 55225 for exact root 235, or any non-square like 10 or 125 for decimal pair continuation).",
        "formula": "Place Marking: ... o e o e o  |  Step A (Even 'e'): Divide by 2×Root  |  Step B (Odd 'o'): Subtract Quotient²"
    },
    "aryabhata_cuberoot": {
        "name": "2. Āryabhaṭa's Cube Root Algorithm (Ghanamūla)",
        "type": "Dynamic",
        "one_liner": "Computes the exact or multi-decimal cube root (∛N) of any positive number by partitioning digits into triplets (c, n', n) and inverting the binomial cube expansion.",
        "default_input": "1771561",
        "author": "Āryabhaṭīya (499 CE), Gaṇitapāda, Verse 5",
        "source_citation": "Primary Book Source: 'Āryabhaṭīya of Āryabhaṭa', Edited & Translated by K. S. Shukla and K. V. Sarma (Indian National Science Academy, New Delhi, 1976), Gaṇitapāda, Verse 5.",
        "modern_citation": "Modern Benchmark Source: 'Introductory Methods of Numerical Analysis' by S. S. Sastry (5th Ed., PHI Learning) & IEEE 754-2019 Floating-Point Standard (Newton-Raphson Cubic Convergence).",
        "sanskrit": "अघनाद्भजेद् द्वितीयात् त्रिगुणेन घनस्य मूलवर्गेण ।\nवर्गस्त्रिपूर्वगुणितः शोध्यः प्रथमाद् घनश्च घनात् ॥ ५ ॥",
        "transliteration": "aghanādbhaje dvitīyāt triguṇena ghanasya mūlavargeṇa |\nvargastripūrvaguṇitaḥ śodhyaḥ prathamād ghanaśca ghanāt || 5 ||",
        "summary": "(Having subtracted the greatest possible cube from the last cube place and then having written down the cube root of the number subtracted in the line of the cube root), divide the second non-cube place (standing on the right of the last cube place) by thrice the square of the cube root (already obtained); (then) subtract from the first non-cube place (standing on the right of the second non-cube place) the square of the quotient multiplied by thrice the previous (cube root); and (then subtract) the cube (of the quotient) from the cube place (standing on the right of the first non-cube place) (and write down the quotient on the right of the previous cube root in the line of the cube root, and treat this as the new cube root. Repeat the process if there are still digits on the right).",
        "meaning": "• aghanāt bhajet dvitīyāt: Divide the second non-cube place (n') standing on the right of the cube place.\n• triguṇena ghanasya mūlavargeṇa: By thrice the square of the cube root obtained so far (3a²).\n• vargaḥ tripūrvaguṇitaḥ śodhyaḥ prathamāt: Subtract the square of the quotient multiplied by thrice the previous root (3ab²) from the first non-cube place (n).\n• ghanaśca ghanāt: And subtract the cube of the quotient (b³) from the cube place (c).",
        "input_guideline": "Dynamic Sutra: Enter any positive number N (e.g., textbook example 1771561 for exact root 121, or any number like 10 or 500 for multi-step decimal triplet extraction).",
        "formula": "Triplet Marking: ... c n' n c  |  Step A (n'): Divide by 3a²  |  Step B (n): Subtract 3ab²  |  Step C (c): Subtract b³"
    },
    "aryabhata_sinetable": {
        "name": "3. Āryabhaṭa's Sine-Table Method (Jyā)",
        "type": "Dynamic",
        "one_liner": "Generates trigonometric half-chord sines (Rsin θ and sin θ) for any quadrant angle θ ∈ (0°, 90°] using Āryabhaṭa's second-order finite-difference recurrence relation.",
        "default_input": "45",
        "author": "Āryabhaṭīya (499 CE), Gaṇitapāda V. 12 & Gītikāpāda V. 12",
        "source_citation": "Primary Book Source: 'Āryabhaṭīya of Āryabhaṭa', Edited & Translated by K. S. Shukla and K. V. Sarma (Indian National Science Academy, New Delhi, 1976), Gaṇitapāda Verse 12 & Gītikāpāda Verse 12.",
        "modern_citation": "Modern Benchmark Source: 'Introductory Methods of Numerical Analysis' by S. S. Sastry & IEEE 754-2019 Floating-Point Standard (Maclaurin Power Series Expansion & CORDIC).",
        "sanskrit": "प्रथमाच्चापज्यार्धाद्यैरूनं खण्डितं द्वितीयार्धम् ।\nतत्प्रथमज्यार्धांशैस्तैस्तैरूनानि शेषाणि ॥ १२ ॥\n(गीतिकापाद १२: मखि भखि फखि धखि णखि ञखि ङखि हस्झ स्ककि किष्ग श्घकि किघ्व ।\nघ्लकि किग्र हक्य धकि किच स्ग झश ङ्व क्ल प्त फ छ कलार्धज्याः ॥)",
        "transliteration": "prathamāccāpajyārdhādyairūnaṃ khaṇḍitaṃ dvitīyārdham |\ntatprathamajyārdhāṃśaistaistairūnāni śeṣāṇi || 12 ||\n(Gītikāpāda 12: makhi bhakhi phakhi dhakhi ṇakhi ñakhi ṅakhi hasjha skaki kiṣga śghaki kighva |\nghlaki kigra hakya dhaki kica sga jhaśa ṅva kla pta pha cha kalārdhajyāḥ ||)",
        "summary": "Gaṇitapāda V. 12: The first Rsine divided by itself and then diminished by the quotient gives the second Rsine-difference. The same first Rsine diminished by the quotients obtained by dividing each of the preceding Rsines by the first Rsine gives the remaining Rsine-differences.\nGītikāpāda V. 12: Lists the 24 Rsine-differences (ardhajyā-khaṇḍas) in arcminutes (kalā) at intervals of 3°45' (225') for radius R = 3438': 225, 224, 222, 219, 215, 210, 205, 199, 191, 183, 174, 164, 154, 143, 131, 119, 106, 93, 79, 65, 51, 37, 22, 7.",
        "meaning": "• prathamāt cāpajyārdhāt: From the first Rsine (R₁ = Rsin 3°45' = 225').\n• yaiḥ ūnam khaṇḍitam dvitīyārdham: Divided by itself (R₁/R₁ = 1) and diminished by that quotient gives the second Rsine-difference (δ₂ = 225 - 1 = 224').\n• tat-prathama-jyārdha-aṃśaiḥ: By the quotients obtained on dividing each of the preceding Rsines by the first Rsine (225').\n• taiḥ taiḥ ūnāni śeṣāṇi: Successively diminished by those quotients yields the remaining Rsine-differences: δ_{n+1} = R₁ - (R₁ + R₂ + ... + R_n)/R₁  <=>  δ_{n+1} = δ_n - R_n / R₁.",
        "input_guideline": "Dynamic Sutra: Enter an angle θ in degrees between 0° (exclusive) and 90° (inclusive), e.g., 15°, 30°, 45°, 60°, or 90°.",
        "formula": "R = 3438', h = 225' (3°45')  |  δ₂ = R₁ - R₁/R₁  |  δ_{n+1} = R₁ - (R₁ + ... + R_n)/R₁  |  sin(θ) = Rsin(θ) / 3438"
    },
    "aryabhata_pi": {
        "name": "4. Āryabhaṭa's Circumference-Diameter Ratio (π ≈ 3.1416)",
        "type": "Static",
        "one_liner": "Establishes the fixed rational approximation of Pi (π ≈ 62,832 / 20,000 = 3.1416) by prescribing the circumference of a circle with a diameter of 20,000 units.",
        "default_input": "0",
        "author": "Āryabhaṭīya (499 CE), Gaṇitapāda, Verse 10",
        "source_citation": "Primary Book Source: 'Āryabhaṭīya of Āryabhaṭa', Edited & Translated by K. S. Shukla and K. V. Sarma (Indian National Science Academy, New Delhi, 1976), Gaṇitapāda, Verse 10.",
        "modern_citation": "Modern Benchmark Source: Machin's arctangent series (S. S. Sastry) & IEEE 754-2019 64-bit constant π.",
        "sanskrit": "चतुरधिकं शतमष्टगुणं द्वाषष्टिस्तथा सहस्राणाम् ।\nअयुतद्वयविष्कम्भस्यासन्नो वृत्तपरिणाहः ॥ १० ॥",
        "transliteration": "caturadhikaṃ śatamaṣṭaguṇaṃ dvāṣaṣṭistathā sahasrāṇām |\nayutadvayaviṣkambhasyāsanno vṛttapariṇāhaḥ || 10 ||",
        "summary": "100 plus 4, multiplied by 8, and added to 62,000: this is the nearly approximate measure of the circumference of a circle whose diameter is 20,000.\nThis gives π = circumference / diameter = 62832 / 20000 = 3.1416. This value does not occur in any earlier work on mathematics, and forms an important contribution of Āryabhaṭa I. It is noteworthy that Āryabhaṭa I has called the above value approximate (āsanna).",
        "meaning": "• caturadhikaṃ śatam: 100 plus 4 (= 104).\n• aṣṭaguṇam: Multiplied by 8 (104 × 8 = 832).\n• dvāṣaṣṭiḥ tathā sahasrāṇām: And sixty-two thousand added to it (832 + 62,000 = 62,832).\n• ayuta-dvaya-viṣkambhasya: Of a circle whose diameter (viṣkambha) is two ayutas (2 × 10,000 = 20,000).\n• āsannaḥ vṛtta-pariṇāhaḥ: Is the nearly approximate (āsanna) measure of the circumference (vṛtta-pariṇāha) -> π ≈ 62,832 / 20,000 = 3.1416.",
        "input_guideline": "Static Sutra (Fixed Historical Constant): No user input is required. The verse directly encodes fixed canonical integers (Circumference = 62,832; Diameter = 20,000).",
        "formula": "C = [(100 + 4) × 8] + 62,000 = 62,832  |  D = 2 × 10,000 = 20,000  |  π ≈ C / D = 62,832 / 20,000 = 3.1416"
    },
    "bhaskara2_pi": {
        "name": "5. Bhāskara II's Circumference-Diameter Ratio (π ≈ 3927 / 1250 & 22 / 7)",
        "type": "Static",
        "one_liner": "Computes the near (sūkṣma) value of Pi (π ≈ 3927 / 1250 = 3.1416) verified by a computed 384-gon inscribed polygon and contrasts it with the gross (sthūla) practical ratio 22 / 7.",
        "default_input": "0",
        "author": "Līlāvatī of Bhāskarācārya (1150 CE), Kṣetravyavahāra, Rule 201",
        "source_citation": "Primary Book Source: 'Colebrooke's Translation of the Līlāvatī', Edited with Notes by Haran Chandra Banerji (2nd Ed., The Book Company, Calcutta, 1927), Rule 201.",
        "modern_citation": "Modern Benchmark Source: Machin's arctangent series (S. S. Sastry, Introductory Methods of Numerical Analysis) & IEEE 754-2019 64-bit constant π; 384-gon perimeter computed by chord-halving.",
        "sanskrit": "व्यासे भनन्दाग्निहते विभक्ते खबाणसूर्यैः परिधिः स सूक्ष्मः ।\nद्वाविंशतिघ्ने विहृतेऽथ शैलैः स्थूलोऽथवा स्याद्व्यवहारयोग्यः ॥ २०१ ॥",
        "transliteration": "vyāse bhanandāgnihate vibhakte khabāṇasūryaiḥ paridhiḥ sa sūkṣmaḥ |\ndvāviṃśatighne vihṛte'tha śailaiḥ sthūlo'thavā syādvyavahārayogyaḥ || 201 ||",
        "summary": "Rule 201 (Colebrooke / Banerji, Līlāvatī 201): When the diameter of a circle is multiplied by three thousand nine hundred and twenty-seven (3927) and divided by twelve hundred and fifty (1250), the quotient is the near (sūkṣma) circumference: or multiplied by twenty-two (22) and divided by seven (7), it is the gross (sthūla) circumference adapted to practice.",
        "meaning": "• vyāse bha-nanda-agni-hate: When the diameter (vyāsa) is multiplied by 3927 (Bhūta-saṅkhyā right-to-left: bha [nakṣatras] = 27, nanda = 9, agni [fires] = 3 -> 3927).\n• vibhakte kha-bāṇa-sūryaiḥ: And divided by 1250 (kha [sky/zero] = 0, bāṇa [arrows] = 5, sūrya [suns] = 12 -> 1250).\n• paridhiḥ sa sūkṣmaḥ: That quotient is the near / accurate (sūkṣma) circumference (π ≈ 3927 / 1250 = 3.1416).\n• dvāviṃśatighne vihṛte'tha śailaiḥ: Or multiplied by 22 (dvāviṃśati) and divided by 7 (śaila [mountains] = 7).\n• sthūlo'thavā syād vyavahārayogyaḥ: Gives the gross (sthūla) circumference adapted to everyday practical use (π ≈ 22 / 7 ≈ 3.142857).",
        "input_guideline": "Static Sutra (Fixed Historical Constant): No user input is required. Rule 201 directly specifies the reduced canonical ratio 3927 / 1250 = 3.1416 and an inscribed 384-gon verification computed by chord-halving for D = 1250.",
        "formula": "Sūkṣma: π ≈ 3927 / 1250 = 3.1416  |  384-gon check: P₃₈₄ / D = 3926.947 / 1250 ≈ 3.141558  |  Sthūla: π ≈ 22 / 7 ≈ 3.142857"
    }
}


def matching_decimals(a, m, cap=12):
    k = 0
    for d in range(0, cap + 1):
        if round(a, d) == round(m, d):
            k = d
        else:
            break
    return k


def execute_aryabhata_vargamula(N: float):
    per = 2
    scale = 10 ** (per * DECIMAL_PLACES)
    dec_N = Decimal(str(N))
    scaled = int((dec_N * scale).to_integral_value(rounding=ROUND_HALF_UP))
    int_part = scaled // scale
    frac_digits = str(scaled % scale).zfill(per * DECIMAL_PLACES)

    str_int = str(int_part)
    n_digits = len(str_int)

    labels = []
    for i in range(n_digits):
        dist_from_right = n_digits - 1 - i
        labels.append('o' if dist_from_right % 2 == 0 else 'e')

    label_display = " ".join(labels)
    digit_display = " ".join(list(str_int))

    steps = [{
        "step": 1,
        "theory": "Denote the odd (varga) and even (avarga) places by 'o' and 'e' respectively, counting from right to left (Shukla & Sarma, Gaṇitapāda 4).",
        "math": f"Places: [ {label_display} ]  over  Digits: [ {digit_display} ]"
    }]

    idx = 1 if labels[0] == 'o' else 2
    first_odd_val = int(str_int[0:idx])
    first_root = int(math.isqrt(first_odd_val))
    sq_sub = first_root * first_root
    rem = first_odd_val - sq_sub
    running_root = first_root

    steps.append({
        "step": 2,
        "theory": f"Subtract the greatest possible square ({first_root}² = {sq_sub}) from the leftmost odd place ({first_odd_val}), and write {first_root} in the line of the square root.",
        "math": f"{first_odd_val} - {sq_sub} = {rem} (Remainder)  |  Line of Square Root = {running_root}"
    })

    total_pairs_left = (n_digits - idx) // 2
    ancient_iter_history = [float(running_root * (10 ** total_pairs_left))]
    contributions = [{"label": f"Initial Odd Place Root ({first_root}×10^{total_pairs_left})", "value": float(running_root * (10 ** total_pairs_left))}]

    step_num = 3
    pair_counter = 1
    while idx < n_digits:
        even_digit = int(str_int[idx])
        odd_digit = int(str_int[idx + 1])
        idx += 2
        pairs_remaining = (n_digits - idx) // 2

        dividend_even = rem * 10 + even_digit
        divisor = 2 * running_root
        q = 0
        for candidate_q in range(9, -1, -1):
            after_div_rem = dividend_even - (divisor * candidate_q)
            if after_div_rem >= 0 and (after_div_rem * 10 + odd_digit) >= (candidate_q * candidate_q):
                q = candidate_q
                break

        prod_div = divisor * q
        rem_after_even = dividend_even - prod_div
        next_odd_num = rem_after_even * 10 + odd_digit
        q_sq = q * q
        rem = next_odd_num - q_sq
        running_root = running_root * 10 + q

        steps.append({
            "step": step_num,
            "theory": f"Bring down the next even ('e') place digit ({even_digit}) to form {dividend_even}. Divide by twice the current root (2 × {running_root // 10} = {divisor}) to get quotient {q}.",
            "math": f"{divisor} ) {dividend_even} ( {q}   =>   {dividend_even} - {prod_div} = {rem_after_even}"
        })
        step_num += 1

        steps.append({
            "step": step_num,
            "theory": f"Bring down the next odd ('o') place digit ({odd_digit}) to form {next_odd_num}. Subtract the square of the quotient ({q}² = {q_sq}) and set down {q} in the line of the square root.",
            "math": f"{next_odd_num} - {q_sq} = {rem} (Remainder)  |  Line of Square Root = {running_root}"
        })
        step_num += 1

        ancient_iter_history.append(float(running_root * (10 ** pairs_remaining)))
        contributions.append({"label": f"Integer Pair {pair_counter} Digit ({q}×10^{pairs_remaining})", "value": float(q * (10 ** pairs_remaining))})
        pair_counter += 1

    if rem == 0 and all(ch == '0' for ch in frac_digits) and (dec_N * scale == scaled):
        is_exact = True
        steps.append({
            "step": step_num,
            "theory": "The process ends. The remainder being zero, the square root is exact (Shukla & Sarma, Gaṇitapāda 4).",
            "math": f"Final Exact Square Root = {running_root}"
        })
        final_ancient_val = float(running_root)
    else:
        dec_places = 0
        for f_idx in range(0, per * DECIMAL_PLACES, 2):
            even_d = int(frac_digits[f_idx])
            odd_d = int(frac_digits[f_idx + 1])
            dec_places += 1

            dividend_even = rem * 10 + even_d
            divisor = 2 * running_root
            q = 0
            for candidate_q in range(9, -1, -1):
                after_div_rem = dividend_even - (divisor * candidate_q)
                if after_div_rem >= 0 and (after_div_rem * 10 + odd_d) >= (candidate_q * candidate_q):
                    q = candidate_q
                    break

            prod_div = divisor * q
            rem_after_even = dividend_even - prod_div
            next_odd_num = rem_after_even * 10 + odd_d
            q_sq = q * q
            rem = next_odd_num - q_sq
            running_root = running_root * 10 + q
            current_dec_val = running_root / (10 ** dec_places)
            ancient_iter_history.append(current_dec_val)
            contributions.append({"label": f"Decimal Place -{dec_places} Digit ({q}×10^-{dec_places})", "value": float(q / (10 ** dec_places))})

            steps.append({
                "step": step_num,
                "theory": f"Decimal Pair {dec_places} — Even ('e') Step: Append even digit ({even_d}) to remainder to form {dividend_even}. Divide by twice running root (2 × {divisor // 2} = {divisor}) yielding quotient q = {q}.",
                "math": f"{divisor} ) {dividend_even} ( {q}   =>   {dividend_even} - {prod_div} = {rem_after_even}"
            })
            step_num += 1

            steps.append({
                "step": step_num,
                "theory": f"Decimal Pair {dec_places} — Odd ('o') Step: Append odd digit ({odd_d}) to form {next_odd_num}. Subtract q² ({q}² = {q_sq}) leaving remainder {rem}. Running root = {current_dec_val}.",
                "math": f"{next_odd_num} - {q_sq} = {rem} (Remainder)  |  Line of Square Root = {current_dec_val}"
            })
            step_num += 1

        is_exact = (rem == 0 and dec_N * scale == scaled)
        final_ancient_val = running_root / (10 ** DECIMAL_PLACES)
        if is_exact:
            steps.append({
                "step": step_num,
                "theory": "The process ends. The remainder being zero, the square root is exact (Shukla & Sarma, Gaṇitapāda 4).",
                "math": f"Final Exact Square Root = {final_ancient_val}"
            })

    return final_ancient_val, steps, ancient_iter_history, is_exact, rem, contributions


def execute_aryabhata_ghanamula(N: float):
    per = 3
    scale = 10 ** (per * DECIMAL_PLACES)
    dec_N = Decimal(str(N))
    scaled = int((dec_N * scale).to_integral_value(rounding=ROUND_HALF_UP))
    int_part = scaled // scale
    frac_digits = str(scaled % scale).zfill(per * DECIMAL_PLACES)

    str_int = str(int_part)
    n_digits = len(str_int)

    labels = []
    for i in range(n_digits):
        dist_from_right = n_digits - 1 - i
        mod = dist_from_right % 3
        if mod == 0:
            labels.append('c')
        elif mod == 2:
            labels.append("n'")
        else:
            labels.append('n')

    label_display = " ".join(labels)
    digit_display = " ".join(list(str_int))

    steps = [{
        "step": 1,
        "theory": "Denote the cube places by 'c', the first non-cube places by 'n', and the second non-cube places by 'n'', counting from right to left in triplets (Shukla & Sarma, Gaṇitapāda 5).",
        "math": f"Places: [ {label_display} ]  over  Digits: [ {digit_display} ]"
    }]

    first_c_idx = labels.index('c')
    idx = first_c_idx + 1
    first_group_val = int(str_int[0:idx])

    first_root = 0
    for r in range(9, -1, -1):
        if (r ** 3) <= first_group_val:
            first_root = r
            break

    cube_sub = first_root ** 3
    rem = first_group_val - cube_sub
    running_root = first_root

    steps.append({
        "step": 2,
        "theory": f"Subtract the greatest possible cube ({first_root}³ = {cube_sub}) from the last (leftmost) cube group ({first_group_val}), and write {first_root} in the line of the cube root.",
        "math": f"{first_group_val} - {cube_sub} = {rem} (Remainder)  |  Line of Cube Root = {running_root}"
    })

    triplets_left = (n_digits - idx) // 3
    ancient_iter_history = [float(running_root * (10 ** triplets_left))]
    contributions = [{"label": f"Initial Cube Group Root ({first_root}×10^{triplets_left})", "value": float(running_root * (10 ** triplets_left))}]

    step_num = 3
    triplet_counter = 1
    while idx < n_digits:
        n_prime_digit = int(str_int[idx])
        n_digit = int(str_int[idx + 1])
        c_digit = int(str_int[idx + 2])
        idx += 3
        triplets_left = (n_digits - idx) // 3

        dividend_np = rem * 10 + n_prime_digit
        divisor = 3 * (running_root ** 2)

        q = 0
        for candidate_q in range(9, -1, -1):
            rem1 = dividend_np - (divisor * candidate_q)
            if rem1 >= 0:
                rem2 = (rem1 * 10 + n_digit) - (3 * running_root * (candidate_q ** 2))
                if rem2 >= 0:
                    rem3 = (rem2 * 10 + c_digit) - (candidate_q ** 3)
                    if rem3 >= 0:
                        q = candidate_q
                        break

        prod_np = divisor * q
        rem_np = dividend_np - prod_np

        steps.append({
            "step": step_num,
            "theory": f"Bring down the second non-cube place ('n'') digit ({n_prime_digit}) to form {dividend_np}. Divide by thrice the square of the current cube root (3 × {running_root}² = {divisor}) to get quotient {q}.",
            "math": f"{divisor} ) {dividend_np} ( {q}   =>   {dividend_np} - {prod_np} = {rem_np}"
        })
        step_num += 1

        dividend_n = rem_np * 10 + n_digit
        sub_3ab2 = 3 * running_root * (q ** 2)
        rem_n = dividend_n - sub_3ab2

        steps.append({
            "step": step_num,
            "theory": f"Bring down the first non-cube place ('n') digit ({n_digit}) to form {dividend_n}. Subtract the square of the quotient multiplied by thrice the previous root (3 × {running_root} × {q}² = {sub_3ab2}).",
            "math": f"{dividend_n} - {sub_3ab2} = {rem_n}"
        })
        step_num += 1

        dividend_c = rem_n * 10 + c_digit
        cube_q = q ** 3
        rem = dividend_c - cube_q
        running_root = running_root * 10 + q

        steps.append({
            "step": step_num,
            "theory": f"Bring down the cube place ('c') digit ({c_digit}) to form {dividend_c}. Subtract the cube of the quotient ({q}³ = {cube_q}) and set down {q} in the line of the cube root.",
            "math": f"{dividend_c} - {cube_q} = {rem} (Remainder)  |  Line of Cube Root = {running_root}"
        })
        step_num += 1

        ancient_iter_history.append(float(running_root * (10 ** triplets_left)))
        contributions.append({"label": f"Integer Triplet {triplet_counter} Digit ({q}×10^{triplets_left})", "value": float(q * (10 ** triplets_left))})
        triplet_counter += 1

    if rem == 0 and all(ch == '0' for ch in frac_digits) and (dec_N * scale == scaled):
        is_exact = True
        steps.append({
            "step": step_num,
            "theory": "The process ends. The remainder being zero, the required cube root is exact (Shukla & Sarma, Gaṇitapāda 5).",
            "math": f"Final Exact Cube Root = {running_root}"
        })
        final_ancient_val = float(running_root)
    else:
        dec_places = 0
        for f_idx in range(0, per * DECIMAL_PLACES, 3):
            np_d = int(frac_digits[f_idx])
            n_d = int(frac_digits[f_idx + 1])
            c_d = int(frac_digits[f_idx + 2])
            dec_places += 1

            dividend_np = rem * 10 + np_d
            divisor = 3 * (running_root ** 2)

            q = 0
            for candidate_q in range(9, -1, -1):
                rem1 = dividend_np - (divisor * candidate_q)
                if rem1 >= 0:
                    rem2 = (rem1 * 10 + n_d) - (3 * running_root * (candidate_q ** 2))
                    if rem2 >= 0:
                        rem3 = (rem2 * 10 + c_d) - (candidate_q ** 3)
                        if rem3 >= 0:
                            q = candidate_q
                            break

            prod_np = divisor * q
            rem_np = dividend_np - prod_np
            dividend_n = rem_np * 10 + n_d
            sub_3ab2 = 3 * running_root * (q ** 2)
            rem_n = dividend_n - sub_3ab2
            dividend_c = rem_n * 10 + c_d
            cube_q = q ** 3
            rem = dividend_c - cube_q
            prev_root = running_root
            running_root = running_root * 10 + q
            current_dec_val = running_root / (10 ** dec_places)

            steps.append({
                "step": step_num,
                "theory": f"Decimal Triplet {dec_places} — Step A (Place n'={np_d}): Bring down {np_d} to form {dividend_np}. Divide by 3a² (3 × {prev_root}² = {divisor}) yielding quotient q = {q}.",
                "math": f"{divisor} ) {dividend_np} ( {q}   =>   {dividend_np} - {prod_np} = {rem_np}"
            })
            step_num += 1

            steps.append({
                "step": step_num,
                "theory": f"Decimal Triplet {dec_places} — Step B (Place n={n_d}): Bring down {n_d} to form {dividend_n}. Subtract 3ab² (3 × {prev_root} × {q}² = {sub_3ab2}).",
                "math": f"{dividend_n} - {sub_3ab2} = {rem_n}"
            })
            step_num += 1

            steps.append({
                "step": step_num,
                "theory": f"Decimal Triplet {dec_places} — Step C (Place c={c_d}): Bring down {c_d} to form {dividend_c}. Subtract q³ ({q}³ = {cube_q}) leaving remainder {rem}. Running cube root = {current_dec_val}.",
                "math": f"{dividend_c} - {cube_q} = {rem} (Remainder)  |  Line of Cube Root = {current_dec_val}"
            })
            step_num += 1

            ancient_iter_history.append(current_dec_val)
            contributions.append({"label": f"Decimal Place -{dec_places} Digit ({q}×10^-{dec_places})", "value": float(q / (10 ** dec_places))})

        is_exact = (rem == 0 and dec_N * scale == scaled)
        final_ancient_val = running_root / (10 ** DECIMAL_PLACES)
        if is_exact:
            steps.append({
                "step": step_num,
                "theory": "The process ends. The remainder being zero, the required cube root is exact (Shukla & Sarma, Gaṇitapāda 5).",
                "math": f"Final Exact Cube Root = {final_ancient_val}"
            })

    return final_ancient_val, steps, ancient_iter_history, is_exact, rem, contributions


GITIKAPADA_24_DIFFS = [
    225, 224, 222, 219, 215, 210, 205, 199,
    191, 183, 174, 164, 154, 143, 131, 119,
    106,  93,  79,  65,  51,  37,  22,   7
]

def execute_aryabhata_jya(N: float):
    if N <= 0 or N > QUADRANT_LIMIT_DEG:
        raise HTTPException(status_code=400, detail="Validation error: Angle θ must be between 0° (exclusive) and 90° (inclusive) for Āryabhaṭa's quadrant Sine-Table (Jyā).")

    R = SINE_RADIUS_ARCMIN
    h_deg = 3.75
    table = GITIKAPADA_24_DIFFS
    angle_deg = float(N)
    angle_min = angle_deg * 60.0

    T = [0.0]
    for d in table:
        T.append(T[-1] + float(d))

    exact_idx = angle_deg / h_deg
    if abs(exact_idx - round(exact_idx)) < 1e-9:
        base_idx = int(round(exact_idx))
        frac = 0.0
        is_exact_node = True
    else:
        base_idx = int(math.floor(exact_idx))
        frac = exact_idx - base_idx
        is_exact_node = False

    full = base_idx

    steps = [{
        "step": 1,
        "theory": "Initialize Āryabhaṭa's trigonometric quadrant parameters (Gītikāpāda 12): Quadrant = 90° = 5400' divided into 24 equal arc-intervals of h = 3°45' = 225', with circle radius R = 3438' and first Rsine R₁ = δ₁ = 225'.",
        "math": f"Target Angle θ = {angle_deg}° ({angle_min}'),  Interval Step h = 3.75° (225'),  Radius R = 3438',  R₁ = δ₁ = 225'"
    }]

    d1 = 225.0
    q1 = d1 / d1
    d2_rule = d1 - q1
    steps.append({
        "step": 2,
        "theory": "Apply first half-verse of Gaṇitapāda 12 ('prathamāccāpajyārdhādyairūnaṃ khaṇḍitaṃ dvitīyārdham'): The first Rsine (R₁ = 225') divided by itself (225/225 = 1) and diminished by that quotient gives the second Rsine-difference δ₂.",
        "math": f"δ₂ = R₁ - (R₁ / R₁) = 225 - (225 / 225) = 225 - 1 = {int(d2_rule)}'  (Matches Gītikāpāda 12 'bhakhi' = 224')"
    })

    step_num = 3
    rec_diffs = []
    rec_rsines = []
    contributions = []
    devs = []

    for k in range(1, full + 1):
        if k == 1:
            dk = 225.0
            rsk = 225.0
        else:
            prev_rs = rec_rsines[-1]
            prev_d = rec_diffs[-1]
            dk = prev_d - (prev_rs / 225.0)
            rsk = prev_rs + dk
        rec_diffs.append(dk)
        rec_rsines.append(rsk)

        A = float(table[k - 1])
        B = T[k]
        Z = rsk - B
        devs.append(abs(Z))

        curr_angle = k * h_deg
        steps.append({
            "step": step_num,
            "theory": f"Interval {k} (θ = {curr_angle}°): recurrence gives δ_{k} = {dk:.2f}' and R = {rsk:.2f}'; tabulated (Gītikāpāda) δ_{k} = {A:.2f}' and R = {B:.2f}'; deviation (recurrence − table) = {Z:+.2f}'.",
            "math": f"Recurrence: δ_{k} = {dk:.2f}', R_{k} = {rsk:.2f}'  |  Table: δ_{k} = {int(A)}', T_{k} = {int(B)}'  |  Δ = {Z:+.2f}'"
        })
        step_num += 1
        contributions.append({
            "label": f"Interval {k} ({curr_angle}°): δ_{k} = {int(A)}'",
            "value": A / R
        })

    if not is_exact_node:
        base_val = T[base_idx]
        d_next = float(table[base_idx])
        added = frac * d_next
        final_rsine = base_val + added
        steps.append({
            "step": step_num,
            "theory": f"Linear interpolation (Trairāśika) within interval {base_idx + 1} from {base_idx * h_deg}° to {(base_idx + 1) * h_deg}° using fractional arc {frac:.4f} of tabular difference δ_{base_idx + 1} = {int(d_next)}'.",
            "math": f"Rsin({angle_deg}°) = {base_val:.2f}' + ({frac:.4f} × {int(d_next)}') = {final_rsine:.4f}'"
        })
        step_num += 1
        contributions.append({
            "label": f"Interval {base_idx + 1} (partial: {frac:.4f} of {int(d_next)}')",
            "value": added / R
        })
    else:
        final_rsine = T[full]

    final_sin = final_rsine / R
    steps.append({
        "step": step_num,
        "theory": f"Normalize Āryabhaṭa's Rsine by circle radius R = 3438' to obtain the dimensionless sine value sin({angle_deg}°).",
        "math": f"sin({angle_deg}°) = {final_rsine:.4f}' / 3438' = {final_sin:.6f}"
    })
    step_num += 1

    max_dev = max(devs) if full >= 2 else 0.0
    if full >= 2:
        steps.append({
            "step": step_num,
            "theory": f"Recurrence vs table: maximum deviation = {max_dev:.2f}' over the intervals shown. The result uses the tabulated Rsines; the recurrence is displayed for comparison.",
            "math": f"max |R_rec,k − T_k| (k = 1..{full}) = {max_dev:.2f}'"
        })

    history = [T[k] / R for k in range(1, full + 1)]
    if not is_exact_node:
        history.append(final_sin)
    if full == 0:
        history = [final_sin]

    return final_sin, steps, history, is_exact_node, max_dev, contributions


def execute_aryabhata_pi_static():
    base_hundred = 100
    added_four = 4
    step1_val = base_hundred + added_four
    mult_eight = 8
    step2_val = step1_val * mult_eight
    sixty_two_thousand = 62000
    circumference = step2_val + sixty_two_thousand
    ayuta = 10000
    diameter = 2 * ayuta
    ancient_pi = circumference / diameter

    steps_ancient = [
        {
            "step": 1,
            "theory": "Phrase 1 — 'caturadhikaṃ śatam' (Shukla & Sarma, Gaṇitapāda 10): Take 100 (śatam) and add 4 (caturadhikam).",
            "math": f"100 + 4 = {step1_val}"
        },
        {
            "step": 2,
            "theory": "Phrase 2 — 'aṣṭaguṇam' (Gaṇitapāda 10): Multiply the resulting sum (104) by 8 (aṣṭa).",
            "math": f"{step1_val} × 8 = {step2_val}"
        },
        {
            "step": 3,
            "theory": "Phrase 3 — 'dvāṣaṣṭistathā sahasrāṇām' (Gaṇitapāda 10): Add 62,000 (sixty-two thousands) to obtain the total circumference (vṛtta-pariṇāha).",
            "math": f"{step2_val} + 62,000 = {circumference} (Circumference)"
        },
        {
            "step": 4,
            "theory": "Phrase 4 — 'ayutadvayaviṣkambhasya' (Gaṇitapāda 10): Specify the reference circle diameter (viṣkambha) as two ayutas (where 1 ayuta = 10,000).",
            "math": f"Diameter = 2 × 10,000 = {diameter}"
        },
        {
            "step": 5,
            "theory": "Phrase 5 — 'āsanno vṛttapariṇāhaḥ' (Gaṇitapāda 10): Divide the circumference (62,832) by the diameter (20,000) to obtain the nearly approximate (āsanna) value of π.",
            "math": f"π ≈ Circumference / Diameter = {circumference} / {diameter} = {ancient_pi:.4f}"
        }
    ]

    ancient_iter_history = [
        62000.0 / diameter,
        62800.0 / diameter,
        62832.0 / diameter
    ]

    contributions = [
        {"label": "Base 62,000 / 20,000 (dvāṣaṣṭi-sahasrāṇām)", "value": 62000.0 / diameter},
        {"label": "Hundred × 8 Term: (100 × 8) / 20,000 (śatam aṣṭaguṇam)", "value": 800.0 / diameter},
        {"label": "Four × 8 Fine Correction: (4 × 8) / 20,000 (caturadhikam aṣṭaguṇam)", "value": 32.0 / diameter}
    ]

    return ancient_pi, steps_ancient, ancient_iter_history, contributions


def polygon_stages(D: float = 1250.0):
    R = D / 2.0
    n = 6
    s = R
    stages = []
    for _ in range(7):
        stages.append((n, n * s))
        s = math.sqrt(2.0 * R * R - R * math.sqrt(4.0 * R * R - s * s))
        n *= 2
    return stages


def execute_bhaskara2_pi_static():
    bha_nakshatras = 27
    nanda = 9
    agni_fires = 3
    numerator_sukshma = agni_fires * 1000 + nanda * 100 + bha_nakshatras

    kha_zero = 0
    bana_arrows = 5
    surya_suns = 12
    denominator_sukshma = surya_suns * 100 + bana_arrows * 10 + kha_zero

    sukshma_pi = numerator_sukshma / denominator_sukshma
    sthula_pi = 22.0 / 7.0

    stages = polygon_stages(float(denominator_sukshma))
    P96 = dict(stages)[96]
    P384 = dict(stages)[384]
    ratio = P384 / denominator_sukshma

    steps_ancient = [
        {
            "step": 1,
            "theory": "Decode Bhūta-saṅkhyā Numerator — 'bhanandāgnihate' (Līlāvatī 201): bha (27 lunar mansions), nanda (9), agni (3 fires) read right-to-left gives multiplier 3,927.",
            "math": f"Multiplier = [agni=3][nanda=9][bha=27] = {numerator_sukshma}"
        },
        {
            "step": 2,
            "theory": "Decode Bhūta-saṅkhyā Denominator — 'vibhakte khabāṇasūryaiḥ' (Līlāvatī 201): kha (0), bāṇa (5 arrows), sūrya (12 suns) read right-to-left gives divisor 1,250.",
            "math": f"Divisor (Reference Diameter D) = [sūrya=12][bāṇa=5][kha=0] = {denominator_sukshma}"
        },
        {
            "step": 3,
            "theory": "Inscribed-polygon check (commentary tradition): halve chords from the regular hexagon (side 625) in a circle of diameter 1250 up to the 384-gon, using s_{2n} = √(2R² − R·√(4R² − s_n²)), R = 625.",
            "math": f"P_6 = 3750 → P_96 = {P96:.3f} → P_384 = {P384:.3f} (P_384/1250 = {ratio:.6f}); nearest integer = 3927"
        },
        {
            "step": 4,
            "theory": "Reduction from Āryabhaṭa's Ratio & Sūkṣma (Near) Quotient — 'paridhiḥ sa sūkṣmaḥ': Dividing Āryabhaṭa's 62,832 / 20,000 by GCD = 16 yields 3927 / 1250 = 3.1416.",
            "math": f"π_sūkṣma = (62832 ÷ 16) / (20000 ÷ 16) = {numerator_sukshma} / {denominator_sukshma} = {sukshma_pi:.4f}"
        },
        {
            "step": 5,
            "theory": "Sthūla (Gross Practical) Ratio — 'dvāviṃśatighne vihṛte'tha śailaiḥ sthūlo'thavā syādvyavahārayogyaḥ' (Līlāvatī 201): Multiplying by 22 and dividing by 7 (śaila = 7 mountains) gives the coarse everyday approximation.",
            "math": f"π_sthūla = 22 / 7 = {sthula_pi:.6f}   (Difference from Sūkṣma = +{sthula_pi - sukshma_pi:.6f})"
        }
    ]

    history = [p / 1250.0 for _, p in stages] + [3927.0 / 1250.0]

    contributions = [
        {"label": "Hexagon base (3750 / 1250)", "value": 3.0},
        {"label": "Polygon doubling 6→384-gon excess", "value": P384 / 1250.0 - 3.0},
        {"label": "Integer rounding to 3927", "value": 3927.0 / 1250.0 - P384 / 1250.0}
    ]

    return sukshma_pi, steps_ancient, history, contributions, P384


def execute_modern_machin_pi():
    modern_val = math.pi
    steps_modern = [{
        "step": 1,
        "theory": "Machin's Inverse-Tangent Identity (S. S. Sastry, Numerical Analysis): Evaluate π = 16·arctan(1/5) − 4·arctan(1/239) using Taylor series arctan(x) = Σ (−1)^j x^(2j+1) / (2j+1).",
        "math": "M_k = 16·Σ_{j<k} (−1)^j / ((2j+1)·5^(2j+1)) − 4·Σ_{j<k} (−1)^j / ((2j+1)·239^(2j+1))"
    }]

    history = []
    running = 0.0
    for k in range(1, 6):
        j = k - 1
        p = 2 * j + 1
        sign = (-1.0) ** j
        term = 16.0 * sign / (p * (5.0 ** p)) - 4.0 * sign / (p * (239.0 ** p))
        running += term
        history.append(running)
        steps_modern.append({
            "step": k + 1,
            "theory": f"Machin Series Iteration k = {k} (up to degree {p}): Add term j = {j} to partial sum.",
            "math": f"Partial sum after {k} terms = {running:.8f}   (Error: {abs(running - modern_val):.2e})"
        })

    steps_modern.append({
        "step": 7,
        "theory": "Final IEEE 754-2019 64-bit Hardware Floating-Point Transcendental Constant verification.",
        "math": f"IEEE 754 ground truth π = {modern_val:.8f}"
    })

    return modern_val, steps_modern, history


def execute_modern_maclaurin_sine(angle_deg: float):
    rad = math.radians(angle_deg)
    modern_val = math.sin(rad)
    steps_modern = [{
        "step": 1,
        "theory": "Methodology [S. S. Sastry, Numerical Analysis & IEEE 754]: Convert angle θ from degrees to radians x = θ × (π / 180) for Maclaurin series sin(x) = ∑ (-1)^n x^(2n+1) / (2n+1)!.",
        "math": f"x = {angle_deg}° × (π / 180°) = {round(rad, 8)} radians"
    }]
    modern_iter_history = []
    running_sin = 0.0
    for n in range(4):
        power = 2 * n + 1
        fact = math.factorial(power)
        sign = (-1) ** n
        term = sign * (rad ** power) / fact
        running_sin += term
        iter_err = abs(running_sin - modern_val)
        modern_iter_history.append(round(running_sin, 6))
        sign_str = "+" if sign > 0 else "-"
        steps_modern.append({
            "step": n + 2,
            "theory": f"Maclaurin Series Term {n+1} (Degree {power}): Add {sign_str} x^{power}/{power}! to partial sum.",
            "math": f"Term = {sign_str} ({round(rad, 5)})^{power} / {fact} = {round(term, 8)}  =>  Partial Sum S_{n+1} = {round(running_sin, 8)}  (Error: {iter_err:.2e})"
        })
    steps_modern.append({
        "step": 6,
        "theory": "Final IEEE 754-2019 64-bit Hardware Floating-Point Benchmark verification (alongside equivalent R·sin(θ) in arcminutes for R = 3438').",
        "math": f"IEEE 754 sin({angle_deg}°) = {round(modern_val, 8)}   (Exact R·sin θ = {round(modern_val * SINE_RADIUS_ARCMIN, 4)}')"
    })
    return modern_val, steps_modern, modern_iter_history


def execute_modern_newton_sqrt(N: float, initial_seed: float):
    steps_modern = []
    modern_val = math.sqrt(N)
    x_curr = initial_seed if initial_seed > 0 else 1.0
    modern_iter_history = [round(x_curr, 6)]
    steps_modern.append({
        "step": 1,
        "theory": "Methodology [S. S. Sastry, Numerical Analysis / IEEE 754]: Formulate square root extraction as finding the root of non-linear equation f(x) = x² - N = 0 with derivative f'(x) = 2x.",
        "math": f"f(x) = x² - {N} = 0,   Initial Seed x₀ = {x_curr}"
    })
    for k in range(1, 5):
        x_next = 0.5 * (x_curr + (N / x_curr))
        iter_err = abs(x_next - modern_val)
        steps_modern.append({
            "step": k + 1,
            "theory": f"Newton-Raphson Iteration {k}: Apply quadratic convergence formula x_{k} = x_{k-1} - f(x_{k-1})/f'(x_{k-1}) = 0.5 × (x_{k-1} + N / x_{k-1}).",
            "math": f"x_{k} = 0.5 × ({round(x_curr, 6)} + {N} / {round(x_curr, 6)}) = {round(x_next, 8)}   (Error: {iter_err:.2e})"
        })
        modern_iter_history.append(round(x_next, 6))
        x_curr = x_next
    steps_modern.append({
        "step": 6,
        "theory": "Final IEEE 754-2019 64-bit Hardware Floating-Point Benchmark verification.",
        "math": f"IEEE 754 Ground Truth = {round(modern_val, 8)}"
    })
    return modern_val, steps_modern, modern_iter_history


def execute_modern_newton_cuberoot(N: float, initial_seed: float):
    steps_modern = []
    modern_val = math.cbrt(N) if hasattr(math, "cbrt") else N ** (1.0 / 3.0)
    x_curr = initial_seed if initial_seed > 0 else 1.0
    modern_iter_history = [round(x_curr, 6)]
    steps_modern.append({
        "step": 1,
        "theory": "Methodology [S. S. Sastry, Numerical Analysis / IEEE 754]: Formulate cube root extraction as finding the root of non-linear equation f(x) = x³ - N = 0 with derivative f'(x) = 3x².",
        "math": f"f(x) = x³ - {N} = 0,   Initial Seed x₀ = {x_curr}"
    })
    for k in range(1, 5):
        x_next = (2.0 * x_curr + (N / (x_curr ** 2))) / 3.0
        iter_err = abs(x_next - modern_val)
        steps_modern.append({
            "step": k + 1,
            "theory": f"Newton-Raphson Iteration {k}: Apply cubic convergence formula x_{k} = x_{k-1} - f(x_{k-1})/f'(x_{k-1}) = (2x_{k-1} + N / x_{k-1}²) / 3.",
            "math": f"x_{k} = (2×{round(x_curr, 6)} + {N} / {round(x_curr, 6)}²) / 3 = {round(x_next, 8)}   (Error: {iter_err:.2e})"
        })
        modern_iter_history.append(round(x_next, 6))
        x_curr = x_next
    steps_modern.append({
        "step": 6,
        "theory": "Final IEEE 754-2019 64-bit Hardware Floating-Point Benchmark verification.",
        "math": f"IEEE 754 Ground Truth = {round(modern_val, 8)}"
    })
    return modern_val, steps_modern, modern_iter_history


def build_xai_explanations(method: str, N: float, ancient_val: float, modern_val: float, is_exact: bool, rem_val: float, contributions: list, extra=None):
    if extra is None:
        extra = {}
    abs_err = abs(ancient_val - modern_val)
    ref_val = abs(modern_val) if modern_val != 0 else 1.0
    rel_err_pct = (abs_err / ref_val) * 100.0

    total_contrib = sum(abs(c["value"]) for c in contributions) or 1.0
    feature_attributions = []
    for c in contributions:
        pct = round((abs(c["value"]) / total_contrib) * 100.0, 2)
        feature_attributions.append({
            "feature": c["label"],
            "value": round(c["value"], 6),
            "importance_pct": pct,
            "contribution_pct": pct
        })

    if method == "aryabhata_sqrt":
        why_input = (
            f"Input N = {N} has {len(str(int(N)))} integer digits, which decomposes into {(len(str(int(N))) + 1)//2} odd/even (varga/avarga) place-value pairs. "
            + ("Because N = 55,225 is the canonical textbook benchmark (235²), it tests multi-digit carry propagation across 3 odd places and 2 even places with zero remainder."
               if N == 55225 else
               f"This input tests {'exact square root termination' if is_exact else f'non-square root approximation via {DECIMAL_PLACES} decimal pairs'}.")
        )
        why_steps = (
            "Āryabhaṭa's algorithm performs an exact Radix-10 Binomial Decomposition based on (10a + b)² = 100a² + 20ab + b². "
            "Subtracting a² from the leftmost odd ('o') place removes 100a²; dividing the adjacent even ('e') place by 2a isolates the next digit b (since 20ab / 20a = b); "
            "and subtracting b² from the next odd ('o') place completes the identity."
        )
        why_error = (
            f"Absolute error = {abs_err:.2e}, relative error = {rel_err_pct:.6f}%. "
            f"Digits are extracted by truncation (not rounding) to {DECIMAL_PLACES} decimal places, so truncation error is below 10^-{DECIMAL_PLACES}; final remainder = {rem_val}."
        )

    elif method == "aryabhata_cuberoot":
        why_input = (
            f"Input N = {N} has {len(str(int(N)))} integer digits, which partitions into {(len(str(int(N))) + 2)//3} radix-10 cubic triplets (c, n', n). "
            + ("Because N = 1,771,561 is Shukla & Sarma's textbook benchmark (121³), it validates multi-triplet extraction across 3 cube places and 4 non-cube places."
               if N == 1771561 else
               f"Because N = {N} is {'an exact cube' if is_exact else 'not an exact integer cube'}, the engine executes {'exact termination' if is_exact else f'decimal triplet continuation across {DECIMAL_PLACES} fractional places'}.")
        )
        why_steps = (
            "Āryabhaṭa's Ghanamūla algorithm is a direct place-value inversion of the binomial cube expansion (10a + b)³ = 1000a³ + 300a²b + 30ab² + b³. "
            "After removing 1000a³ from the cube ('c') place, dividing the second non-cube ('n'') place by 3a² isolates quotient digit b; "
            "subtracting 3ab² from the first non-cube ('n') place and subtracting b³ from the cube ('c') place algebraically reconstructs (10a + b)³."
        )
        why_error = (
            f"Absolute error = {abs_err:.2e}, relative error = {rel_err_pct:.6f}%. "
            f"Digits are extracted by truncation (not rounding) to {DECIMAL_PLACES} decimal places, so truncation error is below 10^-{DECIMAL_PLACES}; final remainder = {rem_val}."
        )

    elif method == "aryabhata_sinetable":
        why_input = (
            f"Input θ = {N}° maps to arc-length {N * 60}' in a quadrant of 5400' ({QUADRANT_LIMIT_DEG}°). "
            + (f"Because {N}° is an exact multiple of h = 3.75° (interval n = {int(round(N / 3.75))}), it directly evaluates Āryabhaṭa's 24-interval sine table at a node."
               if is_exact else
               f"Because {N}° lies between two tabular nodes ({int(N // 3.75) * 3.75}° and {(int(N // 3.75) + 1) * 3.75}°), it evaluates the sine table with linear interpolation (Trairāśika).")
        )
        why_steps = (
            "Gaṇitapāda 12 states a discrete second-order finite-difference recurrence: "
            "δ_n - δ_{n+1} = (R_n / R₁)(δ₁ - δ₂). Since Āryabhaṭa sets δ₁ = 225' and δ₂ = 224' (so δ₁ - δ₂ = 1), this simplifies to δ_{n+1} = δ_n - R_n / R₁ = R₁ - (R₁ + ... + R_n)/R₁."
        )
        why_error = (
            f"Absolute error = {abs_err:.2e}, relative error = {rel_err_pct:.4f}%. "
            f"The result uses the tabulated Rsines (R = {SINE_RADIUS_ARCMIN}', whole arcminutes) with linear interpolation between 3°45′ nodes; table quantisation and interpolation cause the error. "
            f"The generating recurrence deviates from the table by up to {rem_val:.1f}' and is shown for comparison only."
        )

    elif method == "aryabhata_pi":
        why_input = (
            "Static Sutra Selection: No user input parameter is taken because Gaṇitapāda Verse 10 prescribes a fixed canonical reference circle "
            "of Diameter D = 2 ayutas = 20,000 units and Circumference C = 62,832 units, yielding the universal mathematical constant π ≈ 3.1416."
        )
        why_steps = (
            "The Sanskrit verse is structured as a compact arithmetic program to fit the Āryā poetic meter: "
            "it decomposes 62,832 into [(100 + 4) × 8] + 62,000 = 832 + 62,000 = 62,832, and divides by 20,000 (ayuta-dvaya)."
        )
        why_error = (
            f"Absolute error = {abs_err:.8f}, relative error = {rel_err_pct:.5f}%. "
            f"Signed error = {ancient_val - modern_val:+.8f}; agrees with π to {matching_decimals(ancient_val, modern_val)} decimal places."
        )

    else:
        P384 = extra.get("P384", 3926.947)
        why_input = (
            "Static Sutra Selection: No user input is required because Līlāvatī Rule 201 (Colebrooke / Banerji, Līlāvatī 201) defines a fixed canonical circle "
            "of Diameter D = 1,250 units (khabāṇasūrya) and near Circumference C = 3,927 units (bhanandāgni), alongside the practical ratio 22 / 7."
        )
        why_steps = (
            f"Reduction of Āryabhaṭa's ratio 62832/20000 by GCD 16 gives 3927/1250; "
            f"an inscribed 384-gon computed by chord-halving gives perimeter ≈ {P384:.3f} for D = 1250, whose nearest integer is 3927."
        )
        why_error = (
            f"Absolute error = {abs_err:.8f}, relative error = {rel_err_pct:.5f}%. "
            f"Signed error = {ancient_val - modern_val:+.8f}: 3927 rounds the polygon perimeter {P384:.3f} up, and the inscribed polygon itself undershoots the circumference. "
            f"22/7 = 3.142857 (sthūla) is shown only as the practical reference."
        )

    attribution_note = (
        "Each value is the exact share of the final result contributed by that term or digit place "
        "(a deterministic decomposition of the algorithm's own steps, not a SHAP/LIME-style estimate)."
    )

    return {
        "why_this_input": why_input,
        "why_these_steps": why_steps,
        "why_error_size": why_error,
        "feature_attributions": feature_attributions,
        "attribution_note": attribution_note,
        "input_rationale": why_input,
        "ancient_logic": why_steps,
        "convergence_analysis": why_error
    }


@app.post("/api/compute")
def compute_approximation(req: ComputeRequest):
    if req.method_id not in SUTRAS_DB:
        raise HTTPException(status_code=400, detail=f"Invalid method_id: {req.method_id}")

    N = req.input_value
    method = req.method_id
    extra = {}

    if method in ("aryabhata_sqrt", "aryabhata_cuberoot", "aryabhata_sinetable"):
        if not math.isfinite(N):
            raise HTTPException(status_code=400, detail="Input must be a finite number.")

    if method == "aryabhata_sqrt":
        if not (0 < N <= 1e12):
            raise HTTPException(status_code=400, detail="Input N must be greater than 0 and at most 1e12.")
        ancient_val, steps_ancient, anc_history, is_exact, rem_val, contribs = execute_aryabhata_vargamula(N)
        seed_val = anc_history[0] if len(anc_history) > 0 else 1.0
        modern_val, steps_modern, mod_history = execute_modern_newton_sqrt(N, seed_val)
        chart_kind = "refinement"
        ancient_label = "Āryabhaṭa digit-by-digit root"
        modern_label = "Newton–Raphson iterates"
        reference_lines = {}

    elif method == "aryabhata_cuberoot":
        if not (0 < N <= 1e12):
            raise HTTPException(status_code=400, detail="Input N must be greater than 0 and at most 1e12.")
        ancient_val, steps_ancient, anc_history, is_exact, rem_val, contribs = execute_aryabhata_ghanamula(N)
        seed_val = anc_history[0] if len(anc_history) > 0 else 1.0
        modern_val, steps_modern, mod_history = execute_modern_newton_cuberoot(N, seed_val)
        chart_kind = "refinement"
        ancient_label = "Āryabhaṭa digit-by-digit root"
        modern_label = "Newton–Raphson iterates"
        reference_lines = {}

    elif method == "aryabhata_sinetable":
        if N <= 0 or N > QUADRANT_LIMIT_DEG:
            raise HTTPException(status_code=400, detail="Validation error: Angle θ must be between 0° (exclusive) and 90° (inclusive) for Āryabhaṭa's quadrant Sine-Table (Jyā).")
        ancient_val, steps_ancient, anc_history, is_exact_node, max_dev, contribs = execute_aryabhata_jya(N)
        modern_val, steps_modern, _ = execute_modern_maclaurin_sine(N)
        
        # Build honest node-by-node coordinate history for sine table graph
        exact_idx = N / 3.75
        base_idx = int(math.floor(exact_idx))
        full = base_idx
        is_node = abs(exact_idx - round(exact_idx)) < 1e-9
        
        node_angles = [k * 3.75 for k in range(1, full + 1)]
        if not is_node and full > 0:
            node_angles.append(N)
        if full == 0:
            node_angles = [N]
            
        mod_history = [round(math.sin(math.radians(th)), 6) for th in node_angles]
        labels_iter = [f"{th:g}°" for th in node_angles]
        
        chart_kind = "table_nodes"
        ancient_label = "Āryabhaṭa Rsine / R at successive table nodes"
        modern_label = "Modern sin(θ) at corresponding node angles"
        reference_lines = {}
        rem_val = max_dev

    elif method == "aryabhata_pi":
        N = 20000.0
        ancient_val, steps_ancient, anc_history, contribs = execute_aryabhata_pi_static()
        modern_val, steps_modern, mod_history = execute_modern_machin_pi()
        is_exact = False
        rem_val = 0.0
        chart_kind = "construction"
        ancient_label = "Construction stages (62,000 → +800 → +32) / 20,000"
        modern_label = "Machin series partial sums"
        reference_lines = {}

    elif method == "bhaskara2_pi":
        N = 1250.0
        ancient_val, steps_ancient, anc_history, contribs, P384 = execute_bhaskara2_pi_static()
        modern_val, steps_modern, mod_history = execute_modern_machin_pi()
        is_exact = False
        rem_val = 0.0
        extra = {"P384": P384}
        chart_kind = "construction"
        ancient_label = "Inscribed polygon 6→384-gon, then 3927/1250"
        modern_label = "Machin series partial sums"
        reference_lines = {"22/7 (sthūla)": 3.142857}

    if method != "aryabhata_sinetable":
        max_len = max(len(anc_history), len(mod_history))
        while len(anc_history) < max_len:
            anc_history.append(anc_history[-1])
        while len(mod_history) < max_len:
            mod_history.append(mod_history[-1])
        labels_iter = [f"Step {i+1}" for i in range(max_len)]

    abs_err = abs(ancient_val - modern_val)
    ref_val = abs(modern_val) if modern_val != 0 else 1.0
    rel_err_percent = (abs_err / ref_val) * 100.0
    accuracy_pct = max(0.0, min(100.0, 100.0 - rel_err_percent))
    k_match = matching_decimals(ancient_val, modern_val)

    xai_data = build_xai_explanations(method, N, ancient_val, modern_val, is_exact if method in ("aryabhata_sqrt", "aryabhata_cuberoot") else False, rem_val, contribs, extra=extra)

    return {
        "method_id": method,
        "sutra_type": SUTRAS_DB[method]["type"],
        "input_value": N,
        "ancient_computed_result": round(ancient_val, 6),
        "modern_computed_result": round(modern_val, 6),
        "absolute_error": round(abs_err, 8),
        "relative_error_percent": round(rel_err_percent, 6),
        "significant_digits_match": k_match,
        "standard_accuracy_percent": round(accuracy_pct, 4),
        "accuracy_percent": round(accuracy_pct, 4),
        "error_formulas": {
            "abs_formula": f"E_abs = |V_ancient - V_modern| = |{round(ancient_val, 6)} - {round(modern_val, 6)}| = {round(abs_err, 8)}",
            "rel_formula": f"E_rel(%) = (E_abs / |V_modern|) × 100 = ({round(abs_err, 8)} / {round(ref_val, 6)}) × 100 = {round(rel_err_percent, 6)}%",
            "precision_formula": f"Rounded agreement to {k_match} decimal place(s) (|error| = {abs_err:.2e})",
            "bounded_formula": f"Acc(%) = max(0, 100 - E_rel(%)) = {round(accuracy_pct, 4)}%"
        },
        "steps_ancient": steps_ancient,
        "steps_modern": steps_modern,
        "xai_rationale": xai_data,
        "graph_data": {
            "iterations": labels_iter,
            "ancient_curve": [round(x, 6) for x in anc_history],
            "modern_curve": [round(x, 6) for x in mod_history],
            "chart_kind": chart_kind,
            "ancient_label": ancient_label,
            "modern_label": modern_label,
            "reference_lines": reference_lines
        }
    }

@app.get("/api/sutras")
def get_sutras_list():
    return [{"id": k, **v} for k, v in SUTRAS_DB.items()]

from ai_explain import router as ai_router
app.include_router(ai_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)