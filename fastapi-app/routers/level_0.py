from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional


level0 = APIRouter()

# @level0.get("/level0query") # Query parameter
# def get_level0(patient_ids_request: str): 
#     return {"patient_ids": patient_ids_request}



@level0.get("/level0") # path parameter
def get_level0(patient_ids_request: Optional[str] = None): 
    try:
        if patient_ids_request is None:
            raise Exception("No patient IDs provided")
        return {"level": 0, "status": 1, "message": "success", "result": patient_ids_request}
    except Exception as e:
        return {"level": 0, "status": 0, "message": "failed", "result": f"error occured: {str(e)}"}

