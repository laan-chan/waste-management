import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, useEffect } from "react";
import { 
  ChartBarIcon, 
  GiftIcon, 
  FireIcon,
  BeakerIcon,
  GlobeAltIcon,
  TrophyIcon
} from "@heroicons/react/24/outline";

export default function Dashboard() {
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const analytics = useQuery(api.waste.getWasteAnalytics, { period: "month" });
  const notifications = useQuery(api.notifications.getUserNotifications);
  const leaderboard = useQuery(api.waste.getLeaderboard, { period: "week", limit: 5 });
  const ecoFact = useQuery(api.ecoFacts.getRandomEcoFact, { 
    forChildren: loggedInUser?.mode === "child" 
  });

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const isChildMode = loggedInUser?.mode === "child";

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const stats = [
    {
      title: isChildMode ? "Eco Points" : "Total Points",
      value: loggedInUser?.totalPoints || 0,
      icon: isChildMode ? "⭐" : <FireIcon className="w-6 h-6" />,
      color: isChildMode ? "from-yellow-400 to-orange-500" : "from-orange-400 to-red-500",
      childColor: "bg-gradient-to-r from-yellow-200 to-orange-200",
    },
    {
      title: isChildMode ? "Planet Saves" : "CO₂ Saved",
      value: isChildMode ? Math.floor((analytics?.totalCo2Saved || 0) * 10) : `${(analytics?.totalCo2Saved || 0).toFixed(1)}kg`,
      icon: isChildMode ? "🌍" : <GlobeAltIcon className="w-6 h-6" />,
      color: isChildMode ? "from-green-400 to-blue-500" : "from-green-400 to-blue-500",
      childColor: "bg-gradient-to-r from-green-200 to-blue-200",
    },
    {
      title: isChildMode ? "Waste Sorted" : "Total Weight",
      value: isChildMode ? `${Math.floor(analytics?.totalWeight || 0)} items` : `${(analytics?.totalWeight || 0).toFixed(1)}kg`,
      icon: isChildMode ? "♻️" : <BeakerIcon className="w-6 h-6" />,
      color: isChildMode ? "from-purple-400 to-pink-500" : "from-green-500 to-teal-500",
      childColor: "bg-gradient-to-r from-purple-200 to-pink-200",
    },
    {
      title: isChildMode ? "Hero Level" : "Your Rank",
      value: isChildMode ? `Level ${loggedInUser?.level || 1}` : "#" + ((leaderboard?.findIndex(u => u.userId === loggedInUser?._id) || -1) + 1),
      icon: isChildMode ? "🏆" : <TrophyIcon className="w-6 h-6" />,
      color: isChildMode ? "from-indigo-400 to-purple-500" : "from-purple-500 to-indigo-500",
      childColor: "bg-gradient-to-r from-indigo-200 to-purple-200",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className={`${isChildMode ? 'bg-gradient-to-r from-green-400 via-blue-500 to-purple-500' : 'bg-white'} rounded-xl p-6 shadow-lg dark:bg-gray-800`}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-3xl font-bold ${isChildMode ? 'text-white' : 'text-gray-900'} dark:text-white mb-2`}>
              {getGreeting()}, {isChildMode ? "Eco Hero" : loggedInUser?.name || "Eco Warrior"}! 
              {isChildMode && <span className="ml-2">🌟</span>}
            </h1>
            <p className={`text-lg ${isChildMode ? 'text-white/90' : 'text-gray-600'} dark:text-gray-300`}>
              {isChildMode 
                ? "Ready to save the planet today? Let's sort some waste!" 
                : "Track your environmental impact and make a difference"}
            </p>
          </div>
          {isChildMode && (
            <div className="text-6xl animate-bounce">
              🦸‍♀️
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`${isChildMode ? stat.childColor : 'bg-white'} rounded-xl p-6 shadow-lg dark:bg-gray-800 transform hover:scale-105 transition-transform duration-200`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${isChildMode ? 'text-gray-700' : 'text-gray-600'} dark:text-gray-300 mb-1`}>
                  {stat.title}
                </p>
                <p className={`text-2xl font-bold ${isChildMode ? 'text-gray-800' : 'text-gray-900'} dark:text-white`}>
                  {stat.value}
                </p>
              </div>
              <div className={`${isChildMode ? 'text-3xl' : `p-3 bg-gradient-to-r ${stat.color} rounded-lg text-white`}`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Eco Fact */}
        {ecoFact && (
          <div className={`${isChildMode ? 'bg-gradient-to-r from-yellow-200 via-green-200 to-blue-200' : 'bg-white'} rounded-xl p-6 shadow-lg dark:bg-gray-800`}>
            <div className="flex items-start space-x-4">
              <div className="text-4xl">{ecoFact.icon}</div>
              <div>
                <h3 className={`text-lg font-semibold ${isChildMode ? 'text-gray-800' : 'text-gray-900'} dark:text-white mb-2`}>
                  {isChildMode ? "Did You Know? 🤔" : "Eco Fact"}
                </h3>
                <p className={`${isChildMode ? 'text-gray-700 text-lg' : 'text-gray-600'} dark:text-gray-300`}>
                  {ecoFact.fact}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Recent Notifications */}
        <div className={`${isChildMode ? 'bg-gradient-to-r from-purple-200 via-pink-200 to-red-200' : 'bg-white'} rounded-xl p-6 shadow-lg dark:bg-gray-800`}>
          <h3 className={`text-lg font-semibold ${isChildMode ? 'text-gray-800' : 'text-gray-900'} dark:text-white mb-4`}>
            {isChildMode ? "Hero Messages 📬" : "Recent Notifications"}
          </h3>
          <div className="space-y-3">
            {notifications?.slice(0, 3).map((notification) => (
              <div
                key={notification._id}
                className={`p-3 ${isChildMode ? 'bg-white/50' : 'bg-gray-50'} rounded-lg dark:bg-gray-700`}
              >
                <p className={`text-sm font-medium ${isChildMode ? 'text-gray-800' : 'text-gray-900'} dark:text-white`}>
                  {notification.title}
                </p>
                <p className={`text-sm ${isChildMode ? 'text-gray-600' : 'text-gray-600'} dark:text-gray-300 mt-1`}>
                  {notification.message}
                </p>
              </div>
            )) || (
              <p className={`text-sm ${isChildMode ? 'text-gray-600' : 'text-gray-500'} dark:text-gray-400 italic`}>
                {isChildMode ? "No new hero messages! 🌟" : "No new notifications"}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      {!isChildMode && leaderboard && leaderboard.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-lg dark:bg-gray-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <TrophyIcon className="w-5 h-5 mr-2 text-yellow-500" />
            Weekly Leaderboard
          </h3>
          <div className="space-y-3">
            {leaderboard.map((user, index) => (
              <div
                key={user.userId}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  user.userId === loggedInUser?._id ? 'bg-green-50 border border-green-200 dark:bg-green-900/20' : 'bg-gray-50 dark:bg-gray-700'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    index === 0 ? 'bg-yellow-400 text-yellow-900' :
                    index === 1 ? 'bg-gray-300 text-gray-700' :
                    index === 2 ? 'bg-orange-400 text-orange-900' :
                    'bg-gray-200 text-gray-600'
                  }`}>
                    {index + 1}
                  </div>
                  <span className="font-medium text-gray-900 dark:text-white">{user.name}</span>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900 dark:text-white">{user.points} pts</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{user.co2Saved.toFixed(1)}kg CO₂</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Child Mode Leaderboard */}
      {isChildMode && leaderboard && leaderboard.length > 0 && (
        <div className="bg-gradient-to-r from-yellow-200 via-orange-200 to-red-200 rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            🏆 Hero Hall of Fame 🏆
          </h3>
          <div className="space-y-3">
            {leaderboard.slice(0, 3).map((user, index) => (
              <div
                key={user.userId}
                className={`flex items-center justify-between p-4 rounded-lg bg-white/70 ${
                  user.userId === loggedInUser?._id ? 'ring-2 ring-yellow-400' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                  </div>
                  <span className="font-bold text-gray-800">{user.name}</span>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-800 text-lg">⭐ {user.points}</p>
                  <p className="text-sm text-gray-600">Level {user.level} Hero</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
