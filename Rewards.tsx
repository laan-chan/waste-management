import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { 
  GiftIcon, 
  TrophyIcon, 
  StarIcon,
  CheckCircleIcon,
  ClockIcon
} from "@heroicons/react/24/outline";

export default function Rewards() {
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const rewards = useQuery(api.rewards.getUserRewards);
  const claimReward = useMutation(api.rewards.claimReward);

  const isChildMode = loggedInUser?.mode === "child";

  const handleClaimReward = async (rewardId: any) => {
    try {
      await claimReward({ rewardId });
      toast.success(
        isChildMode 
          ? "Awesome! You claimed your reward! 🎉" 
          : "Reward claimed successfully!"
      );
    } catch (error) {
      toast.error(
        isChildMode 
          ? "Oops! Something went wrong. Try again! 😅" 
          : "Failed to claim reward. Please try again."
      );
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "daily": return "📅";
      case "weekly": return "📊";
      case "milestone": return "🏆";
      case "special": return "⭐";
      default: return "🎁";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "daily": return "from-blue-400 to-blue-600";
      case "weekly": return "from-green-400 to-green-600";
      case "milestone": return "from-yellow-400 to-orange-500";
      case "special": return "from-purple-400 to-pink-500";
      default: return "from-gray-400 to-gray-600";
    }
  };

  const unclaimedRewards = rewards?.filter(r => !r.claimed) || [];
  const claimedRewards = rewards?.filter(r => r.claimed) || [];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className={`${isChildMode ? 'bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500' : 'bg-white'} rounded-xl p-6 shadow-lg dark:bg-gray-800`}>
        <div className="flex items-center space-x-3">
          {isChildMode ? (
            <div className="text-4xl">🏆</div>
          ) : (
            <GiftIcon className="w-8 h-8 text-yellow-600" />
          )}
          <div>
            <h1 className={`text-2xl font-bold ${isChildMode ? 'text-white' : 'text-gray-900'} dark:text-white`}>
              {isChildMode ? "Hero Rewards! 🌟" : "Rewards & Achievements"}
            </h1>
            <p className={`${isChildMode ? 'text-white/90' : 'text-gray-600'} dark:text-gray-300`}>
              {isChildMode ? "Claim your awesome rewards for saving the planet!" : "Claim rewards for your environmental achievements"}
            </p>
          </div>
        </div>
      </div>

      {/* User Stats */}
      <div className={`${isChildMode ? 'bg-gradient-to-r from-green-200 via-blue-200 to-purple-200' : 'bg-white'} rounded-xl p-6 shadow-lg dark:bg-gray-800`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className={`text-3xl ${isChildMode ? 'text-gray-800' : 'text-yellow-500'} mb-2`}>
              {isChildMode ? "⭐" : <StarIcon className="w-8 h-8 mx-auto" />}
            </div>
            <p className={`text-2xl font-bold ${isChildMode ? 'text-gray-800' : 'text-gray-900'} dark:text-white`}>
              {loggedInUser?.totalPoints || 0}
            </p>
            <p className={`text-sm ${isChildMode ? 'text-gray-600' : 'text-gray-600'} dark:text-gray-300`}>
              {isChildMode ? "Eco Points" : "Total Points"}
            </p>
          </div>
          <div className="text-center">
            <div className={`text-3xl ${isChildMode ? 'text-gray-800' : 'text-green-500'} mb-2`}>
              {isChildMode ? "🏆" : <TrophyIcon className="w-8 h-8 mx-auto" />}
            </div>
            <p className={`text-2xl font-bold ${isChildMode ? 'text-gray-800' : 'text-gray-900'} dark:text-white`}>
              {claimedRewards.length}
            </p>
            <p className={`text-sm ${isChildMode ? 'text-gray-600' : 'text-gray-600'} dark:text-gray-300`}>
              {isChildMode ? "Rewards Earned" : "Achievements Unlocked"}
            </p>
          </div>
          <div className="text-center">
            <div className={`text-3xl ${isChildMode ? 'text-gray-800' : 'text-blue-500'} mb-2`}>
              {isChildMode ? "🎁" : <GiftIcon className="w-8 h-8 mx-auto" />}
            </div>
            <p className={`text-2xl font-bold ${isChildMode ? 'text-gray-800' : 'text-gray-900'} dark:text-white`}>
              {unclaimedRewards.length}
            </p>
            <p className={`text-sm ${isChildMode ? 'text-gray-600' : 'text-gray-600'} dark:text-gray-300`}>
              {isChildMode ? "New Rewards" : "Pending Claims"}
            </p>
          </div>
        </div>
      </div>

      {/* Unclaimed Rewards */}
      {unclaimedRewards.length > 0 && (
        <div className={`${isChildMode ? 'bg-gradient-to-r from-yellow-100 via-green-100 to-blue-100' : 'bg-white'} rounded-xl p-6 shadow-lg dark:bg-gray-800`}>
          <h2 className={`text-xl font-semibold ${isChildMode ? 'text-gray-800' : 'text-gray-900'} dark:text-white mb-4`}>
            {isChildMode ? "🎉 New Rewards to Claim! 🎉" : "Available Rewards"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {unclaimedRewards.map((reward) => (
              <div
                key={reward._id}
                className={`${isChildMode ? 'bg-white/80' : 'bg-gray-50'} rounded-lg p-4 border-2 border-dashed ${isChildMode ? 'border-yellow-400' : 'border-yellow-300'} dark:bg-gray-700 dark:border-yellow-500`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`text-2xl ${isChildMode ? 'animate-bounce' : ''}`}>
                      {getCategoryIcon(reward.category)}
                    </div>
                    <div>
                      <h3 className={`font-semibold ${isChildMode ? 'text-gray-800' : 'text-gray-900'} dark:text-white`}>
                        {reward.title}
                      </h3>
                      <p className={`text-sm ${isChildMode ? 'text-gray-600' : 'text-gray-600'} dark:text-gray-300`}>
                        {reward.description}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${isChildMode ? 'bg-yellow-200 text-yellow-800' : 'bg-yellow-100 text-yellow-800'} dark:bg-yellow-900/20 dark:text-yellow-400`}>
                    +{reward.points} pts
                  </span>
                </div>
                <button
                  onClick={() => handleClaimReward(reward._id)}
                  className={`w-full py-2 px-4 rounded-lg font-semibold text-white transition-all duration-200 ${
                    isChildMode
                      ? 'bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 hover:from-yellow-500 hover:via-orange-600 hover:to-red-600 shadow-lg hover:shadow-xl transform hover:scale-105'
                      : 'bg-yellow-500 hover:bg-yellow-600 shadow-md hover:shadow-lg'
                  }`}
                >
                  {isChildMode ? "Claim Reward! 🎁" : "Claim Reward"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Claimed Rewards */}
      {claimedRewards.length > 0 && (
        <div className={`${isChildMode ? 'bg-gradient-to-r from-green-100 via-blue-100 to-purple-100' : 'bg-white'} rounded-xl p-6 shadow-lg dark:bg-gray-800`}>
          <h2 className={`text-xl font-semibold ${isChildMode ? 'text-gray-800' : 'text-gray-900'} dark:text-white mb-4`}>
            {isChildMode ? "🏆 Your Amazing Achievements! 🏆" : "Claimed Rewards"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {claimedRewards.map((reward) => (
              <div
                key={reward._id}
                className={`${isChildMode ? 'bg-white/70' : 'bg-gray-50'} rounded-lg p-4 dark:bg-gray-700`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl opacity-75">
                      {getCategoryIcon(reward.category)}
                    </div>
                    <div>
                      <h3 className={`font-semibold ${isChildMode ? 'text-gray-800' : 'text-gray-900'} dark:text-white`}>
                        {reward.title}
                      </h3>
                      <p className={`text-sm ${isChildMode ? 'text-gray-600' : 'text-gray-600'} dark:text-gray-300`}>
                        {reward.description}
                      </p>
                    </div>
                  </div>
                  <CheckCircleIcon className={`w-5 h-5 ${isChildMode ? 'text-green-500' : 'text-green-500'}`} />
                </div>
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${isChildMode ? 'bg-green-200 text-green-800' : 'bg-green-100 text-green-800'} dark:bg-green-900/20 dark:text-green-400`}>
                    +{reward.points} pts
                  </span>
                  <span className={`text-xs ${isChildMode ? 'text-gray-500' : 'text-gray-500'} dark:text-gray-400`}>
                    {isChildMode ? "Claimed! ✅" : "Claimed"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Rewards Message */}
      {(!rewards || rewards.length === 0) && (
        <div className={`${isChildMode ? 'bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100' : 'bg-white'} rounded-xl p-8 shadow-lg dark:bg-gray-800 text-center`}>
          <div className="text-6xl mb-4">
            {isChildMode ? "🌟" : "🎁"}
          </div>
          <h3 className={`text-xl font-semibold ${isChildMode ? 'text-gray-800' : 'text-gray-900'} dark:text-white mb-2`}>
            {isChildMode ? "Start Your Hero Journey!" : "No Rewards Yet"}
          </h3>
          <p className={`${isChildMode ? 'text-gray-600' : 'text-gray-600'} dark:text-gray-300`}>
            {isChildMode 
              ? "Log your first waste to unlock amazing rewards and become an eco hero!"
              : "Start logging waste entries to unlock achievements and earn rewards!"}
          </p>
        </div>
      )}
    </div>
  );
}
