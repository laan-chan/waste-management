import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { 
  TrashIcon, 
  MapPinIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  WrenchScrewdriverIcon
} from "@heroicons/react/24/outline";

export default function BinStatus() {
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const binStatus = useQuery(api.bins.getBinStatus);
  const initializeBins = useMutation(api.bins.initializeBins);

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
            Bin status is for grown-up heroes! Ask an adult to help you check if the bins need emptying!
          </p>
          <div className="bg-white/70 rounded-lg p-4">
            <p className="text-gray-800 font-semibold">
              Keep sorting waste like the amazing hero you are! 🗂️♻️
            </p>
          </div>
        </div>
      </div>
    );
  }

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
      case "full": return <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />;
      case "warning": return <ClockIcon className="w-5 h-5 text-yellow-500" />;
      case "maintenance": return <WrenchScrewdriverIcon className="w-5 h-5 text-orange-500" />;
      default: return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
    }
  };

  const getWasteTypeIcon = (wasteType: string) => {
    switch (wasteType) {
      case "plastic": return "🍾";
      case "organic": return "🍌";
      case "paper": return "📄";
      case "glass": return "🍷";
      case "metal": return "🥤";
      case "electronic": return "📱";
      default: return "🗑️";
    }
  };

  const handleInitializeBins = async () => {
    try {
      await initializeBins();
      toast.success("Demo bins initialized successfully!");
    } catch (error) {
      toast.error("Failed to initialize bins. Please try again.");
    }
  };

  const groupedBins = binStatus?.reduce((acc, bin) => {
    if (!acc[bin.location]) {
      acc[bin.location] = [];
    }
    acc[bin.location].push(bin);
    return acc;
  }, {} as Record<string, typeof binStatus>) || {};

  const statusCounts = binStatus?.reduce((acc, bin) => {
    acc[bin.status] = (acc[bin.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 shadow-lg dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <TrashIcon className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Smart Bin Status
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Monitor waste bin levels and collection schedules
              </p>
            </div>
          </div>
          {(!binStatus || binStatus.length === 0) && (
            <button
              onClick={handleInitializeBins}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Initialize Demo Bins
            </button>
          )}
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-lg dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Bins</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {binStatus?.length || 0}
              </p>
            </div>
            <TrashIcon className="w-8 h-8 text-gray-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-lg dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Normal</p>
              <p className="text-2xl font-bold text-green-600">
                {statusCounts.normal || 0}
              </p>
            </div>
            <CheckCircleIcon className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-lg dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Warning</p>
              <p className="text-2xl font-bold text-yellow-600">
                {statusCounts.warning || 0}
              </p>
            </div>
            <ClockIcon className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-lg dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Full</p>
              <p className="text-2xl font-bold text-red-600">
                {statusCounts.full || 0}
              </p>
            </div>
            <ExclamationTriangleIcon className="w-8 h-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Bins by Location */}
      {Object.keys(groupedBins).length > 0 ? (
        <div className="space-y-6">
          {Object.entries(groupedBins).map(([location, bins]) => (
            <div key={location} className="bg-white rounded-xl p-6 shadow-lg dark:bg-gray-800">
              <div className="flex items-center space-x-3 mb-6">
                <MapPinIcon className="w-6 h-6 text-blue-500" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {location}
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {bins.map((bin) => (
                  <div
                    key={bin._id}
                    className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border-l-4 border-gray-300"
                    style={{
                      borderLeftColor: 
                        bin.status === 'full' ? '#EF4444' :
                        bin.status === 'warning' ? '#F59E0B' :
                        bin.status === 'maintenance' ? '#F97316' :
                        '#10B981'
                    }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">{getWasteTypeIcon(bin.wasteType)}</span>
                        <span className="font-medium text-gray-900 dark:text-white capitalize">
                          {bin.wasteType}
                        </span>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getBinStatusColor(bin.status)}`}>
                        {bin.status}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-300">Level:</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {bin.currentLevel}/{bin.capacity}
                        </span>
                      </div>
                      
                      <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-600">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            bin.status === 'full' ? 'bg-red-500' :
                            bin.status === 'warning' ? 'bg-yellow-500' :
                            'bg-green-500'
                          }`}
                          style={{ width: `${Math.min((bin.currentLevel / bin.capacity) * 100, 100)}%` }}
                        ></div>
                      </div>
                      
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>0%</span>
                        <span>{Math.round((bin.currentLevel / bin.capacity) * 100)}%</span>
                        <span>100%</span>
                      </div>
                      
                      <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
                        <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                          <ClockIcon className="w-3 h-3" />
                          <span>Last: {new Date(bin.lastCollection).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400 mt-1">
                          <span>ID: {bin.sensorId}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl p-8 shadow-lg dark:bg-gray-800 text-center">
          <TrashIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No Bins Available
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Initialize demo bins to see the smart bin monitoring system in action.
          </p>
          <button
            onClick={handleInitializeBins}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Initialize Demo Bins
          </button>
        </div>
      )}

      {/* Legend */}
      {binStatus && binStatus.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-lg dark:bg-gray-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Status Legend
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
              <CheckCircleIcon className="w-5 h-5 text-green-500" />
              <span className="text-sm text-gray-600 dark:text-gray-300">Normal (0-74%)</span>
            </div>
            <div className="flex items-center space-x-2">
              <ClockIcon className="w-5 h-5 text-yellow-500" />
              <span className="text-sm text-gray-600 dark:text-gray-300">Warning (75-89%)</span>
            </div>
            <div className="flex items-center space-x-2">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
              <span className="text-sm text-gray-600 dark:text-gray-300">Full (90%+)</span>
            </div>
            <div className="flex items-center space-x-2">
              <WrenchScrewdriverIcon className="w-5 h-5 text-orange-500" />
              <span className="text-sm text-gray-600 dark:text-gray-300">Maintenance</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
