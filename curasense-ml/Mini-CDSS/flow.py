# Mini-CDSS/flow.py
"""
CdssPipeline — updated to:
- Prefer scispaCy NER (optional) and fall back to existing HF NER.
- Use crew agents when available but include robust deterministic fallbacks so the pipeline
  produces clinically useful output even when LLM agents fail/auth issues.
- Produce a deterministic, medical-grade Markdown report matching your requested template.
- Does NOT run the pipeline at import time.
"""

import os
import json
import asyncio
import re
from pydantic import BaseModel
from crewai import Flow
from crewai.flow.flow import listen, start, and_
from tavily import TavilyClient

from src.hugging_face_ner import process_ner_output, generate_clean_ner_report
from src.crew.agents_and_taks import ner_validation_crew, prelim_diag_crew, report_writing_crew

# Optional: scispaCy (if installed)
try:
    import spacy
    from scispacy.umls_linking import UmlsEntityLinker  # type: ignore
    try:
        _SCI_NLP = spacy.load("en_ner_bc5cdr_md")
    except Exception:
        _SCI_NLP = spacy.load("en_core_sci_sm")
    try:
        _UMLS_LINKER = UmlsEntityLinker(resolve_abbreviations=True)
        _SCI_NLP.add_pipe(_UMLS_LINKER)
    except Exception:
        _UMLS_LINKER = None
except Exception:
    _SCI_NLP = None
    _UMLS_LINKER = None


# -------------------------
# Normalizer
# -------------------------
def normalize(val):
    """Convert ANY CrewOutput/Pydantic/nested objects → pure Python dict/list."""
    if val is None or isinstance(val, (str, int, float, bool)):
        return val
    if isinstance(val, BaseModel):
        return normalize(val.dict())
    if isinstance(val, dict):
        return {k: normalize(v) for k, v in val.items()}
    if isinstance(val, (list, tuple)):
        return [normalize(x) for x in val]
    if hasattr(val, "raw_output"):
        return normalize(val.raw_output)
    if hasattr(val, "output"):
        return normalize(val.output)
    if hasattr(val, "__dict__"):
        try:
            return normalize(vars(val))
        except Exception:
            pass
    return str(val)


# -------------------------
# Helpers: parsing lab/vital values
# -------------------------
def parse_lab_values_from_postner(post_ner):
    """
    Extract numeric lab values (Random blood sugar, HbA1c, BP) from structured post_ner or raw text.
    Returns dict like: {"RBS": 350.0, "HbA1c": 10.5, "BP_systolic":140, "BP_diastolic":90}
    """
    results = {}
    text_source = ""

    # Prefer explicit structured fields
    if isinstance(post_ner, dict):
        # If NERValidationOutput contains a field with raw_text or sample_text, prefer it
        for candidate in ("raw_text", "sample_text", "text", "report", "raw_report"):
            val = post_ner.get(candidate) if isinstance(post_ner, dict) else None
            if val:
                text_source = str(val)
                break

    if not text_source:
        try:
            text_source = json.dumps(post_ner)
        except Exception:
            text_source = str(post_ner)

    # Normalize spacing
    text_source = re.sub(r"\s+", " ", text_source)

    # Random blood sugar (e.g., "350 mg/dl")
    m = re.search(r"(?:random\s*blood\s*sugar[:\s]*)?([0-9]{2,4}(?:\.[0-9]+)?)\s*(mg\/dl|mg dl|mgdl)?", text_source, re.IGNORECASE)
    if m:
        try:
            # Heuristic: if mg/dl unit present or nearby keywords present
            unit = m.group(2)
            val = float(m.group(1))
            # To avoid capturing other numeric values (age etc.) confirm presence of sugar/blood nearby
            context_window = text_source[max(0, m.start()-40): m.end()+40].lower()
            if ("sugar" in context_window) or ("mg/dl" in (unit or "").lower()) or ("random" in context_window):
                results["RBS"] = val
        except Exception:
            pass

    # HbA1c e.g. "HbA1c 10.5" or "10.5%"
    m2 = re.search(r"(hb[a\-]?1c|hba1c)[^\d]{0,6}([0-9]{1,2}(?:\.[0-9]+)?)\s*%?", text_source, re.IGNORECASE)
    if m2:
        try:
            results["HbA1c"] = float(m2.group(2))
        except Exception:
            pass
    else:
        # sometimes HbA1c appears as "10.5%" standalone
        m2b = re.search(r"([0-9]{1,2}(?:\.[0-9]+)?)\s*%", text_source)
        if m2b:
            # only accept if nearby "hba1c" or "A1c" mention exists in surrounding text
            span = text_source[max(0, m2b.start()-40): m2b.end()+40].lower()
            if "hba1c" in span or "a1c" in span:
                try:
                    results["HbA1c"] = float(m2b.group(1))
                except Exception:
                    pass

    # Blood pressure e.g. "140/90 mmHg"
    m3 = re.search(r"([0-9]{2,3})\s*\/\s*([0-9]{2,3})\s*(mmhg)?", text_source, re.IGNORECASE)
    if m3:
        try:
            results["BP_systolic"] = int(m3.group(1))
            results["BP_diastolic"] = int(m3.group(2))
        except Exception:
            pass

    return results


