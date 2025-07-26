from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
import os
import sys

# Add parent directory to path to access logs folder
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

# Import the trigger_l1 functions
from diagnostics.execution_scripts.trigger_l1 import set_patient_ids, execute_l1_diagnostics

level1 = APIRouter()

class PatientIDsRequest(BaseModel):
    patient_ids: List[str]

def read_level1_logs(patient_id: str = None) -> List[str]:
    """Read level1.log file and optionally filter by patient ID"""
    try:
        log_file_path = os.path.join(os.path.dirname(__file__), '..', '..', 'logs', 'level1.log')
        
        if not os.path.exists(log_file_path):
            return []
        
        with open(log_file_path, 'r', encoding='utf-8') as file:
            lines = file.readlines()
            # Remove trailing whitespace and empty lines
            content = [line.strip() for line in lines if line.strip()]
            
            # Filter by patient ID if provided
            if patient_id:
                content = [line for line in content if patient_id in line]
            
            return content
    except Exception as e:
        print(f"Error reading level1.log: {str(e)}")
        return []

# @level1.get("/level1") # path parameter
# def get_level1(patient_ids_request: Optional[str] = None): 
#     try:
#         if patient_ids_request is None:
#             raise Exception("No patient IDs provided")
        
#         # Read log data for the patient
#         log_data = read_level1_logs(patient_ids_request)
        
        
#         return {
#             "level": 1, 
#             "status": 1, 
#             "message": "success", 
#             "result": patient_ids_request,
#             "logs": log_data,
#             "log_count": len(log_data)
#         }
#     except Exception as e:
#         return {
#             "level": 1, 
#             "status": 0, 
#             "message": "failed", 
#             "result": f"error occured: {str(e)}",
#             "logs": [],
#             "log_count": 0
#         }

@level1.post("/level1")

def trigger_l1_diagnostics(request: PatientIDsRequest):
    """Trigger L1 diagnostics for the provided patient IDs"""
    try:
        if not request.patient_ids:
            raise HTTPException(status_code=400, detail="No patient IDs provided")
        print(f"request.patient_ids: {request.patient_ids}")
        
        # Validate patient IDs
        for patient_id in request.patient_ids:
            if not patient_id or patient_id is None:
                raise HTTPException(status_code=400, detail=f"Invalid patient ID: {patient_id}")
        
        # Set the patient IDs in the global variable
        set_patient_ids(request.patient_ids)
        print(f"patient_ids set: {request.patient_ids}")
        
        # Execute L1 diagnostics
        success = execute_l1_diagnostics()
        
        if success:
            return {
                "level": 1,
                "status": 1,
                "message": "L1 diagnostics triggered successfully",
                "result": f"Processed {len(request.patient_ids)} patient(s)",
                "patient_ids": request.patient_ids
            }
        else:
            return {
                "level": 1,
                "status": 0,
                "message": "L1 diagnostics failed",
                "result": "No patient IDs provided",
                "patient_ids": []
            }
            
    except Exception as e:
        print(f"[ERROR] Exception in trigger_l1_diagnostics: {str(e)}")
        import traceback
        traceback.print_exc()
        return {
            "level": 1,
            "status": 0,
            "message": "failed",
            "result": f"error occurred: {str(e)}",
            "patient_ids": []
        }

