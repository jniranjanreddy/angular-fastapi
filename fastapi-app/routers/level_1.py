from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

level1 = APIRouter()



@level1.get("/level1")
def get_level1(patient_ids_request: str):
    return {"patient_ids": patient_ids_request}