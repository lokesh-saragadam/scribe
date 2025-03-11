from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI()

origins = [
    "http://localhost:8082",  
    "exp://192.168.52.146:8082",
]

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Allow all origins (replace "*" with your React Native app's origin in production)
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
    allow_credentials=True,
)

# Endpoint to handle file upload
@app.post("/upload")
async def upload_audio(file: UploadFile = File(...)):
    try:
        # Ensure the uploads directory exists
        os.makedirs("uploads", exist_ok=True)

        # Save the uploaded file
        file_path = os.path.join("uploads", file.filename)
        with open(file_path, "wb") as buffer:
            buffer.write(await file.read())

        # Preprocess the audio file (add your logic here)
        preprocess_audio(file_path)

        return {"message": "File uploaded and preprocessed successfully", "file_path": file_path}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload file: {str(e)}")

# Preprocess the audio file (example function)
def preprocess_audio(file_path: str):
    # Add your preprocessing logic here
    print(f"Preprocessing file: {file_path}")
    # Example: Convert to WAV, extract features, etc.
