import React, { useState } from "react";
import { Button, View, Text, StyleSheet, Alert, Platform } from "react-native";
import * as FileSystem from "expo-file-system";
import { Audio } from "expo-av";
import axios from "axios";

const AudioRecorder: React.FC = () => {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordedUri, setRecordedUri] = useState<string | null>(null);

  // Start recording
  const startRecording = async () => {
    try {
      // Request permissions
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Start recording
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);
      console.log("Recording started");
    } catch (error) {
      console.error("Failed to start recording:", error);
    }
  };

  // Stop recording
  const stopRecording = async () => {
    try {
      if (recording) {
        await recording.stopAndUnloadAsync();
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
        });

        // Get the recorded URI
        const uri = recording.getURI();
        setRecordedUri(uri);
        setIsRecording(false);
        setRecording(null);
        console.log("Recording stopped and stored at:", uri);
      }
    } catch (error) {
      console.error("Failed to stop recording:", error);
    }
  };

  // Play the recorded audio
  const playRecording = async () => {
    if (recordedUri) {
      const { sound } = await Audio.Sound.createAsync(
        { uri: recordedUri },
        { shouldPlay: true }
      );
      await sound.playAsync();
      console.log("Playing recording");
    }
  };

  // Replace with your machine's IP address
  const backendUrl = "http://192.168.222.1:8000/upload";

  const sendAudioToBackend = async (uri: string): Promise<void> => {
    const formData = new FormData();

    if (Platform.OS === "web") {
      // For web, fetch the file as a blob and append it to FormData
      const response = await fetch(uri);
      const blob = await response.blob();
      formData.append("file", blob, "recording.m4a");
    } else {
      // For mobile, read the file and append it to FormData
      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (!fileInfo.exists) {
        Alert.alert("Error", "File does not exist");
        return;
      }

      const fileType = "audio/m4a"; // Adjust based on the file type
      formData.append("file", {
        uri,
        name: "recording.m4a",
        type: fileType,
      } as any); // Use `as any` to bypass TypeScript errors
    }

    try {
      const response = await axios.post(backendUrl, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Success:", response.data);
      Alert.alert("Success", "File uploaded successfully");
    } catch (error) {
      console.error("Error uploading file:", error);
      Alert.alert("Error", "Failed to upload file");
    }
  };

  // Handle upload
  const handleUpload = async (uri: string | null) => {
    if (!uri) {
      Alert.alert("Error", "No recording available to upload");
      return;
    }
    await sendAudioToBackend(uri);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Audio Recorder</Text>
      <Button
        title={isRecording ? "Stop Recording" : "Start Recording"}
        onPress={isRecording ? stopRecording : startRecording}
      />
      {recordedUri && <Button title="Play Recording" onPress={playRecording} />}
      {recordedUri && (
        <Text style={styles.uriText}>Recorded URI: {recordedUri}</Text>
      )}
      <Button title="Upload Audio" onPress={() => handleUpload(recordedUri)} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  uriText: {
    marginTop: 20,
    color: "blue",
  },
});

export default AudioRecorder;
