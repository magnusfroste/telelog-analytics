
import { Button } from "@/components/ui/button";
import { Upload, Trash2, LogOut, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface DashboardHeaderProps {
  onDeleteLogs: () => void;
  onLogout: () => void;
  onAnalysisSettings: () => void;
}

const DashboardHeader = ({ onDeleteLogs, onLogout, onAnalysisSettings }: DashboardHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-4xl font-semibold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
          Call Analytics
        </h2>
        <p className="text-gray-500 mt-2">Real-time insights into your call center performance</p>
      </div>
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          onClick={() => navigate('/import')}
          className="bg-white/50 backdrop-blur-sm border border-gray-200 hover:bg-white/80 transition-all duration-300"
        >
          <Upload className="mr-2 h-4 w-4" />
          Import Data
        </Button>
        <Button 
          variant="outline" 
          onClick={onAnalysisSettings}
          className="bg-white/50 backdrop-blur-sm border border-gray-200 hover:bg-white/80 transition-all duration-300"
        >
          <Settings className="mr-2 h-4 w-4" />
          Analysis Settings
        </Button>
        <Button 
          variant="outline" 
          onClick={onDeleteLogs}
          className="bg-white/50 backdrop-blur-sm border border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all duration-300"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete All Logs
        </Button>
        <Button 
          variant="outline" 
          onClick={onLogout}
          className="bg-white/50 backdrop-blur-sm border border-gray-200 hover:bg-white/80 transition-all duration-300"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
};

export default DashboardHeader;
