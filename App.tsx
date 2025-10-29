import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { useState } from "react";
import Dashboard from "./components/Dashboard";
import LogWaste from "./components/LogWaste";
import Analytics from "./components/Analytics";
import Rewards from "./components/Rewards";
import Camera from "./components/Camera";
import AdminPanel from "./components/AdminPanel";
import BinStatus from "./components/BinStatus";
import { 
  HomeIcon, 
  PlusCircleIcon, 
  ChartBarIcon, 
  GiftIcon, 
  CameraIcon,
  CogIcon,
  TrashIcon,
  SunIcon,
  MoonIcon
} from "@heroicons/react/24/outline";

export default function App() {
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [darkMode, setDarkMode] = useState(false);
  const loggedInUser = useQuery(api.auth.loggedInUser);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  };

  const isChildMode = loggedInUser?.mode === "child";
  const isAdmin = loggedInUser?.role === "admin";

  const navigation = [
    { id: "dashboard", name: "Home", icon: HomeIcon, childFriendly: true },
    { id: "log-waste", name: "Log Waste", icon: PlusCircleIcon, childFriendly: true },
    { id: "analytics", name: "Insights", icon: ChartBarIcon, childFriendly: false },
    { id: "rewards", name: "Rewards", icon: GiftIcon, childFriendly: true },
    { id: "camera", name: "Camera", icon: CameraIcon, childFriendly: true },
    { id: "bins", name: "Bin Status", icon: TrashIcon, childFriendly: false },
    ...(isAdmin ? [{ id: "admin", name: "Admin", icon: CogIcon, childFriendly: false }] : []),
  ].filter(item => !isChildMode || item.childFriendly);

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard />;
      case "log-waste":
        return <LogWaste />;
      case "analytics":
        return <Analytics />;
      case "rewards":
        return <Rewards />;
      case "camera":
        return <Camera />;
      case "bins":
        return <BinStatus />;
      case "admin":
        return isAdmin ? <AdminPanel /> : <Dashboard />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className={`min-h-screen flex flex-col ${darkMode ? 'dark' : ''} ${isChildMode ? 'bg-gradient-to-br from-green-100 via-blue-50 to-purple-100' : 'bg-gray-50'} dark:bg-gray-900`}>
      <header className={`sticky top-0 z-10 ${isChildMode ? 'bg-gradient-to-r from-green-400 to-blue-500' : 'bg-white/80 backdrop-blur-sm'} h-16 flex justify-between items-center border-b shadow-sm px-4 dark:bg-gray-800/80`}>
        <div className="flex items-center space-x-3">
          <div className={`w-8 h-8 ${isChildMode ? 'bg-white' : 'bg-green-500'} rounded-full flex items-center justify-center`}>
            <span className={`text-lg ${isChildMode ? 'text-green-500' : 'text-white'}`}>🌱</span>
          </div>
          <h2 className={`text-xl font-bold ${isChildMode ? 'text-white' : 'text-green-600'} dark:text-green-400`}>
            {isChildMode ? "Eco Heroes" : "Smart Waste Tracker"}
          </h2>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-lg ${isChildMode ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'} hover:bg-opacity-80 transition-colors dark:bg-gray-700 dark:text-gray-300`}
          >
            {darkMode ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
          </button>
          <SignOutButton />
        </div>
      </header>

      <div className="flex-1 flex">
        <Authenticated>
          {/* Sidebar Navigation */}
          <nav className={`w-64 ${isChildMode ? 'bg-white/90 backdrop-blur-sm' : 'bg-white'} border-r shadow-sm dark:bg-gray-800 dark:border-gray-700`}>
            <div className="p-4">
              <div className={`mb-6 p-4 rounded-lg ${isChildMode ? 'bg-gradient-to-r from-yellow-200 to-orange-200' : 'bg-green-50'} dark:bg-gray-700`}>
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 ${isChildMode ? 'bg-gradient-to-r from-purple-400 to-pink-400' : 'bg-green-100'} rounded-full flex items-center justify-center dark:bg-gray-600`}>
                    <span className="text-xl">{isChildMode ? "🦸‍♀️" : "👤"}</span>
                  </div>
                  <div>
                    <p className={`font-semibold ${isChildMode ? 'text-purple-800' : 'text-gray-900'} dark:text-white`}>
                      {loggedInUser?.name || "Eco Warrior"}
                    </p>
                    <p className={`text-sm ${isChildMode ? 'text-purple-600' : 'text-gray-600'} dark:text-gray-300`}>
                      {isChildMode ? `Level ${loggedInUser?.level || 1} Hero` : `${loggedInUser?.totalPoints || 0} points`}
                    </p>
                  </div>
                </div>
              </div>

              <ul className="space-y-2">
                {navigation.map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => setCurrentPage(item.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                        currentPage === item.id
                          ? isChildMode 
                            ? 'bg-gradient-to-r from-green-400 to-blue-500 text-white shadow-lg' 
                            : 'bg-green-50 text-green-700 border-l-4 border-green-500 dark:bg-green-900 dark:text-green-300'
                          : isChildMode
                            ? 'text-gray-700 hover:bg-gradient-to-r hover:from-green-200 hover:to-blue-200'
                            : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{item.name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </nav>

          {/* Main Content */}
          <main className="flex-1 overflow-auto">
            <div className="p-6">
              {renderPage()}
            </div>
          </main>
        </Authenticated>

        <Unauthenticated>
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="w-full max-w-md mx-auto">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl text-white">🌱</span>
                </div>
                <h1 className="text-4xl font-bold text-green-600 mb-4 dark:text-green-400">
                  Smart Waste Tracker
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300">
                  Join the eco-revolution! Track, sort, and save the planet one piece of waste at a time.
                </p>
              </div>
              <SignInForm />
            </div>
          </div>
        </Unauthenticated>
      </div>
      
      <Toaster />
    </div>
  );
}
