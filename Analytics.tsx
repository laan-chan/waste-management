import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { 
  ChartBarIcon, 
  ArrowTrendingUpIcon, 
  GlobeAltIcon,
  BeakerIcon,
  CalendarIcon
} from "@heroicons/react/24/outline";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from "recharts";

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

export default function Analytics() {
  const [period, setPeriod] = useState<"week" | "month" | "year">("month");
  
  const analytics = useQuery(api.waste.getWasteAnalytics, { period });
  const predictions = useQuery(api.waste.getPredictiveAnalytics);
  const loggedInUser = useQuery(api.auth.loggedInUser);

  const isChildMode = loggedInUser?.mode === "child";

  // Redirect child users
  if (isChildMode) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-r from-yellow-200 via-orange-200 to-red-200 rounded-xl p-8 text-center">
          <div className="text-6xl mb-4">🦸‍♀️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Hero Mode Active! 🌟
          </h2>
          <p className="text-lg text-gray-700 mb-6">
            Analytics are for grown-up heroes! Ask an adult to help you see your amazing planet-saving stats!
          </p>
          <div className="bg-white/70 rounded-lg p-4">
            <p className="text-gray-800 font-semibold">
              Your current hero stats: ⭐ {loggedInUser?.totalPoints || 0} Eco Points!
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  const pieData = Object.entries(analytics.byType).map(([type, data], index) => ({
    name: type.charAt(0).toUpperCase() + type.slice(1),
    value: data.weight,
    color: COLORS[index % COLORS.length],
  }));

  const impactStats = [
    {
      title: "Total CO₂ Saved",
      value: `${analytics.totalCo2Saved.toFixed(1)} kg`,
      icon: <GlobeAltIcon className="w-6 h-6" />,
      color: "from-green-400 to-blue-500",
      description: "Equivalent to planting trees",
    },
    {
      title: "Landfill Reduced",
      value: `${analytics.totalLandfillReduced.toFixed(1)} kg`,
      icon: <BeakerIcon className="w-6 h-6" />,
      color: "from-green-500 to-teal-500",
      description: "Space saved in landfills",
    },
    {
      title: "Total Weight",
      value: `${analytics.totalWeight.toFixed(1)} kg`,
      icon: <ChartBarIcon className="w-6 h-6" />,
      color: "from-blue-500 to-purple-500",
      description: "Waste properly sorted",
    },
    {
      title: "Points Earned",
      value: analytics.totalPoints.toString(),
      icon: <ArrowTrendingUpIcon className="w-6 h-6" />,
      color: "from-orange-400 to-red-500",
      description: "Environmental impact points",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 shadow-lg dark:bg-gray-800">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Environmental Impact Analytics
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Track your waste sorting progress and environmental impact
            </p>
          </div>
          
          {/* Period Selector */}
          <div className="mt-4 sm:mt-0">
            <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              {[
                { value: "week", label: "Week" },
                { value: "month", label: "Month" },
                { value: "year", label: "Year" },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setPeriod(option.value as any)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    period === option.value
                      ? "bg-green-500 text-white shadow-sm"
                      : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Impact Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {impactStats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-xl p-6 shadow-lg dark:bg-gray-800 transform hover:scale-105 transition-transform duration-200"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 bg-gradient-to-r ${stat.color} rounded-lg text-white`}>
                {stat.icon}
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
              {stat.title}
            </h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {stat.value}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {stat.description}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Trend Chart */}
        <div className="bg-white rounded-xl p-6 shadow-lg dark:bg-gray-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <CalendarIcon className="w-5 h-5 mr-2 text-green-500" />
            Daily Waste Trend
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.dailyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                formatter={(value: number, name: string) => [
                  `${value.toFixed(1)}${name === 'weight' ? 'kg' : name === 'points' ? ' pts' : 'kg'}`,
                  name === 'weight' ? 'Weight' : name === 'points' ? 'Points' : 'CO₂ Saved'
                ]}
              />
              <Line 
                type="monotone" 
                dataKey="weight" 
                stroke="#10B981" 
                strokeWidth={2}
                dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="co2Saved" 
                stroke="#3B82F6" 
                strokeWidth={2}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Waste Type Distribution */}
        <div className="bg-white rounded-xl p-6 shadow-lg dark:bg-gray-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Waste Type Distribution
          </h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry: any) => `${entry.name} ${(entry.percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [`${value.toFixed(1)}kg`, 'Weight']} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
              <p>No waste data available for this period</p>
            </div>
          )}
        </div>
      </div>

      {/* Predictive Analytics */}
      {predictions && (
        <div className="bg-white rounded-xl p-6 shadow-lg dark:bg-gray-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <ArrowTrendingUpIcon className="w-5 h-5 mr-2 text-blue-500" />
            Predictive Analytics - Next Week Forecast
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(predictions).map(([wasteType, prediction]) => (
              <div
                key={wasteType}
                className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900 dark:text-white capitalize">
                    {wasteType}
                  </h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    prediction.trend === 'increasing' 
                      ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                      : prediction.trend === 'decreasing'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-300'
                  }`}>
                    {prediction.trend}
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {prediction.nextWeek.toFixed(1)}kg
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {prediction.confidence}% confidence
                </p>
              </div>
            ))}
          </div>
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              💡 <strong>Insight:</strong> Based on your recent patterns, we predict your waste generation for next week. 
              Use this to plan your sorting activities and set reduction goals!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