# -------------------------
# Deterministic prelim diagnosis (fallback)
# -------------------------
def rule_based_prelim_diagnoses(post_ner_normalized, min_count=3):
    """
    Return a list of dicts: {preliminary_diagnosis, confidence, reasoning, recommendations}
    """
    diagnoses = []
    labs = parse_lab_values_from_postner(post_ner_normalized)

    # collect symptoms
    symptoms = []
    entities = []
    if isinstance(post_ner_normalized, dict):
        entities = post_ner_normalized.get("entities", []) or []
    if isinstance(entities, list):
        for e in entities:
            t = ""
            if isinstance(e, dict):
                t = (e.get("text") or "").lower()
            else:
                t = str(e).lower()
            symptoms.append(t)

    # Rule: Diabetes
    rbs = labs.get("RBS")
    hba1c = labs.get("HbA1c")
    symptom_support = any(s for s in symptoms if any(k in s for k in ["polyuria", "polydipsia", "polyphagia", "blurred vision", "fatigue"]))
    if (rbs is not None and rbs >= 200) or (hba1c is not None and hba1c >= 6.5) or symptom_support:
        # assign confidence
        if (rbs is not None and rbs >= 300) or (hba1c is not None and hba1c >= 10):
            conf = 0.95
        elif (rbs is not None and rbs >= 200) or (hba1c is not None and hba1c >= 7):
            conf = 0.85
        else:
            conf = 0.65
        reasoning = []
        if rbs is not None:
            reasoning.append(f"Random blood sugar {rbs} mg/dl")
        if hba1c is not None:
            reasoning.append(f"HbA1c {hba1c}%")
        if symptom_support:
            reasoning.append("Classic hyperglycemia symptoms: " + ", ".join([s for s in symptoms if any(k in s for k in ["polyuria", "polydipsia", "blurred vision", "fatigue"])]))
        diagnoses.append({
            "preliminary_diagnosis": "Uncontrolled Type 2 Diabetes Mellitus with Acute Hyperglycemia",
            "confidence": round(conf, 2),
            "reasoning": "; ".join(reasoning) or "Symptoms consistent with hyperglycemia",
            "recommendations": [
                "Continue close monitoring of blood glucose, fluid balance, and electrolytes.",
                "Stabilize acute hyperglycemia (IV fluids, insulin infusion) as clinically indicated and monitor electrolytes.",
                "Once stable, review outpatient diabetes regimen, adherence, and lifestyle factors; consider endocrinology referral."
            ]
        })

    # Rule: Diabetic retinopathy (symptoms + fundoscopic findings)
    fundus_terms = [t for t in symptoms if any(k in t for k in ["microaneurysm", "microaneurysms", "cotton wool", "cotton wool spot", "retinopathy"])]
    if fundus_terms or any("fundoscopic" in (e.get("label","").lower() if isinstance(e, dict) else "") for e in entities):
        diagnoses.append({
            "preliminary_diagnosis": "Diabetic Retinopathy (likely non-proliferative)",
            "confidence": 0.8 if fundus_terms else 0.6,
            "reasoning": "Longstanding diabetes with fundoscopic signs (microaneurysms, cotton wool spots) and visual symptom(s) such as blurred vision.",
            "recommendations": [
                "Immediate referral to ophthalmology for comprehensive dilated fundoscopic exam and OCT if indicated.",
                "Optimize glycemic and blood pressure control to slow progression."
            ]
        })

    # Rule: Hypertension
    bp_s = labs.get("BP_systolic")
    bp_d = labs.get("BP_diastolic")
    if (bp_s is not None and bp_s >= 140) or (bp_d is not None and bp_d >= 90):
        diagnoses.append({
            "preliminary_diagnosis": "Hypertension (elevated blood pressure)",
            "confidence": 0.7,
            "reasoning": f"Recorded blood pressure {bp_s}/{bp_d} mmHg, which is elevated and commonly comorbid with diabetes.",
            "recommendations": [
                "Initiate or optimize antihypertensive therapy to achieve target BP (typically <130/80 mmHg for patients with diabetes).",
                "Lifestyle modification: low-sodium diet, regular exercise, weight management; monitor blood pressure regularly."
            ]
        })

    # Add more heuristic differentials if needed (anemia, infection) — simple symptom-based mapping
    if not diagnoses:
        # symptom-driven low-confidence candidates
        symptom_map = {
            "fatigue": ["Anemia", "Thyroid disorder", "Chronic disease"],
            "blurred vision": ["Refractive error", "Diabetic retinopathy", "Hypertensive retinopathy"]
        }
        candidate = {}
        for s in symptoms:
            for key, diffs in symptom_map.items():
                if key in s:
                    for d in diffs:
                        candidate[d] = candidate.get(d, 0) + 1
        for name, count in sorted(candidate.items(), key=lambda x: -x[1])[:3]:
            diagnoses.append({
                "preliminary_diagnosis": name,
                "confidence": round(0.45 + 0.1 * count, 2),
                "reasoning": f"Symptom match count: {count}",
                "recommendations": [
                    "Consider targeted laboratory testing and specialist referral as appropriate."
                ]
            })

    # Ensure at least min_count entries
    idx = 0
    while len(diagnoses) < min_count:
        idx += 1
        diagnoses.append({
            "preliminary_diagnosis": f"No strong diagnosis available (fallback {idx})",
            "confidence": 0.2,
            "reasoning": "Insufficient structured evidence from NER/labs to provide a higher-confidence diagnosis.",
            "recommendations": ["Obtain further history, vitals, and targeted laboratory tests."]
        })

    return {"entries": diagnoses, "labs": labs}


