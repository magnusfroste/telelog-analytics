
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

interface TokenUsage {
  model: string;
  input_tokens: number;
  output_tokens: number;
}

const Dashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [tokenUsage, setTokenUsage] = useState<TokenUsage | null>(null);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/auth');
    }
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

  const handleTokenUsageUpdate = (usage: TokenUsage) => {
    setTokenUsage(usage);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const rows = text.split('\n');
      const headers = rows[0].split(',');
      const records = rows.slice(1).map(row => {
        const values = row.split(',');
        return {
          teleq_id: values[0] ? parseInt(values[0]) : null,
          unique_task_id: values[1] || null,
          phone_no: values[2] || null,
          number_pres: values[3] || null,
          created: values[4] || null,
          scheduled_time: values[5] || null,
          closed: values[6] || null,
          form_closing: values[7] || null,
          first_contact: values[8] || null,
          created_on: values[9] || null,
          created_by: values[10] || null,
          category: values[11] || null,
          first_user_id: values[12] || null,
          last_user_id: values[13] || null,
          call_time_phone: values[14] ? parseInt(values[14]) : null,
          call_time_video: values[15] ? parseInt(values[15]) : null,
          customer_number: values[16] || null,
          sms_received: values[17] ? parseInt(values[17]) : null,
          sms_sent: values[18] ? parseInt(values[18]) : null,
          user_time: values[19] || null,
          post_tag_code: values[20] || null,
          type_of_task_closed: values[21] || null,
          recordings: values[22] ? parseInt(values[22]) : null,
          first_offered_time: values[23] || null,
          type_of_task_created: values[24] || null,
          e_identification: values[25] === 'true'
        };
      }).filter(record => record.teleq_id);

      const { error } = await supabase
        .from('call_logs')
        .insert(records);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Successfully imported ${records.length} records`,
      });

      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    }

    event.target.value = '';
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
    }));
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
    }));
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
          onFileUpload={handleFileUpload}
          onDeleteLogs={handleDeleteAllLogs}
          onLogout={handleLogout}
        />
        <MetricsCards metrics={metrics} />
        <CallsOverviewChart callLogs={callLogs} formatDate={formatDate} />
        <DistributionCharts 
          formClosingStats={formClosingStats}
          taskCreatedStats={taskCreatedStats}
          colors={COLORS}
        />
        
        {/* Developer Section */}
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
      <InsightsChatDrawer onTokenUsageUpdate={handleTokenUsageUpdate} />
    </div>
  );
};

export default Dashboard;
