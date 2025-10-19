"""
Itinerary generation API routes.
"""
import time
from typing import List
from fastapi import APIRouter, HTTPException

from ..models import ItineraryRequest, BatchRequest, ItineraryResponse
from ..services.openai_service import call_openai_function

router = APIRouter()

@router.post("/generate-itinerary", response_model=ItineraryResponse)
def generate_itinerary_api(req: ItineraryRequest):
    """
    Generate a single travel itinerary.
    
    Args:
        req: Itinerary request containing prompt, destination, and days
        
    Returns:
        ItineraryResponse with the generated result or error
    """
    try:
        result = call_openai_function(req.prompt, req.destination, req.days)
        return ItineraryResponse(destination=req.destination, result=result.dict())
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/batch-itinerary", response_model=List[ItineraryResponse])
def batch_itinerary_api(batch: BatchRequest):
    """
    Generate multiple travel itineraries in batch.
    
    Args:
        batch: Batch request containing multiple itinerary requests
        
    Returns:
        List of ItineraryResponse objects
    """
    results = []
    for input_data in batch.inputs:
        try:
            res = call_openai_function(input_data.prompt, input_data.destination, input_data.days)
            results.append(ItineraryResponse(destination=input_data.destination, result=res.dict()))
            time.sleep(1)  # Giảm tần suất gọi API để tránh rate limit
        except Exception as e:
            results.append(ItineraryResponse(destination=input_data.destination, error=str(e)))
    return results