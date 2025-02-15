
import CallsOverviewChart from "@/components/dashboard/CallsOverviewChart";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DistributionCharts from "@/components/dashboard/DistributionCharts";
import MetricsCards from "@/components/dashboard/MetricsCards";
import { AnalysisSettings } from "@/components/dashboard/AnalysisSettings";
import DeveloperInfo from "@/components/dashboard/DeveloperInfo";
import { GenerateEmbeddings } from "@/components/dashboard/GenerateEmbeddings";
import { useState } from "react";

export default function Dashboard() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState("");
  const defaultSystemPrompt = ""; // You can set a default value here if needed

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <DashboardHeader />
      <MetricsCards />
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-7">
        <CallsOverviewChart />
        <DistributionCharts />
      </div>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <AnalysisSettings 
          isOpen={isSettingsOpen}
          onOpenChange={setIsSettingsOpen}
          defaultSystemPrompt={defaultSystemPrompt}
          systemPrompt={systemPrompt}
          onSystemPromptChange={setSystemPrompt}
        />
        <DeveloperInfo />
      </div>
      <div className="flex justify-end">
        <GenerateEmbeddings />
      </div>
    </div>
  );
}
