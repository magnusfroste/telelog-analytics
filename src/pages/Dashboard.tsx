import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import MetricsCards from "@/components/dashboard/MetricsCards";
import CallsOverviewChart from "@/components/dashboard/CallsOverviewChart";
import DistributionCharts from "@/components/dashboard/DistributionCharts";
import InsightsChatDrawer from '@/components/InsightsChatDrawer';
import { Settings } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

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
  const { toast } = useToast();
  const navigate = useNavigate();
  const [tokenUsage, setTokenUsage] = useState<TokenUsage | null>(null);
  const [systemPrompt, setSystemPrompt] = useState(
    localStorage.getItem('systemPrompt') || DEFAULT_SYSTEM_PROMPT
  );
  const [isEditing, setIsEditing] = useState(false);
  const [tempPrompt, setTempPrompt] = useState(systemPrompt);

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

  const handleSavePrompt = () => {
    setSystemPrompt(tempPrompt);
    localStorage.setItem('systemPrompt', tempPrompt);
    setIsEditing(false);
    toast({
      title: "Success",
      description: "System prompt has been updated",
    });
  };

  const handleResetPrompt = () => {
    setTempPrompt(DEFAULT_SYSTEM_PROMPT);
    setSystemPrompt(DEFAULT_SYSTEM_PROMPT);
    localStorage.setItem('systemPrompt', DEFAULT_SYSTEM_PROMPT);
    setIsEditing(false);
    toast({
      title: "Success",
      description: "System prompt has been reset to default",
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const handleDeleteAllLogs = async () => {
    if (!window.confirm('Are you sure you want to delete all logs? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('call_logs')
        .delete()
        .neq('id', 0);

      if (error) throw error;

      toast({
        title: "Success",
        description: "All logs have been deleted",
      });

      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    }
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
      <div className="flex-1 space-y-6 p-8">
        <DashboardHeader 
          onDeleteLogs={handleDeleteAllLogs}
          onLogout={handleLogout}
        />
        <MetricsCards metrics={metrics} />
        <CallsOverviewChart callLogs={callLogs || []} formatDate={formatDate} />
        <DistributionCharts 
          formClosingStats={formClosingStats}
          taskCreatedStats={taskCreatedStats}
          colors={COLORS}
        />
        
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Settings className="h-4 w-4" />
              Analysis Settings
            </Button>
          </SheetTrigger>
          <SheetContent className="w-[600px] sm:w-[540px]">
            <SheetHeader>
              <SheetTitle>Analysis Settings</SheetTitle>
              <SheetDescription>
                Customize how the AI analyzes your call center data
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6 space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">System Prompt</label>
                <Textarea
                  value={tempPrompt}
                  onChange={(e) => {
                    setTempPrompt(e.target.value);
                    setIsEditing(true);
                  }}
                  className="h-[300px]"
                  placeholder="Enter system prompt..."
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={handleResetPrompt}
                >
                  Reset to Default
                </Button>
                <Button
                  onClick={handleSavePrompt}
                  disabled={!isEditing}
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
        
        <div className="bg-white/50 backdrop-blur-sm border border-gray-200 rounded-lg p-4 mt-8">
          <h3 className="text-sm font-semibold mb-2 text-gray-700">Developer Information</h3>
          <div className="space-y-1 text-sm text-gray-600">
            <p>Model: {tokenUsage?.model || 'No analysis performed yet'}</p>
            <p>Input Tokens: {tokenUsage?.input_tokens || 0}</p>
            <p>Output Tokens: {tokenUsage?.output_tokens || 0}</p>
            <p>Total Tokens: {tokenUsage ? tokenUsage.input_tokens + tokenUsage.output_tokens : 0}</p>
          </div>
        </div>
      </div>
      <InsightsChatDrawer onTokenUsageUpdate={setTokenUsage} systemPrompt={systemPrompt} />
    </div>
  );
};

export default Dashboard;