# ============================================================
# CDSS Pipeline
# ============================================================
class CdssPipeline(Flow):
    def __init__(self, sample_text, tavily_api):
        super().__init__()
        self.sample_text = sample_text
        self.tavily_api = tavily_api

    # --------------------------------------------------------
    # 1. NER Extraction
    # --------------------------------------------------------
    @start()
    def initial_hugging_face_ner_report(self):
        # Use scispaCy if present, else HF functions
        if _SCI_NLP:
            try:
                doc = _SCI_NLP(self.sample_text)
                ents = []
                for ent in doc.ents:
                    umls_ents = getattr(ent._, "umls_ents", []) or []
                    best = umls_ents[0] if len(umls_ents) > 0 else None
                    cui = best[0] if best else None
                    score = best[1] if best else None
                    ents.append({
                        "text": ent.text,
                        "label": ent.label_,
                        "start": ent.start_char,
                        "end": ent.end_char,
                        "cui": cui,
                        "link_score": float(score) if score is not None else None
                    })
                report = {"entities": ents, "sample_text": self.sample_text}
                return {"report": report, "sample_text": self.sample_text}
            except Exception:
                # fallback to HF
                pass

        tagged_tokens, unique_tags = process_ner_output(self.sample_text)
        report = generate_clean_ner_report(tagged_tokens, unique_tags)
        if not isinstance(report, dict):
            report = {"raw_report": report, "sample_text": self.sample_text}
        else:
            report["sample_text"] = self.sample_text
        return {"report": report, "sample_text": self.sample_text}

    # --------------------------------------------------------
    # 2. NER Validation (use crew if available; fallback to raw)
    # --------------------------------------------------------
    @listen(initial_hugging_face_ner_report)
    def ner_validation_method(self, report_dict):
        report = report_dict["report"]
        sample_text = report_dict["sample_text"]

        try:
            result = ner_validation_crew.kickoff(inputs={"input_text": sample_text, "ner_output": report})
            parsed = normalize(result)
        except Exception as e:
            # fallback: keep HF output but normalize keys into expected structure
            print("Warning: ner_validation_crew failed, falling back to raw NER. Error:", repr(e))
            parsed = {}
            if isinstance(report, dict) and report.get("entities"):
                parsed["entities"] = report.get("entities")
            else:
                parsed["raw_report"] = report
            parsed["sample_text"] = sample_text

        self.state["post_ner_report"] = parsed
        return parsed

    # --------------------------------------------------------
    # 3. Preliminary Diagnosis (use crew then fallback to rules)
    # --------------------------------------------------------
    @listen(ner_validation_method)
    def prelim_diag_method(self, post_ner_report):
        post_ner_norm = normalize(post_ner_report)
        try:
            result = prelim_diag_crew.kickoff(inputs={"output_count": 3, "post_ner_report": post_ner_norm})
            parsed = normalize(result)
            # basic validation: must contain entries list
            if isinstance(parsed, dict) and parsed.get("entries"):
                self.state["prelim_report"] = parsed
                return parsed
            # else fallback
            print("Warning: prelim_diag_crew returned invalid structure — using rule-based fallback.")
        except Exception as e:
            print("Warning: prelim_diag_crew failed — using rule-based fallback. Error:", repr(e))

        # Deterministic fallback
        fallback = rule_based_prelim_diagnoses(post_ner_norm, min_count=3)
        self.state["prelim_report"] = fallback
        return fallback

    # --------------------------------------------------------
    # 4. Extract diagnosis list
    # --------------------------------------------------------
    @listen(prelim_diag_method)
    def extract_diagnosis_method(self, prelim_report):
        prelim_report = normalize(prelim_report)
        entries = []
        if isinstance(prelim_report, dict):
            entries = prelim_report.get("entries", []) or []
        elif isinstance(prelim_report, list):
            entries = prelim_report
        diagnosis = []
        for entry in entries:
            if isinstance(entry, dict):
                diagnosis.append(entry.get("preliminary_diagnosis", str(entry)))
            else:
                diagnosis.append(str(entry))
        return diagnosis

    # --------------------------------------------------------
    # 5. Best Practices via Tavily (use if tavily_api present; else leave empty)
    # --------------------------------------------------------
    @listen(extract_diagnosis_method)
    def best_practises(self, diagnosis):
        best_practices_summary = []
        tavily_client = None
        if self.tavily_api:
            try:
                tavily_client = TavilyClient(api_key=self.tavily_api)
            except Exception:
                tavily_client = None
        for entry in diagnosis:
            entry_text = str(entry)
            tavily_results = []
            if tavily_client:
                try:
                    response = tavily_client.search(f"Best practices for {entry_text}", search_depth="advanced")
                    tavily_results = [
                        {
                            "title": r.get("title"),
                            "url": r.get("url"),
                            "summary": r.get("content")
                        }
                        for r in response.get("results", []) if r.get("score", 0) > 0.4
                    ]
                except Exception:
                    tavily_results = []
            best_practices_summary.append({
                "best_practices_for": entry_text,
                "practices": tavily_results
            })
        self.state["best_practices_summary"] = best_practices_summary
        return best_practices_summary

    # --------------------------------------------------------
    # 6. Final Clinical Report Writer (strict template)
    # --------------------------------------------------------
    @listen(and_(ner_validation_method, prelim_diag_method, best_practises))
    def report_writing_method(self):
        """
        Produce final clinical report in the exact template requested by the user.
        """
        # top-line caveat
        md_lines = []
        md_lines.append("*This is an automated preliminary report. Human clinician review is REQUIRED before any clinical action.*")
        md_lines.append("")
        md_lines.append("# Clinical Report")
        md_lines.append("")

        # Fetch pieces
        post_ner = self.state.get("post_ner_report", {}) or {}
        prelim = self.state.get("prelim_report", {}) or {}
        best_pracs = self.state.get("best_practices_summary", []) or []

        # Helper extractors
        def get_field_list(d, key):
            if isinstance(d, dict):
                val = d.get(key)
                if isinstance(val, list):
                    return val
                if isinstance(val, str) and val.strip():
                    return [val]
            return []

        # Try to extract age/sex/history/presenting complaint/signs/exams/vitals/labs/extra
        age = "Not Provided"
        sex = "Not Provided"
        history = []
        presenting_complaint = "Not Provided"
        signs = []
        examinations = []
        vital_signs = {}
        lab_values = {}
        extra_summary = "Not Provided"

        # If NERValidationOutput is structured, try common keys
        if isinstance(post_ner, dict):
            # Entities could be a list of dicts with label/type
            ents = post_ner.get("entities", []) or []
            # Also some implementations may provide categorized keys
            history = post_ner.get("history") or post_ner.get("medical_history") or history
            presenting_complaint = post_ner.get("presenting_complaint") or post_ner.get("chief_complaint") or presenting_complaint
            signs = post_ner.get("signs_and_symptoms") or post_ner.get("signs") or signs
            examinations = post_ner.get("examinations_before_checkup") or post_ner.get("examinations") or examinations
            lab_values = post_ner.get("laboratory_values") or post_ner.get("labs") or lab_values
            vital_signs = post_ner.get("vital_signs") or vital_signs
            extra_summary = post_ner.get("extra_summary") or post_ner.get("summary") or extra_summary
            # individual entity parsing
            for e in ents:
                if not isinstance(e, dict):
                    continue
                text = (e.get("text") or "").strip()
                label = (e.get("label") or e.get("type") or "").lower()
                if label in ("age", "years", "age_years"):
                    age = text if text else age
                if label in ("sex", "gender"):
                    sex = text if text else sex
                if label in ("history", "hpi"):
                    if text: history.append(text)
                if label in ("presenting_complaint", "chief_complaint"):
                    presenting_complaint = text or presenting_complaint
                if label in ("symptom", "sign", "sign_symptom", "symptoms"):
                    if text and text not in signs:
                        signs.append(text)
                if label in ("examination", "procedure"):
                    if text and text not in examinations:
                        examinations.append(text)
                if label in ("vital_sign", "vital"):
                    # try to parse as k:v or "blood pressure 140/90"
                    if ":" in text:
                        k, v = [x.strip() for x in text.split(":", 1)]
                        vital_signs[k] = v
                    else:
                        # attempt BP parse
                        m = re.search(r"([0-9]{2,3}\s*\/\s*[0-9]{2,3})", text)
                        if m:
                            vital_signs["Blood pressure"] = m.group(1).replace(" ", "")
                if label in ("lab_value", "laboratory_value", "lab"):
                    if ":" in text:
                        k, v = [x.strip() for x in text.split(":", 1)]
                        lab_values[k] = v
                    else:
                        # try detect "HbA1c 10.5%" etc.
                        m = re.search(r"(hba1c|hb a1c|hb-a1c)[^\d]*([0-9]{1,2}(?:\.[0-9]+)?)", text, re.IGNORECASE)
                        if m:
                            lab_values["HbA1c"] = m.group(2) + ("% " if "%" not in text else "%")
                        m2 = re.search(r"([0-9]{2,4})\s*(mg\/dl|mg dl)", text, re.IGNORECASE)
                        if m2:
                            lab_values["Random blood sugar"] = m2.group(1) + " mg/dl"

        # If some things still missing, try simple extraction from sample_text
        sample_text = post_ner.get("sample_text") if isinstance(post_ner, dict) else None
        if sample_text:
            # Age: look for patterns like "42-year-old" or "age 42"
            if age == "Not Provided":
                m = re.search(r"(\d{1,3})\s*-\s*year\s*-\s*old|\b(\d{1,3})\s*year(?:s)?\s*old\b|age[:\s]+(\d{1,3})\b", sample_text, re.IGNORECASE)
                if m:
                    age = next((g for g in m.groups() if g), age)
                    if age and age.isdigit():
                        age = f"{age}-year-old"
            if sex == "Not Provided":
                if re.search(r"\bmale\b", sample_text, re.IGNORECASE):
                    sex = "male"
                elif re.search(r"\bfemale\b", sample_text, re.IGNORECASE):
                    sex = "female"
            if presenting_complaint == "Not Provided":
                # try to pull full sentence containing 'complain' or 'presenting'
                m = re.search(r"(complain(?:s)? of .*?(\.|$))|(presenting with .*?(\.|$))", sample_text, re.IGNORECASE)
                if m:
                    presenting_complaint = (m.group(0) or presenting_complaint).strip()

            # Extract labs/vitals heuristically if still empty
            labs_parsed = parse_lab_values_from_postner(post_ner)
            if labs_parsed:
                if "RBS" in labs_parsed and "Random blood sugar" not in lab_values:
                    lab_values["Random blood sugar"] = f"{labs_parsed['RBS']} mg/dl"
                if "HbA1c" in labs_parsed and "HbA1c" not in lab_values:
                    lab_values["HbA1c"] = f"{labs_parsed['HbA1c']}%"

                if "BP_systolic" in labs_parsed and "BP_diastolic" in labs_parsed and "Blood pressure" not in vital_signs:
                    vital_signs["Blood pressure"] = f"{labs_parsed['BP_systolic']}/{labs_parsed['BP_diastolic']} mmHg"

        # Normalize lists to "Not Provided" if empty
        if not history:
            history = ["Not Provided"]
        if not signs:
            signs = ["Not Provided"]
        if not examinations:
            examinations = ["Not Provided"]
        if not vital_signs:
            vital_signs = {"Blood pressure": "Not Provided"}
        if not lab_values:
            lab_values = {"Not Provided": "Not Provided"}
        if not extra_summary or extra_summary == "":
            extra_summary = "Not Provided"

        # Write the patient info section exactly as user requested
        md_lines.append("## Patient Information")
        md_lines.append(f"*   **Age:** {age}")
        md_lines.append(f"*   **Sex:** {sex}")
        md_lines.append("")
        md_lines.append("## History")
        for h in history:
            md_lines.append(f"*   {h}")
        md_lines.append("")
        md_lines.append("## Presenting Complaint")
        md_lines.append(presenting_complaint)
        md_lines.append("")
        md_lines.append("## Signs and Symptoms")
        for s in signs:
            md_lines.append(f"*   {s}")
        md_lines.append("")
        md_lines.append("## Examinations Before Checkup")
        for ex in examinations:
            md_lines.append(f"*   {ex}")
        md_lines.append("")
        md_lines.append("## Vital Signs")
        for k, v in vital_signs.items():
            md_lines.append(f"*   **{k}:** {v}")
        md_lines.append("")
        md_lines.append("## Laboratory Values")
        for k, v in lab_values.items():
            md_lines.append(f"*   **{k}:** {v}")
        md_lines.append("")
        md_lines.append("## Extra Summary")
        md_lines.append(extra_summary)
        md_lines.append("")

        # Preliminary Diagnoses — use self.state['prelim_report']
        md_lines.append("## Preliminary Diagnoses")
        prelim_entries = []
        if isinstance(prelim, dict):
            prelim_entries = prelim.get("entries", []) or []
        elif isinstance(prelim, list):
            prelim_entries = prelim

        if prelim_entries:
            for idx, e in enumerate(prelim_entries, start=1):
                name = e.get("preliminary_diagnosis", str(e)) if isinstance(e, dict) else str(e)
                reasoning = e.get("reasoning", "Not Provided") if isinstance(e, dict) else "Not Provided"
                recs = e.get("recommendations", []) if isinstance(e, dict) else []
                md_lines.append(f"### {idx}. {name}")
                md_lines.append(f"*   **Reasoning:** {reasoning}")
                md_lines.append(f"*   **Recommendations:**")
                if recs:
                    for r in recs:
                        md_lines.append(f"    *   {r}")
                else:
                    md_lines.append("    *   Not Provided")
                md_lines.append("")  # blank line after each diagnosis
        else:
            md_lines.append("Not Provided")
            md_lines.append("")

        # Optionally include best practices (if present)
        if best_pracs:
            md_lines.append("## Best Practices & References")
            for bp in best_pracs:
                targ = bp.get("best_practices_for", "<unknown>")
                md_lines.append(f"### For: {targ}")
                practices = bp.get("practices", []) or []
                if practices:
                    for p in practices:
                        title = p.get("title", "Guideline")
                        url = p.get("url", "")
                        summary = p.get("summary", "")
                        md_lines.append(f"* **{title}** — {summary} {'— ' + url if url else ''}")
                else:
                    md_lines.append("- No best-practice content found.")
                md_lines.append("")
        # Red flags detection
        red_flags = []
        labs_for_flags = parse_lab_values_from_postner(post_ner)
        if labs_for_flags.get("RBS") and labs_for_flags.get("RBS") >= 400:
            red_flags.append("Severely elevated blood glucose (RBS >= 400 mg/dl). Consider urgent escalation.")
        if labs_for_flags.get("BP_systolic") and labs_for_flags.get("BP_systolic") >= 180:
            red_flags.append("Hypertensive emergency-level systolic BP >= 180 mmHg. Consider urgent escalation.")
        if red_flags:
            md_lines.append("## Red flags")
            for rf in red_flags:
                md_lines.append(f"*   {rf}")
            md_lines.append("")

        md_lines.append("*This is an automated preliminary report. Human clinician review is REQUIRED before any clinical action.*")
        md_lines.append("")

        final_md = "\n".join(md_lines)
        self.state["final_report_md"] = final_md
        return final_md


