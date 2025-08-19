from fastapi import APIRouter, HTTPException, Query
import os
from datetime import datetime, timezone
from dotenv import load_dotenv
from pymongo import MongoClient
from typing import Optional, List, Dict, Any
import logging
import json
from bson import ObjectId

# Load environment variables
load_dotenv(override=True)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create router
router = APIRouter()

# JSON Encoder for MongoDB ObjectIds
class JSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, ObjectId):
            return str(obj)
        if isinstance(obj, datetime):
            return obj.isoformat()
        return super().default(obj)

# MongoDB connection
def get_mongodb_connection():
    """Get MongoDB connection using DB_CONN from environment variables"""
    try:
        db_conn = os.getenv("DB_CONN")
        if not db_conn:
            raise HTTPException(status_code=500, detail="DB_CONN environment variable not found")
        
        client = MongoClient(db_conn)
        # Test the connection
        client.admin.command('ping')
        logger.info("Successfully connected to MongoDB")
        return client
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to connect to database: {str(e)}")

@router.get("/appointments/search")
async def search_appointments_by_date(
    date: Optional[str] = Query(None, description="Date in YYYY-MM-DD format to filter appointments"),
    start_date: Optional[str] = Query(None, description="Start date in YYYY-MM-DD format for date range"),
    end_date: Optional[str] = Query(None, description="End date in YYYY-MM-DD format for date range"),
    skip: Optional[int] = Query(0, description="Number of documents to skip"),
    limit: Optional[int] = Query(10, description="Number of documents to return")
):
    """
    Search appointments by date in the created_dt field.
    Returns count of matched appointments and list of rx_patient_id values.
    
    Parameters:
    - date: Specific date to search (YYYY-MM-DD)
    - start_date: Start date for range search (YYYY-MM-DD) 
    - end_date: End date for range search (YYYY-MM-DD)
    
    If only 'date' is provided, it searches for appointments created on that specific date.
    If 'start_date' and 'end_date' are provided, it searches within that date range.
    """
    try:
        # Get MongoDB connection
        client = get_mongodb_connection()
        db = client.rxcdm_fhir
        collection = db.appointments
        
        # Build the query filter
        query_filter = {}
        
        if date and not start_date and not end_date:
            # Search for specific date
            try:
                search_date = datetime.strptime(date, "%Y-%m-%d")
                # Create date range for the entire day
                start_of_day = search_date.replace(hour=0, minute=0, second=0, microsecond=0)
                end_of_day = search_date.replace(hour=23, minute=59, second=59, microsecond=999999)
                
                query_filter["created_dt"] = {
                    "$gte": start_of_day,
                    "$lte": end_of_day
                }
                logger.info(f"Searching for appointments on date: {date}")
                
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
                
        elif start_date and end_date:
            # Search for date range
            try:
                start_dt = datetime.strptime(start_date, "%Y-%m-%d")
                end_dt = datetime.strptime(end_date, "%Y-%m-%d")
                
                # Set time to beginning and end of days
                start_dt = start_dt.replace(hour=0, minute=0, second=0, microsecond=0)
                end_dt = end_dt.replace(hour=23, minute=59, second=59, microsecond=999999)
                
                if start_dt > end_dt:
                    raise HTTPException(status_code=400, detail="Start date must be before or equal to end date")
                
                query_filter["created_dt"] = {
                    "$gte": start_dt,
                    "$lte": end_dt
                }
                logger.info(f"Searching for appointments between {start_date} and {end_date}")
                
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
                
        elif start_date or end_date:
            raise HTTPException(status_code=400, detail="Both start_date and end_date must be provided for range search")
        else:
            raise HTTPException(status_code=400, detail="Please provide either 'date' for specific date search or both 'start_date' and 'end_date' for range search")
        
                # Execute the query
        logger.info(f"Executing query with filter: {query_filter}")
        
        # Get total appointments count first
        total_appointments = collection.count_documents({})
        
        # Get matching documents
        cursor = collection.find(query_filter, {"rx_patient_id": 1, "created_dt": 1, "_id": 1}).skip(skip).limit(limit)
        cursor2 = collection.find(query_filter, {"rx_patient_id": 1, "created_dt": 1, "_id": 1})

        results = list(cursor)
        
        # Extract rx_patient_id values and prepare fetched appointments with ObjectId encoding
        rx_patient_ids = []
        fetched_appointments = []
        
        for doc in results:
            # Convert ObjectId to string for JSON serialization
            doc_serializable = json.loads(json.dumps(doc, cls=JSONEncoder))
            fetched_appointments.append(doc_serializable)
            
            if "rx_patient_id" in doc and doc["rx_patient_id"]:
                rx_patient_ids.append(doc["rx_patient_id"])
        
        # Get count of filtered results
        filtered_count = len(results)
        total_count = len(list(cursor2))
        # Close the connection
        client.close()
        
        logger.info(f"Found {filtered_count} appointments matching the criteria out of {total_appointments} total")
        
        return {
            "status": 1,
            "message": "success",
            "Total_Appointments": total_count,
            "filtered_appointments": filtered_count,
            "fetched_appointments": fetched_appointments
        }
        
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        logger.error(f"Error searching appointments: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/appointments/stats")
async def get_appointments_stats():
    """
    Get basic statistics about the appointments collection.
    """
    try:
        # Get MongoDB connection
        client = get_mongodb_connection()
        db = client.rxcdm_fhir
        collection = db.appointments
        
        # Get total count
        total_count = collection.count_documents({})
        
        # Get count of documents with rx_patient_id
        with_rx_patient_id = collection.count_documents({"rx_patient_id": {"$exists": True, "$ne": None}})
        
        # Get count of documents with created_dt
        with_created_dt = collection.count_documents({"created_dt": {"$exists": True, "$ne": None}})
        
        # Get date range
        date_range = {}
        try:
            oldest = collection.find({"created_dt": {"$exists": True}}).sort("created_dt", 1).limit(1)
            newest = collection.find({"created_dt": {"$exists": True}}).sort("created_dt", -1).limit(1)
            
            oldest_doc = list(oldest)
            newest_doc = list(newest)
            
            if oldest_doc:
                date_range["oldest_appointment"] = oldest_doc[0]["created_dt"].isoformat()
            if newest_doc:
                date_range["newest_appointment"] = newest_doc[0]["created_dt"].isoformat()
        except Exception as e:
            logger.warning(f"Could not get date range: {str(e)}")
        
        # Close the connection
        client.close()
        
        return {
            "status": 1,
            "message": "success", 
            "stats": {
                "total_appointments": total_count,
                "appointments_with_rx_patient_id": with_rx_patient_id,
                "appointments_with_created_dt": with_created_dt,
                "date_range": date_range
            },
            "database": "rxcdm_fhir",
            "collection": "appointments"
        }
        
    except Exception as e:
        logger.error(f"Error getting appointment stats: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")