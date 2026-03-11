from pydantic import BaseModel, Field, field_validator
from typing import List, Optional


class Medicine(BaseModel):
    name: str
    dosage_mg: Optional[float] = None
    price: Optional[float] = None
    composition: Optional[List[str]] = None
    uses: Optional[List[str]] = None
    side_effects: Optional[List[str]] = None
    warnings: Optional[List[str]] = None
    contraindications: Optional[List[str]] = None
    manufacturer: Optional[str] = None
    source_urls: Optional[List[str]] = None

    # 🔥 Convert any None list → []
    @field_validator(
        "composition",
        "uses",
        "side_effects",
        "warnings",
        "contraindications",
        "source_urls",
        mode="before"
    )
    @classmethod
    def convert_none_to_list(cls, v):
        if v is None:
            return []
        return v