# ============================================================
# Pipeline runner utilities
# ============================================================
def _run_kickoff_and_collect(pipeline_instance):
    try:
        kickoff_result = pipeline_instance.kickoff()
    except Exception as e:
        return {"_error": f"kickoff call failed: {e}"}

    if asyncio.iscoroutine(kickoff_result):
        try:
            new_loop = asyncio.new_event_loop()
            try:
                asyncio.set_event_loop(new_loop)
                result = new_loop.run_until_complete(kickoff_result)
            finally:
                try:
                    new_loop.run_until_complete(new_loop.shutdown_asyncgens())
                except Exception:
                    pass
                new_loop.close()
                asyncio.set_event_loop(None)
        except Exception as e:
            return {"_error": f"running kickoff coroutine failed: {e}"}
    else:
        result = kickoff_result

    try:
        state = getattr(pipeline_instance, "state", {}) or {}
        out = state.get("final_report_md") or state.get("report") or state.get("prelim_report") or result
        try:
            out = normalize(out)
        except Exception:
            pass
        return out
    except Exception as e:
        return {"_error": f"collecting pipeline output failed: {e}"}


def run_pipeline_sync(sample_text: str, tavily_api: str):
    pipeline = CdssPipeline(sample_text=sample_text, tavily_api=tavily_api)
    return _run_kickoff_and_collect(pipeline)


