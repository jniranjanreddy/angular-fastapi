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
        print(f"patient_ids set-1:-----------------------\n {request.patient_ids}") ##########################
        set_patient_ids(request.patient_ids)
        print(f"patient_ids set: {request.patient_ids}")
        print(f"patient_ids set-2:-----------------------------\n {request.patient_ids}") ##########################
        
        # Execute L1 diagnostics
        success = execute_l1_diagnostics()
        
        # Get log files for the patient IDs
        log_files = get_log_files_for_patients(request.patient_ids)
        
        if success:
            return {
                "level": 1,
                "status": 1,
                "message": "L1 diagnostics triggered successfully",
                "result": f"Processed {len(request.patient_ids)} patient(s)",
                "patient_ids": request.patient_ids,
                "log_files": log_files
            }
        else:
            return {
                "level": 1,
                "status": 0,
                "message": "L1 diagnostics failed",
                "result": "No patient IDs provided",
                "patient_ids": [],
                "log_files": log_files
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
            "patient_ids": [],
            "log_files": []
        }

def get_log_files_for_patients(patient_ids: List[str]) -> List[dict]:
    """Get all log files for the given patient IDs from L1-run-logs/logs/"""
    log_files = []
    
    try:
        # Path to L1-run-logs/logs directory
        logs_base_path = os.path.join(os.path.dirname(__file__), '..', 'L1-run-logs', 'logs')
        
        if not os.path.exists(logs_base_path):
            print(f"Logs directory not found: {logs_base_path}")
            return log_files
        
        # Iterate through all date directories
        for date_dir in os.listdir(logs_base_path):
            date_path = os.path.join(logs_base_path, date_dir)
            
            if os.path.isdir(date_path):
                # Look for log files containing any of the patient IDs
                for filename in os.listdir(date_path):
                    if filename.endswith('.log'):
                        # Check if any patient ID is in the filename
                        for patient_id in patient_ids:
                            if patient_id in filename:
                                file_path = os.path.join(date_path, filename)
                                file_size = os.path.getsize(file_path)
                                
                                log_files.append({
                                    "filename": filename,
                                    "date": date_dir,
                                    "patient_id": patient_id,
                                    "file_path": file_path,
                                    "file_size": file_size,
                                    "full_path": os.path.join(date_dir, filename)
                                })
                                break  # Found this patient ID, move to next file
        
        # Sort by date (newest first) and then by filename
        log_files.sort(key=lambda x: (x["date"], x["filename"]), reverse=True)
        
    except Exception as e:
        print(f"Error getting log files: {str(e)}")
    
    return log_files

@level1.get("/log-file/{date}/{filename}")
def read_log_file(date: str, filename: str):
    """Read the content of a specific log file"""
    try:
        # Construct the file path
        file_path = os.path.join(os.path.dirname(__file__), '..', 'L1-run-logs', 'logs', date, filename)
        
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="Log file not found")
        
        # Read the file content
        with open(file_path, 'r', encoding='utf-8') as file:
            content = file.read()
        
        return {
            "filename": filename,
            "date": date,
            "content": content,
            "file_size": os.path.getsize(file_path)
        }
        
    except Exception as e:
        print(f"Error reading log file: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error reading log file: {str(e)}")

