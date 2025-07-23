from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

level3 = APIRouter()



@level3.get("/level3")
def get_level3(patient_ids_request: str):
    try:
        if patient_ids_request is None:
            raise Exception("No patient IDs provided")
        return {"level": 3, "status": 1, "message": "success", "result": patient_ids_request}
    except Exception as e:
        return {"level": 3, "status": 0, "message": "failed", "result": f"error occured: {str(e)}"}

