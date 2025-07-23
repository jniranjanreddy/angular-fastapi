from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

cleanup = APIRouter()



@cleanup.get("/cleanup")
def get_cleanup(patient_ids_request: str):
    try:
        if patient_ids_request is None:
            raise Exception("No patient IDs provided")
        return {"level": "cleanup", "status": 1, "message": "success", "result": patient_ids_request}
    except Exception as e:
        return {"level": "cleanup", "status": 0, "message": "failed", "result": f"error occured: {str(e)}"}
