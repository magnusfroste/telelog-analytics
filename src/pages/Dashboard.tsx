
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import MetricsCards from "@/components/dashboard/MetricsCards";
import CallsOverviewChart from "@/components/dashboard/CallsOverviewChart";
import DistributionCharts from "@/components/dashboard/DistributionCharts";
import InsightsChatDrawer from '@/components/InsightsChatDrawer';
import AnalysisSettings from "@/components/dashboard/AnalysisSettings";
import DeveloperInfo from "@/components/dashboard/DeveloperInfo";

interface TokenUsage {
  model: string;
  input_tokens: number;
  output_tokens: number;
}

interface ChartData {
  name: string;
  value: number;
}

const DEFAULT_SYSTEM_PROMPT = `You are a concise analytics assistant for call center data. Focus on providing exactly THREE key insights or recommendations. Your responses should be:
- Brief and data-driven
- Backed by specific numbers and percentages
- Focused on actionable improvements

Structure your response with exactly three bullet points. Base your analysis only on the available data, highlighting the most impactful trends or opportunities for improvement.`;

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tokenUsage, setTokenUsage] = useState<TokenUsage | null>(null);
  const [systemPrompt, setSystemPrompt] = useState(
    localStorage.getItem('systemPrompt') || DEFAULT_SYSTEM_PROMPT
  );
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const { data: callLogs, isLoading, refetch } = useQuery({
    queryKey: ["callLogs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("call_logs")
        .select("*")
        .order("created", { ascending: false })
        .limit(1000);

      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/auth');
    }
  };

  const handleDeleteAllLogs = async () => {
    toast({
      title: "Information",
      description: "Not implemented in PoC",
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const handleSystemPromptChange = (newPrompt: string) => {
    setSystemPrompt(newPrompt);
    localStorage.setItem('systemPrompt', newPrompt);
  };

  const getMetrics = () => {
    if (!callLogs) return { total: 0, avgDuration: 0, totalSMS: 0, eIdRate: 0 };
    
    const totalWithEid = callLogs.filter(log => log.e_identification).length;
    
    return {
      total: callLogs.length,
      avgDuration: Math.round(
        callLogs.reduce((acc, log) => acc + (log.call_time_phone || 0), 0) /
          callLogs.length
      ),
      totalSMS:
        callLogs.reduce((acc, log) => acc + (log.sms_sent || 0), 0) +
        callLogs.reduce((acc, log) => acc + (log.sms_received || 0), 0),
      eIdRate: Math.round((totalWithEid / callLogs.length) * 100)
    };
  };

  const getFormClosingStats = () => {
    if (!callLogs) return [];
    
    const stats = callLogs.reduce((acc, log) => {
      const formClosing = log.form_closing || 'Not Specified';
      acc[formClosing] = (acc[formClosing] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(stats).map(([name, value]) => ({
      name,
      value,
    })) as ChartData[];
  };

  const getTaskCreatedStats = () => {
    if (!callLogs) return [];
    
    const stats = callLogs.reduce((acc, log) => {
      const taskType = log.type_of_task_created || 'Not Specified';
      acc[taskType] = (acc[taskType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(stats).map(([name, value]) => ({
      name,
      value,
    })) as ChartData[];
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
  const metrics = getMetrics();
  const formClosingStats = getFormClosingStats();
  const taskCreatedStats = getTaskCreatedStats();

  const formatDate = (dateStr: string | number) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString();
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="flex-1 space-y-4 md:space-y-6 p-4 md:p-8">
        <DashboardHeader 
          onDeleteLogs={handleDeleteAllLogs}
          onLogout={handleLogout}
          onAnalysisSettings={() => setIsSettingsOpen(true)}
        />
        <MetricsCards metrics={metrics} />
        <CallsOverviewChart callLogs={callLogs || []} formatDate={formatDate} />
        <DistributionCharts 
          formClosingStats={formClosingStats}
          taskCreatedStats={taskCreatedStats}
          colors={COLORS}
        />
        
        <AnalysisSettings 
          isOpen={isSettingsOpen}
          onOpenChange={setIsSettingsOpen}
          defaultSystemPrompt={DEFAULT_SYSTEM_PROMPT}
          systemPrompt={systemPrompt}
          onSystemPromptChange={handleSystemPromptChange}
        />
        
        <DeveloperInfo tokenUsage={tokenUsage} />
      </div>
      <InsightsChatDrawer onTokenUsageUpdate={setTokenUsage} systemPrompt={systemPrompt} />
    </div>
  );
};

export default Dashboard;
