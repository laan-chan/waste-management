import { useState, useRef } from "react";
import { useMutation, useQuery, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { 
  CameraIcon, 
  PhotoIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";

export default function Camera() {
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isClassifying, setIsClassifying] = useState(false);
  const [classification, setClassification] = useState<any>(null);
  const [weight, setWeight] = useState("");
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const generateUploadUrl = useMutation(api.waste.generateUploadUrl);
  const classifyWasteImage = useAction(api.ai.classifyWasteImage);
  const logWaste = useMutation(api.waste.logWaste);
  const loggedInUser = useQuery(api.auth.loggedInUser);
  
  const isChildMode = loggedInUser?.mode === "child";

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCapturing(true);
      }
    } catch (error) {
      toast.error(
        isChildMode 
          ? "Oops! Can't access camera. Ask an adult for help! 📷" 
          : "Unable to access camera. Please check permissions."
      );
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCapturing(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedImage(imageData);
        stopCamera();
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCapturedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const classifyImage = async () => {
    if (!capturedImage) return;
    
    setIsClassifying(true);
    try {
      // Convert base64 to blob
      const response = await fetch(capturedImage);
      const blob = await response.blob();
      
      // Upload to Convex storage
      const uploadUrl = await generateUploadUrl();
      const uploadResponse = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": blob.type },
        body: blob,
      });
      
      if (!uploadResponse.ok) {
        throw new Error("Upload failed");
      }
      
      const { storageId } = await uploadResponse.json();
      
      // Classify the image
      const result = await classifyWasteImage({ imageId: storageId });
      setClassification({ ...result, storageId });
      
      toast.success(
        isChildMode 
          ? `I think this is ${result.wasteType}! 🤖 Is that right?`
          : `AI Classification: ${result.wasteType} (${Math.round(result.confidence * 100)}% confidence)`
      );
    } catch (error) {
      toast.error(
        isChildMode 
          ? "Oops! The AI couldn't figure it out. Try again! 🤔"
          : "Classification failed. Please try again."
      );
    } finally {
      setIsClassifying(false);
    }
  };

  const submitWasteEntry = async () => {
    if (!classification || !weight) {
      toast.error(
        isChildMode 
          ? "Don't forget to add the weight! ⚖️"
          : "Please enter the weight"
      );
      return;
    }

    const weightNum = parseFloat(weight);
    if (weightNum <= 0) {
      toast.error(
        isChildMode 
          ? "Weight must be more than 0! 📏"
          : "Weight must be greater than 0"
      );
      return;
    }

    try {
      await logWaste({
        wasteType: classification.wasteType,
        weight: weightNum,
        imageId: classification.storageId,
        aiClassified: true,
        aiConfidence: classification.confidence,
      });

      const points = Math.round(weightNum * 10);
      toast.success(
        isChildMode 
          ? `Amazing! You earned ${points} eco points! 🌟 Keep saving the planet!`
          : `Successfully logged ${weightNum}kg of ${classification.wasteType}! Earned ${points} points.`
      );

      // Reset form
      setCapturedImage(null);
      setClassification(null);
      setWeight("");
    } catch (error) {
      toast.error(
        isChildMode 
          ? "Oops! Something went wrong. Try again! 😅"
          : "Failed to log waste. Please try again."
      );
    }
  };

  const reset = () => {
    setCapturedImage(null);
    setClassification(null);
    setWeight("");
    stopCamera();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className={`${isChildMode ? 'bg-gradient-to-r from-purple-400 via-pink-500 to-red-500' : 'bg-white'} rounded-xl p-6 shadow-lg dark:bg-gray-800`}>
        <div className="flex items-center space-x-3">
          {isChildMode ? (
            <div className="text-4xl">📸</div>
          ) : (
            <CameraIcon className="w-8 h-8 text-purple-600" />
          )}
          <div>
            <h1 className={`text-2xl font-bold ${isChildMode ? 'text-white' : 'text-gray-900'} dark:text-white`}>
              {isChildMode ? "AI Waste Detective! 🕵️‍♀️" : "AI Waste Classification"}
            </h1>
            <p className={`${isChildMode ? 'text-white/90' : 'text-gray-600'} dark:text-gray-300`}>
              {isChildMode ? "Take a photo and let AI help you sort!" : "Use AI to identify and classify waste"}
            </p>
          </div>
        </div>
      </div>

      {/* Camera/Photo Section */}
      <div className={`${isChildMode ? 'bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100' : 'bg-white'} rounded-xl p-6 shadow-lg dark:bg-gray-800`}>
        {!capturedImage && !isCapturing && (
          <div className="text-center space-y-4">
            <div className="text-6xl mb-4">
              {isChildMode ? "📷" : "📸"}
            </div>
            <h3 className={`text-lg font-semibold ${isChildMode ? 'text-gray-800' : 'text-gray-900'} dark:text-white mb-4`}>
              {isChildMode ? "Ready to take a photo? 📸" : "Capture or Upload Image"}
            </h3>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={startCamera}
                className={`px-6 py-3 rounded-lg font-semibold text-white transition-all duration-200 ${
                  isChildMode
                    ? 'bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 hover:from-blue-500 hover:via-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl transform hover:scale-105'
                    : 'bg-purple-600 hover:bg-purple-700 shadow-md hover:shadow-lg'
                } flex items-center space-x-2`}
              >
                <CameraIcon className="w-5 h-5" />
                <span>{isChildMode ? "Take Photo! 📸" : "Take Photo"}</span>
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                  isChildMode
                    ? 'bg-white/80 text-gray-800 hover:bg-white border-2 border-purple-300 hover:border-purple-400'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                } dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 flex items-center space-x-2`}
              >
                <PhotoIcon className="w-5 h-5" />
                <span>{isChildMode ? "Choose Photo! 🖼️" : "Upload Photo"}</span>
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        )}

        {isCapturing && (
          <div className="space-y-4">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full rounded-lg"
            />
            <div className="flex justify-center space-x-4">
              <button
                onClick={capturePhoto}
                className={`px-6 py-3 rounded-lg font-semibold text-white transition-all duration-200 ${
                  isChildMode
                    ? 'bg-gradient-to-r from-green-400 via-blue-500 to-purple-500 hover:from-green-500 hover:via-blue-600 hover:to-purple-600 shadow-lg hover:shadow-xl transform hover:scale-105'
                    : 'bg-green-600 hover:bg-green-700 shadow-md hover:shadow-lg'
                } flex items-center space-x-2`}
              >
                <CameraIcon className="w-5 h-5" />
                <span>{isChildMode ? "Snap! 📸" : "Capture"}</span>
              </button>
              <button
                onClick={stopCamera}
                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                  isChildMode
                    ? 'bg-white/80 text-gray-800 hover:bg-white border-2 border-red-300 hover:border-red-400'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                } dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 flex items-center space-x-2`}
              >
                <XMarkIcon className="w-5 h-5" />
                <span>{isChildMode ? "Cancel" : "Cancel"}</span>
              </button>
            </div>
          </div>
        )}

        {capturedImage && (
          <div className="space-y-4">
            <img
              src={capturedImage}
              alt="Captured waste"
              className="w-full rounded-lg max-h-96 object-cover"
            />
            
            {!classification && (
              <div className="text-center">
                <button
                  onClick={classifyImage}
                  disabled={isClassifying}
                  className={`px-6 py-3 rounded-lg font-semibold text-white transition-all duration-200 ${
                    isChildMode
                      ? 'bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 hover:from-yellow-500 hover:via-orange-600 hover:to-red-600 shadow-lg hover:shadow-xl transform hover:scale-105'
                      : 'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg'
                  } disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center space-x-2`}
                >
                  {isClassifying ? (
                    <>
                      <ArrowPathIcon className="w-5 h-5 animate-spin" />
                      <span>{isChildMode ? "AI is thinking... 🤖" : "Classifying..."}</span>
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="w-5 h-5" />
                      <span>{isChildMode ? "Ask AI! 🤖" : "Classify with AI"}</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {classification && (
              <div className={`${isChildMode ? 'bg-white/80' : 'bg-green-50'} rounded-lg p-4 dark:bg-gray-700`}>
                <h4 className={`font-semibold ${isChildMode ? 'text-gray-800' : 'text-green-800'} dark:text-green-300 mb-2`}>
                  {isChildMode ? "🤖 AI Detective Says:" : "AI Classification Result"}
                </h4>
                <div className="space-y-2">
                  <p className={`${isChildMode ? 'text-gray-700' : 'text-green-700'} dark:text-green-200`}>
                    <strong>Type:</strong> {classification.wasteType}
                  </p>
                  <p className={`${isChildMode ? 'text-gray-700' : 'text-green-700'} dark:text-green-200`}>
                    <strong>Confidence:</strong> {Math.round(classification.confidence * 100)}%
                  </p>
                  {classification.suggestions && (
                    <div className={`${isChildMode ? 'text-gray-600' : 'text-green-600'} dark:text-green-300 text-sm`}>
                      {classification.suggestions.map((suggestion: string, index: number) => (
                        <p key={index}>• {suggestion}</p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {classification && (
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium ${isChildMode ? 'text-gray-800' : 'text-gray-700'} dark:text-gray-300 mb-2`}>
                    {isChildMode ? "How much does it weigh? ⚖️" : "Weight (kg)"}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder={isChildMode ? "0.5" : "Enter weight in kg"}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                      isChildMode 
                        ? 'border-gray-300 bg-white/80 text-gray-800 placeholder-gray-500' 
                        : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                    } dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400`}
                  />
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={submitWasteEntry}
                    disabled={!weight}
                    className={`flex-1 py-3 px-6 rounded-lg font-semibold text-white transition-all duration-200 ${
                      isChildMode
                        ? 'bg-gradient-to-r from-green-400 via-blue-500 to-purple-500 hover:from-green-500 hover:via-blue-600 hover:to-purple-600 shadow-lg hover:shadow-xl transform hover:scale-105'
                        : 'bg-green-600 hover:bg-green-700 shadow-md hover:shadow-lg'
                    } disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
                  >
                    {isChildMode ? "Save to Planet! 🌍" : "Log Waste Entry"}
                  </button>
                  <button
                    onClick={reset}
                    className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                      isChildMode
                        ? 'bg-white/80 text-gray-800 hover:bg-white border-2 border-gray-300 hover:border-gray-400'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                    } dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600`}
                  >
                    {isChildMode ? "Try Again" : "Reset"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />

      {/* Tips Section */}
      <div className={`${isChildMode ? 'bg-gradient-to-r from-green-200 via-yellow-200 to-orange-200' : 'bg-blue-50'} rounded-xl p-6 dark:bg-gray-800`}>
        <h3 className={`text-lg font-semibold ${isChildMode ? 'text-gray-800' : 'text-blue-900'} dark:text-white mb-3`}>
          {isChildMode ? "Photo Tips! 📸" : "Photography Tips"}
        </h3>
        <ul className={`space-y-2 ${isChildMode ? 'text-gray-700' : 'text-blue-800'} dark:text-gray-300`}>
          <li className="flex items-start space-x-2">
            <span className={isChildMode ? "text-lg" : "text-blue-500"}>
              {isChildMode ? "💡" : "•"}
            </span>
            <span>{isChildMode ? "Make sure the waste item is clearly visible!" : "Ensure good lighting for better classification"}</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className={isChildMode ? "text-lg" : "text-blue-500"}>
              {isChildMode ? "📏" : "•"}
            </span>
            <span>{isChildMode ? "Take the photo close enough to see details!" : "Capture the item from a close distance"}</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className={isChildMode ? "text-lg" : "text-blue-500"}>
              {isChildMode ? "🧹" : "•"}
            </span>
            <span>{isChildMode ? "Clean items work better for the AI detective!" : "Clean items are easier to classify"}</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
