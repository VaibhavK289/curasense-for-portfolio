import os
from dotenv import load_dotenv
import yaml
from crewai import Agent, Task, Crew, LLM
from src.output_pydantic import NERValidationOutput, PreliminaryDiagnosisListOutput

load_dotenv()

# ===========================================
# SAFE GEMINI-ONLY LLM INITIALIZATION
# ===========================================

GOOGLE_KEY = os.getenv("GOOGLE_API_KEY")

llm = None
provider_status = "none"

try:
    if GOOGLE_KEY:
        llm = LLM(
            api_key=GOOGLE_KEY,
            model="gemini/gemini-2.5-flash",
        )
        provider_status = "google/gemini"
    else:
        print("⚠️ GOOGLE_API_KEY not found. LLM disabled. Agents will use rule-based fallback logic.")
except Exception as e:
    print("⚠️ Failed to initialize Gemini LLM:", repr(e))
    llm = None
    provider_status = "error"

print(f"[agents_and_taks] Active LLM provider: {provider_status}")


# ===========================================
# ROBUST YAML LOADER TO FIX UNICODE ERRORS
# ===========================================

def safe_load_yaml_file(path):
    """Load YAML safely while avoiding Windows cp1252 Unicode errors."""
    
    for enc in ("utf-8", "utf-8-sig", "cp1252"):
        try:
            with open(path, "r", encoding=enc) as f:
                text = f.read()
            return yaml.safe_load(text)
        except UnicodeDecodeError:
            continue
        except Exception as e:
            print(f"⚠️ YAML load error for {path} using {enc}: {e}")

    # Last fallback: binary read with replacement
    try:
        with open(path, "rb") as f:
            raw = f.read()
        text = raw.decode("utf-8", errors="replace")
        return yaml.safe_load(text)
    except Exception as e:
        raise RuntimeError(f"Failed to load YAML '{path}' after all fallback methods.") from e


# ===========================================
# LOAD YAML CONFIG FILES (SAFE)
# ===========================================

files = {
    "agents": "crew/config/agents.yaml",
    "tasks": "crew/config/tasks.yaml"
}

configs = {}

for config_type, file_path in files.items():
    configs[config_type] = safe_load_yaml_file(file_path)


# ===========================================
# AGENT CONFIGS
# ===========================================

ner_validaton_agent_config = configs["agents"]["ner_validaton_agent"]
preliminary_diagnosis_agent_config = configs["agents"]["preliminary_diagnose_agent"]
report_writer_agent_config = configs["agents"]["report_writer_agent"]


# ===========================================
# TASK CONFIGS
# ===========================================

ner_validaton_task_config = configs["tasks"]["ner_validaton_task"]
preliminary_diagnose_task_config = configs["tasks"]["preliminary_diagnose_task"]
report_writing_task_config = configs["tasks"]["report_writing_task"]


# ===========================================
# DEFINE AGENTS
# ===========================================

ner_validation_agent = Agent(
    config=ner_validaton_agent_config,
    llm=llm
)

preliminary_diagnosis_agent = Agent(
    config=preliminary_diagnosis_agent_config,
    llm=llm
)

report_writer_agent = Agent(
    config=report_writer_agent_config,
    llm=llm,
)


# ===========================================
# DEFINE TASKS
# ===========================================

ner_validation_task = Task(
    config=ner_validaton_task_config,
    agent=ner_validation_agent,
    output_pydantic=NERValidationOutput
)

preliminary_diagnosis_task = Task(
    config=preliminary_diagnose_task_config,
    agent=preliminary_diagnosis_agent,
    output_pydantic=PreliminaryDiagnosisListOutput,
)

report_writing_task = Task(
    config=report_writing_task_config,
    agent=report_writer_agent,
    output_file="report.md"
)


# ===========================================
# DEFINE CREWS
# ===========================================

ner_validation_crew = Crew(
    agents=[ner_validation_agent],
    tasks=[ner_validation_task],
    verbose=True
)

prelim_diag_crew = Crew(
    agents=[preliminary_diagnosis_agent],
    tasks=[preliminary_diagnosis_task],
    verbose=True
)

report_writing_crew = Crew(
    agents=[report_writer_agent],
    tasks=[report_writing_task],
    verbose=True
)
