import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { 
  UsersIcon, 
  ChartBarIcon, 
  CogIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from "@heroicons/react/24/outline";

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState("overview");
  
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const binStatus = useQuery(api.bins.getBinStatus);
  const leaderboard = useQuery(api.waste.getLeaderboard, { period: "month", limit: 10 });
  const classifierStats = useQuery(api.ai.getClassifierStats);
  
  const initializeBins = useMutation(api.bins.initializeBins);
  const initializeEcoFacts = useMutation(api.ecoFacts.initializeEcoFacts);

  // Redirect non-admin users
  if (loggedInUser?.role !== "admin") {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
          <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-800 mb-4">
            Access Denied
          </h2>
          <p className="text-red-700">
            You don't have permission to access the admin panel. This area is restricted to administrators only.
          </p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "overview", name: "Overview", icon: ChartBarIcon },
    { id: "bins", name: "Bin Management", icon: TrashIcon },
    { id: "users", name: "User Management", icon: UsersIcon },
    { id: "system", name: "System", icon: CogIcon },
  ];

  const getBinStatusColor = (status: string) => {
    switch (status) {
      case "full": return "bg-red-100 text-red-800 border-red-200";
      case "warning": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "maintenance": return "bg-orange-100 text-orange-800 border-orange-200";
      default: return "bg-green-100 text-green-800 border-green-200";
    }
  };

  const getBinStatusIcon = (status: string) => {
    switch (status) {
      case "full": return "🔴";
      case "warning": return "🟡";
      case "maintenance": return "🔧";
      default: return "🟢";
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* System Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-lg dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Users</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {leaderboard?.length || 0}
              </p>
            </div>
            <UsersIcon className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-lg dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Bins</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {binStatus?.length || 0}
              </p>
            </div>
            <TrashIcon className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-lg dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Full Bins</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {binStatus?.filter(bin => bin.status === "full").length || 0}
              </p>
            </div>
            <ExclamationTriangleIcon className="w-8 h-8 text-red-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-lg dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">AI Accuracy</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {classifierStats ? `${Math.round(classifierStats.accuracy * 100)}%` : "N/A"}
              </p>
            </div>
            <ChartBarIcon className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Top Users */}
      <div className="bg-white rounded-xl p-6 shadow-lg dark:bg-gray-800">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Top Users This Month
        </h3>
        <div className="space-y-3">
          {leaderboard?.slice(0, 5).map((user, index) => (
            <div key={user.userId} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
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
                <p className="text-sm text-gray-500 dark:text-gray-400">{user.weight.toFixed(1)}kg</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderBins = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Bin Status Overview
        </h3>
        <button
          onClick={() => initializeBins()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Initialize Demo Bins
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {binStatus?.map((bin) => (
          <div key={bin._id} className="bg-white rounded-xl p-6 shadow-lg dark:bg-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-900 dark:text-white">
                {bin.location}
              </h4>
              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getBinStatusColor(bin.status)}`}>
                {getBinStatusIcon(bin.status)} {bin.status}
              </span>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-300">Type:</span>
                <span className="font-medium text-gray-900 dark:text-white capitalize">{bin.wasteType}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-300">Capacity:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {bin.currentLevel}/{bin.capacity} ({Math.round((bin.currentLevel / bin.capacity) * 100)}%)
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-300">Last Collection:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {new Date(bin.lastCollection).toLocaleDateString()}
                </span>
              </div>
            </div>
            
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                <div 
                  className={`h-2 rounded-full ${
                    bin.status === 'full' ? 'bg-red-500' :
                    bin.status === 'warning' ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`}
                  style={{ width: `${Math.min((bin.currentLevel / bin.capacity) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        User Management
      </h3>
      
      <div className="bg-white rounded-xl shadow-lg dark:bg-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Points
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Weight (kg)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  CO₂ Saved (kg)
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {leaderboard?.map((user) => (
                <tr key={user.userId}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-700">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {user.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      User
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {user.points}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {user.weight.toFixed(1)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {user.co2Saved.toFixed(1)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderSystem = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        System Management
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* AI Classifier Stats */}
        <div className="bg-white rounded-xl p-6 shadow-lg dark:bg-gray-800">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            AI Classifier Statistics
          </h4>
          {classifierStats ? (
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Total Samples:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {classifierStats.totalSamples}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Accuracy:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {Math.round(classifierStats.accuracy * 100)}%
                </span>
              </div>
              <div className="mt-4">
                <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Samples by Type:
                </h5>
                <div className="space-y-1">
                  {Object.entries(classifierStats.byType).map(([type, count]) => (
                    <div key={type} className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400 capitalize">{type}:</span>
                      <span className="text-gray-900 dark:text-white">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">No classifier data available</p>
          )}
        </div>

        {/* System Actions */}
        <div className="bg-white rounded-xl p-6 shadow-lg dark:bg-gray-800">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            System Actions
          </h4>
          <div className="space-y-3">
            <button
              onClick={() => initializeBins()}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
            >
              <TrashIcon className="w-4 h-4" />
              <span>Initialize Demo Bins</span>
            </button>
            <button
              onClick={() => initializeEcoFacts()}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
            >
              <CheckCircleIcon className="w-4 h-4" />
              <span>Initialize Eco Facts</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "overview": return renderOverview();
      case "bins": return renderBins();
      case "users": return renderUsers();
      case "system": return renderSystem();
      default: return renderOverview();
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 shadow-lg dark:bg-gray-800">
        <div className="flex items-center space-x-3">
          <CogIcon className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Admin Panel
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Manage the Smart Waste Tracker system
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-lg dark:bg-gray-800">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <tab.icon className="w-5 h-5" />
                  <span>{tab.name}</span>
                </div>
              </button>
            ))}
          </nav>
        </div>
        
        <div className="p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
