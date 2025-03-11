import whisper
model = whisper.load_model("base")

# Transcribe the audio file
result = model.transcribe("backend/uploads/recording.m4a")  # Replace with your file name
print(result["text"])