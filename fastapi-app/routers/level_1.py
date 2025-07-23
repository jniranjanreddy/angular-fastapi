from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
import os
import sys

# Add parent directory to path to access logs folder
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

level1 = APIRouter()

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

@level1.get("/level1") # path parameter
def get_level1(patient_ids_request: Optional[str] = None): 
    try:
        if patient_ids_request is None:
            raise Exception("No patient IDs provided")
        
        # Read log data for the patient
        log_data = read_level1_logs(patient_ids_request)
        
        return {
            "level": 1, 
            "status": 1, 
            "message": "success", 
            "result": patient_ids_request,
            "logs": log_data,
            "log_count": len(log_data)
        }
    except Exception as e:
        return {
            "level": 1, 
            "status": 0, 
            "message": "failed", 
            "result": f"error occured: {str(e)}",
            "logs": [],
            "log_count": 0
        }

