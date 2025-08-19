# main.py
import os
import sys
from fastapi.middleware.cors import CORSMiddleware

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))



from fastapi import FastAPI, HTTPException
# from utils import load_patient_ids
from routers.level_1 import level1
from routers.level_3 import level3
from routers.cleanup import cleanup
from routers.appointments_search import router as appointments_router


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],  # Angular runs on 4200
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(level1, tags=["level0"], prefix="/level1")
app.include_router(level3, tags=["level1"], prefix="/level3")
app.include_router(cleanup, tags=["cleanup"], prefix="/cleanup")
app.include_router(appointments_router, tags=["appointments"], prefix="/api")



if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001, log_level="info")