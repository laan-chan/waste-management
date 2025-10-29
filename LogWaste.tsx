import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { 
  PlusCircleIcon, 
  ScaleIcon,
  MapPinIcon,
  SparklesIcon
} from "@heroicons/react/24/outline";

const WASTE_TYPES = [
  { id: "plastic", name: "Plastic", icon: "🍾", color: "bg-blue-100 text-blue-800", childEmoji: "🍾" },
  { id: "organic", name: "Organic", icon: "🍌", color: "bg-green-100 text-green-800", childEmoji: "🍌" },
  { id: "paper", name: "Paper", icon: "📄", color: "bg-yellow-100 text-yellow-800", childEmoji: "📄" },
  { id: "glass", name: "Glass", icon: "🍷", color: "bg-purple-100 text-purple-800", childEmoji: "🍷" },
  { id: "metal", name: "Metal", icon: "🥤", color: "bg-gray-100 text-gray-800", childEmoji: "🥤" },
  { id: "electronic", name: "Electronic", icon: "📱", color: "bg-red-100 text-red-800", childEmoji: "📱" },
] as const;

export default function LogWaste() {
  const [selectedType, setSelectedType] = useState<string>("");
  const [weight, setWeight] = useState("");
  const [location, setLocation] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const logWaste = useMutation(api.waste.logWaste);
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const isChildMode = loggedInUser?.mode === "child";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedType || !weight) {
      toast.error(isChildMode ? "Please pick a waste type and amount! 🤔" : "Please select waste type and enter weight");
      return;
    }

    const weightNum = parseFloat(weight);
    if (weightNum <= 0) {
      toast.error(isChildMode ? "Weight must be more than 0! 📏" : "Weight must be greater than 0");
      return;
    }

    setIsLoading(true);
    try {
      await logWaste({
        wasteType: selectedType as any,
        weight: weightNum,
        location: location || undefined,
        aiClassified: false,
      });

      const wasteType = WASTE_TYPES.find(t => t.id === selectedType);
      const points = Math.round(weightNum * 10); // Simplified points calculation

      toast.success(
        isChildMode 
          ? `Amazing! You earned ${points} eco points! 🌟 Keep saving the planet!`
          : `Successfully logged ${weightNum}kg of ${wasteType?.name}! Earned ${points} points.`
      );

      // Reset form
      setSelectedType("");
      setWeight("");
      setLocation("");
    } catch (error) {
      toast.error(isChildMode ? "Oops! Something went wrong. Try again! 😅" : "Failed to log waste. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className={`${isChildMode ? 'bg-gradient-to-r from-green-400 via-blue-500 to-purple-500' : 'bg-white'} rounded-xl p-6 shadow-lg dark:bg-gray-800`}>
        <div className="flex items-center space-x-3">
          {isChildMode ? (
            <div className="text-4xl">🦸‍♀️</div>
          ) : (
            <PlusCircleIcon className="w-8 h-8 text-green-600" />
          )}
          <div>
            <h1 className={`text-2xl font-bold ${isChildMode ? 'text-white' : 'text-gray-900'} dark:text-white`}>
              {isChildMode ? "Sort Your Waste Like a Hero! 🌟" : "Log Waste Entry"}
            </h1>
            <p className={`${isChildMode ? 'text-white/90' : 'text-gray-600'} dark:text-gray-300`}>
              {isChildMode ? "Every piece you sort saves the planet!" : "Track your environmental impact"}
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className={`${isChildMode ? 'bg-gradient-to-br from-yellow-100 via-green-100 to-blue-100' : 'bg-white'} rounded-xl p-6 shadow-lg dark:bg-gray-800 space-y-6`}>
        
        {/* Waste Type Selection */}
        <div>
          <label className={`block text-sm font-medium ${isChildMode ? 'text-gray-800' : 'text-gray-700'} dark:text-gray-300 mb-3`}>
            {isChildMode ? "What type of waste did you sort? 🤔" : "Waste Type"}
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {WASTE_TYPES.map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => setSelectedType(type.id)}
                className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                  selectedType === type.id
                    ? isChildMode
                      ? 'border-purple-400 bg-purple-200 shadow-lg transform scale-105'
                      : 'border-green-500 bg-green-50 shadow-md dark:bg-green-900/20'
                    : isChildMode
                      ? 'border-gray-200 bg-white/70 hover:bg-white hover:shadow-md'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm dark:bg-gray-700 dark:border-gray-600'
                }`}
              >
                <div className="text-center">
                  <div className={`text-3xl mb-2 ${selectedType === type.id && isChildMode ? 'animate-bounce' : ''}`}>
                    {isChildMode ? type.childEmoji : type.icon}
                  </div>
                  <span className={`text-sm font-medium ${isChildMode ? 'text-gray-800' : 'text-gray-700'} dark:text-gray-300`}>
                    {type.name}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Weight Input */}
        <div>
          <label className={`block text-sm font-medium ${isChildMode ? 'text-gray-800' : 'text-gray-700'} dark:text-gray-300 mb-2`}>
            {isChildMode ? "How much does it weigh? ⚖️" : "Weight (kg)"}
          </label>
          <div className="relative">
            <ScaleIcon className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isChildMode ? 'text-gray-600' : 'text-gray-400'}`} />
            <input
              type="number"
              step="0.1"
              min="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder={isChildMode ? "0.5" : "Enter weight in kg"}
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                isChildMode 
                  ? 'border-gray-300 bg-white/80 text-gray-800 placeholder-gray-500' 
                  : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
              } dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400`}
            />
          </div>
          {isChildMode && (
            <p className="text-xs text-gray-600 mt-1">
              💡 Tip: Ask an adult to help you weigh it!
            </p>
          )}
        </div>

        {/* Location Input */}
        <div>
          <label className={`block text-sm font-medium ${isChildMode ? 'text-gray-800' : 'text-gray-700'} dark:text-gray-300 mb-2`}>
            {isChildMode ? "Where did you find it? 📍 (Optional)" : "Location (Optional)"}
          </label>
          <div className="relative">
            <MapPinIcon className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isChildMode ? 'text-gray-600' : 'text-gray-400'}`} />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder={isChildMode ? "Kitchen, Garden, School..." : "e.g., Kitchen, Garden, Office"}
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                isChildMode 
                  ? 'border-gray-300 bg-white/80 text-gray-800 placeholder-gray-500' 
                  : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
              } dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400`}
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !selectedType || !weight}
          className={`w-full py-4 px-6 rounded-lg font-semibold text-white transition-all duration-200 ${
            isChildMode
              ? 'bg-gradient-to-r from-green-400 via-blue-500 to-purple-500 hover:from-green-500 hover:via-blue-600 hover:to-purple-600 shadow-lg hover:shadow-xl transform hover:scale-105'
              : 'bg-green-600 hover:bg-green-700 shadow-md hover:shadow-lg'
          } disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2`}
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>{isChildMode ? "Saving the planet..." : "Logging..."}</span>
            </>
          ) : (
            <>
              {isChildMode ? (
                <>
                  <SparklesIcon className="w-5 h-5" />
                  <span>Save the Planet! 🌍</span>
                </>
              ) : (
                <>
                  <PlusCircleIcon className="w-5 h-5" />
                  <span>Log Waste Entry</span>
                </>
              )}
            </>
          )}
        </button>
      </form>

      {/* Tips Section */}
      <div className={`${isChildMode ? 'bg-gradient-to-r from-orange-200 via-yellow-200 to-green-200' : 'bg-blue-50'} rounded-xl p-6 dark:bg-gray-800`}>
        <h3 className={`text-lg font-semibold ${isChildMode ? 'text-gray-800' : 'text-blue-900'} dark:text-white mb-3`}>
          {isChildMode ? "Hero Tips! 💡" : "Sorting Tips"}
        </h3>
        <ul className={`space-y-2 ${isChildMode ? 'text-gray-700' : 'text-blue-800'} dark:text-gray-300`}>
          <li className="flex items-start space-x-2">
            <span className={isChildMode ? "text-lg" : "text-green-500"}>
              {isChildMode ? "🍾" : "•"}
            </span>
            <span>{isChildMode ? "Plastic bottles and bags go in plastic!" : "Clean containers before recycling"}</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className={isChildMode ? "text-lg" : "text-green-500"}>
              {isChildMode ? "🍌" : "•"}
            </span>
            <span>{isChildMode ? "Food scraps like banana peels are organic!" : "Organic waste can be composted"}</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className={isChildMode ? "text-lg" : "text-green-500"}>
              {isChildMode ? "📄" : "•"}
            </span>
            <span>{isChildMode ? "Newspapers and cardboard are paper!" : "Remove staples and tape from paper"}</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
