
import CallsOverviewChart from "@/components/dashboard/CallsOverviewChart";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DistributionCharts from "@/components/dashboard/DistributionCharts";
import MetricsCards from "@/components/dashboard/MetricsCards";
import { AnalysisSettings } from "@/components/dashboard/AnalysisSettings";
import DeveloperInfo from "@/components/dashboard/DeveloperInfo";
import { GenerateEmbeddings } from "@/components/dashboard/GenerateEmbeddings";
import { useState } from "react";

// Default metrics data
const defaultMetrics = {
  total: 0,
  avgDuration: 0,
  totalSMS: 0,
  eIdRate: 0
};

// Default chart data
const defaultChartData = {
  formClosingStats: [
    { name: "Completed", value: 0 },
    { name: "Cancelled", value: 0 },
  ],
  taskCreatedStats: [
    { name: "Task A", value: 0 },
    { name: "Task B", value: 0 },
  ],
  colors: ["#4CAF50", "#2196F3", "#FFC107", "#E91E63", "#9C27B0"]
};

export default function Dashboard() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState("");
  const defaultSystemPrompt = ""; // You can set a default value here if needed

  // Handlers for DashboardHeader
  const handleDeleteLogs = () => {
    console.log("Delete logs");
  };

  const handleLogout = () => {
    console.log("Logout");
  };

  const handleAnalysisSettings = () => {
    setIsSettingsOpen(true);
  };

  // Format date function for CallsOverviewChart
  const formatDate = (dateStr: string | number) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString();
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <DashboardHeader 
        onDeleteLogs={handleDeleteLogs}
        onLogout={handleLogout}
        onAnalysisSettings={handleAnalysisSettings}
      />
      <MetricsCards metrics={defaultMetrics} />
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-7">
        <CallsOverviewChart 
          callLogs={[]} 
          formatDate={formatDate}
        />
        <DistributionCharts 
          formClosingStats={defaultChartData.formClosingStats}
          taskCreatedStats={defaultChartData.taskCreatedStats}
          colors={defaultChartData.colors}
        />
      </div>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <AnalysisSettings 
          isOpen={isSettingsOpen}
          onOpenChange={setIsSettingsOpen}
          defaultSystemPrompt={defaultSystemPrompt}
          systemPrompt={systemPrompt}
          onSystemPromptChange={setSystemPrompt}
        />
        <DeveloperInfo tokenUsage={0} />
      </div>
      <div className="flex justify-end">
        <GenerateEmbeddings />
      </div>
    </div>
  );
}
