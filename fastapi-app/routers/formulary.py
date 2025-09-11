from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, List
import json
import os
from datetime import datetime
import logging

router = APIRouter(prefix="/formulary", tags=["formulary"])

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class FormularyRequest(BaseModel):
    patient_id: str
    drug_name: Optional[str] = None
    ndc_code: Optional[str] = None
    environment: str

class FormularyResponse(BaseModel):
    status: str
    message: str
    patient_id: str
    drug_info: Optional[dict] = None
    coverage_details: Optional[dict] = None
    timestamp: str

class FormularySearchRequest(BaseModel):
    search_term: str
    search_type: str  # "drug_name", "ndc_code", "patient_id"
    environment: str

# Sample formulary data for demonstration
SAMPLE_FORMULARY_DATA = {
    "12345": {
        "patient_id": "12345",
        "formulary_drugs": [
            {
                "drug_name": "Metformin",
                "ndc_code": "0093-1074-01",
                "tier": "Tier 1",
                "copay": "$10",
                "coverage_status": "Covered",
                "prior_auth_required": False
            },
            {
                "drug_name": "Lisinopril",
                "ndc_code": "0071-0222-23",
                "tier": "Tier 1", 
                "copay": "$10",
                "coverage_status": "Covered",
                "prior_auth_required": False
            }
        ]
    },
    "67890": {
        "patient_id": "67890",
        "formulary_drugs": [
            {
                "drug_name": "Atorvastatin",
                "ndc_code": "0071-0156-23",
                "tier": "Tier 2",
                "copay": "$25",
                "coverage_status": "Covered",
                "prior_auth_required": True
            }
        ]
    }
}

@router.post("/check-coverage", response_model=FormularyResponse)
async def check_drug_coverage(request: FormularyRequest):
    """Check drug coverage for a patient"""
    try:
        logger.info(f"Checking formulary coverage for patient: {request.patient_id} in environment: {request.environment}")
        
        # Simulate formulary lookup
        patient_data = SAMPLE_FORMULARY_DATA.get(request.patient_id)
        
        if not patient_data:
            return FormularyResponse(
                status="not_found",
                message=f"No formulary data found for patient {request.patient_id}",
                patient_id=request.patient_id,
                timestamp=datetime.now().isoformat()
            )
        
        # If specific drug requested, find it
        if request.drug_name or request.ndc_code:
            for drug in patient_data["formulary_drugs"]:
                if (request.drug_name and drug["drug_name"].lower() == request.drug_name.lower()) or \
                   (request.ndc_code and drug["ndc_code"] == request.ndc_code):
                    return FormularyResponse(
                        status="found",
                        message="Drug coverage found",
                        patient_id=request.patient_id,
                        drug_info=drug,
                        coverage_details={
                            "total_drugs": len(patient_data["formulary_drugs"]),
                            "covered_drugs": len([d for d in patient_data["formulary_drugs"] if d["coverage_status"] == "Covered"])
                        },
                        timestamp=datetime.now().isoformat()
                    )
            
            return FormularyResponse(
                status="not_covered",
                message=f"Drug not found in formulary for patient {request.patient_id}",
                patient_id=request.patient_id,
                timestamp=datetime.now().isoformat()
            )
        
        # Return all formulary data for patient
        return FormularyResponse(
            status="success",
            message="Formulary data retrieved successfully",
            patient_id=request.patient_id,
            coverage_details={
                "formulary_drugs": patient_data["formulary_drugs"],
                "total_drugs": len(patient_data["formulary_drugs"]),
                "covered_drugs": len([d for d in patient_data["formulary_drugs"] if d["coverage_status"] == "Covered"])
            },
            timestamp=datetime.now().isoformat()
        )
        
    except Exception as e:
        logger.error(f"Error checking formulary coverage: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.post("/search", response_model=List[dict])
async def search_formulary(request: FormularySearchRequest):
    """Search formulary database"""
    try:
        logger.info(f"Searching formulary: {request.search_term} ({request.search_type}) in environment: {request.environment}")
        
        results = []
        
        for patient_id, patient_data in SAMPLE_FORMULARY_DATA.items():
            for drug in patient_data["formulary_drugs"]:
                if request.search_type == "drug_name" and request.search_term.lower() in drug["drug_name"].lower():
                    results.append({
                        "patient_id": patient_id,
                        "drug_info": drug,
                        "match_type": "drug_name"
                    })
                elif request.search_type == "ndc_code" and request.search_term in drug["ndc_code"]:
                    results.append({
                        "patient_id": patient_id,
                        "drug_info": drug,
                        "match_type": "ndc_code"
                    })
                elif request.search_type == "patient_id" and request.search_term in patient_id:
                    results.append({
                        "patient_id": patient_id,
                        "drug_info": drug,
                        "match_type": "patient_id"
                    })
        
        return results
        
    except Exception as e:
        logger.error(f"Error searching formulary: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Search error: {str(e)}")

@router.get("/health")
async def formulary_health_check():
    """Health check endpoint for formulary service"""
    return {
        "status": "healthy",
        "service": "formulary",
        "timestamp": datetime.now().isoformat(),
        "total_patients": len(SAMPLE_FORMULARY_DATA)
    }

@router.get("/drugs/popular")
async def get_popular_drugs():
    """Get list of popular drugs in formulary"""
    popular_drugs = [
        {"name": "Metformin", "category": "Diabetes", "tier": "Tier 1"},
        {"name": "Lisinopril", "category": "Hypertension", "tier": "Tier 1"},
        {"name": "Atorvastatin", "category": "Cholesterol", "tier": "Tier 2"},
        {"name": "Amlodipine", "category": "Hypertension", "tier": "Tier 1"},
        {"name": "Omeprazole", "category": "Gastric", "tier": "Tier 1"}
    ]
    
    return {
        "status": "success",
        "drugs": popular_drugs,
        "total": len(popular_drugs),
        "timestamp": datetime.now().isoformat()
    }