# ============================================================
# CLI runner (only when executing this file directly)
# ============================================================
if __name__ == "__main__":
    sample_text = """"42-year-old male presenting with a history of type 2 diabetes diagnosed 10 years ago.
    Current Complaint are Complains of polyuria, polydipsia, blurred vision, and fatigue for the past 2 weeks.
    Physical Examination revealed Blood pressure 140/90 mmHg. Fundoscopic examination reveals microaneurysms and cotton wool spots.
    Rest of the examination is unremarkable.
    Investigations reported Random blood sugar 350 mg/dl, HbA1c 10.5%.
    Intravenous fluids, insulin infusion, and electrolyte replacement initiated."""      

    flow = CdssPipeline(sample_text=sample_text, tavily_api=os.getenv("TAVILY_API_KEY", ""))
    try:
        flow.plot("project_flow")
    except Exception:
        pass

    kickoff_result = flow.kickoff()
    if asyncio.iscoroutine(kickoff_result):
        asyncio.run(kickoff_result)

    final_state = getattr(flow, "state", {}) or {}
    final_out = final_state.get("final_report_md") or final_state.get("report") or final_state.get("prelim_report") or kickoff_result
    try:
        print(normalize(final_out) if not isinstance(final_out, str) else final_out)
    except Exception:
        print(str(final_out))
