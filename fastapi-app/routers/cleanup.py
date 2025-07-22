from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

cleanup = APIRouter()



@cleanup.get("/cleanup")
def get_cleanup(patient_ids_request: str):
    return {"Cleanup": "API", "patient_ids": patient_ids_request}