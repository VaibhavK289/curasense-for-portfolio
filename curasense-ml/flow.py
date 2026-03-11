import os
import json
from pydantic import BaseModel
from crewai import Flow
from crewai.flow.flow import listen, start, and_
from tavily import TavilyClient

from src.hugging_face_ner import process_ner_output, generate_clean_ner_report
from src.crew.agents_and_taks import ner_validation_crew, prelim_diag_crew, report_writing_crew


# ============================================================
# NORMALIZER: Fix CrewOutput, Pydantic, nested objects
# ============================================================

def normalize(val):
    """Convert ANY CrewOutput/Pydantic/nested objects → pure Python dict/list."""
    
    # primitives
    if val is None or isinstance(val, (str, int, float, bool)):
        return val

    # pydantic model
    if isinstance(val, BaseModel):
        return normalize(val.dict())

    # dict
    if isinstance(val, dict):
        return {k: normalize(v) for k, v in val.items()}

    # list/tuple
    if isinstance(val, (list, tuple)):
        return [normalize(x) for x in val]

    # CrewOutput-like
    if hasattr(val, "raw_output"):
        return normalize(val.raw_output)
    if hasattr(val, "output"):
        return normalize(val.output)

    # fallback to __dict__
    if hasattr(val, "__dict__"):
        try:
            return normalize(vars(val))
        except:
            pass

    # last fallback → string
    return str(val)



# ============================================================
# CuraSense Diagnosis Pipeline
# ============================================================

class CdssPipeline(Flow):

    def __init__(self, sample_text, tavily_api):
        super().__init__()
        self.sample_text = sample_text
        self.tavily_api = tavily_api


    # --------------------------------------------------------
    # 1. HuggingFace NER Extraction
    # --------------------------------------------------------
    @start()
    def initial_hugging_face_ner_report(self):

        tagged_tokens, unique_tags = process_ner_output(self.sample_text)
        report = generate_clean_ner_report(tagged_tokens, unique_tags)

        return {"report": report, "sample_text": self.sample_text}


    # --------------------------------------------------------
    # 2. NER Validation Crew
    # --------------------------------------------------------
    @listen(initial_hugging_face_ner_report)
    def ner_validation_method(self, report_dict):

        report = report_dict["report"]
        sample_text = report_dict["sample_text"]

        result = ner_validation_crew.kickoff(
            inputs={"input_text": sample_text, "ner_output": report}
        )

        parsed = normalize(result)

        self.state["post_ner_report"] = parsed
        return parsed


    # --------------------------------------------------------
    # 3. Preliminary Diagnosis Crew
    # --------------------------------------------------------
    @listen(ner_validation_method)
    def prelim_diag_method(self, post_ner_report):

        result = prelim_diag_crew.kickoff(
            inputs={"output_count": 3, "post_ner_report": normalize(post_ner_report)}
        )

        parsed = normalize(result)

        self.state["prelim_report"] = parsed
        return parsed


    # --------------------------------------------------------
    # 4. Extract diagnosis
    # --------------------------------------------------------
    @listen(prelim_diag_method)
    def extract_diagnosis_method(self, prelim_report):

        prelim_report = normalize(prelim_report)  # ensure safety

        entries = prelim_report.get("entries", [])
        diagnosis = []

        for entry in entries:
            if isinstance(entry, dict):
                diagnosis.append(entry.get("preliminary_diagnosis", "Unknown"))
            else:
                diagnosis.append(str(entry))

        return diagnosis


    # --------------------------------------------------------
    # 5. Best Practices via Tavily
    # --------------------------------------------------------
    @listen(extract_diagnosis_method)
    def best_practises(self, diagnosis):

        tavily_client = TavilyClient(api_key=self.tavily_api)
        best_practices_summary = []

        for entry in diagnosis:
            response = tavily_client.search(
                f"Best practices for {entry}",
                search_depth="advanced"
            )

            results = [
                {
                    "title": r["title"],
                    "url": r["url"],
                    "summary": r["content"],
                }
                for r in response["results"]
                if r["score"] > 0.5
            ]

            best_practices_summary.append({
                "best_practices_for": entry,
                "practices": results
            })

        self.state["best_practices_summary"] = best_practices_summary
        return best_practices_summary


    # --------------------------------------------------------
    # 6. Final Markdown Report Writer Crew
    # --------------------------------------------------------
    @listen(and_(ner_validation_method, prelim_diag_method, best_practises))
    def report_writing_method(self):

        result = report_writing_crew.kickoff(
            inputs={
                "post_ner_report": self.state["post_ner_report"],
                "prelim_diagnosis": self.state["prelim_report"],
                "best_pracs": self.state["best_practices_summary"]
            }
        )

        return normalize(result)



# ============================================================
# Example Case
# ============================================================
sample_text = """"42-year-old male presenting with a history of type 2 diabetes diagnosed 10 years ago.
Current Complaint are Complains of polyuria, polydipsia, blurred vision, and fatigue for the past 2 weeks.
Physical Examination revealed Blood pressure 140/90 mmHg. Fundoscopic examination reveals microaneurysms and cotton wool spots.
Rest of the examination is unremarkable.
Investigations reported Random blood sugar 350 mg/dl, HbA1c 10.5%.
Intravenous fluids, insulin infusion, and electrolyte replacement initiated."""      

# Only run this when the script is executed directly, not when imported
if __name__ == "__main__":
    flow = CdssPipeline(sample_text=sample_text, tavily_api=os.getenv("TAVILY_API_KEY"))
    flow.plot("project_flow")
    flow.kickoff()
