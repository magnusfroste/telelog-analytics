
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
  PhoneCall,
  MessageSquare,
  Clock,
  Shield,
  Trash2,
  LogOut,
  Upload,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
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
} from "recharts";
import { startOfDay, endOfDay, subDays, addDays, startOfMonth, endOfMonth, format } from "date-fns";

interface CallLog {
  created: string;
  call_time_phone: number;
  e_identification: boolean;
}

interface DailyStats {
  created: string;
  call_time_phone: number;
  total_calls: number;
}

interface MonthlyStats {
  created: string;
  total_calls: number;
}

const Dashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());

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
    navigate('/auth');
  };

  const handleDeleteAllLogs = async () => {
    if (!window.confirm('Are you sure you want to delete all logs? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('call_logs')
        .delete()
        .neq('id', 0); // This deletes all records

      if (error) throw error;

      toast({
        title: "Success",
        description: "All logs have been deleted",
      });

      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
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
        .limit(1000); // Increased from 100 to 1000 rows

      if (error) throw error;
      return data;
    },
  });

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
      }).filter(record => record.teleq_id); // Filter out empty rows

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
        description: error.message,
        variant: "destructive",
      });
    }

    event.target.value = '';
  };

  const { data: weeklyCallLogs, isLoading: weeklyLoading, refetch: refetchWeekly } = useQuery({
    queryKey: ["weeklyCallLogs", currentDate],
    queryFn: async () => {
      const startDate = startOfDay(subDays(currentDate, 6));
      const endDate = endOfDay(currentDate);

      const { data, error } = await supabase
        .from("call_logs")
        .select("*")
        .gte('created', startDate.toISOString())
        .lte('created', endDate.toISOString())
        .order("created", { ascending: true });

      if (error) throw error;

      const typedData = data as CallLog[];
      const aggregatedData: Record<string, DailyStats> = {};

      typedData.forEach((call) => {
        const day = startOfDay(new Date(call.created)).toISOString();
        if (!aggregatedData[day]) {
          aggregatedData[day] = {
            created: day,
            call_time_phone: 0,
            total_calls: 0
          };
        }
        aggregatedData[day].call_time_phone += call.call_time_phone || 0;
        aggregatedData[day].total_calls += 1;
      });

      return Object.values(aggregatedData).map(day => ({
        ...day,
        call_time_phone: day.total_calls > 0 ? Math.round(day.call_time_phone / day.total_calls) : 0
      }));
    },
  });

  const { data: monthlyCallLogs, isLoading: monthlyLoading } = useQuery({
    queryKey: ["monthlyCallLogs", currentDate],
    queryFn: async () => {
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);

      const { data, error } = await supabase
        .from("call_logs")
        .select("*")
        .gte('created', monthStart.toISOString())
        .lte('created', monthEnd.toISOString())
        .order("created", { ascending: true });

      if (error) throw error;

      const typedData = data as CallLog[];
      const aggregatedData: Record<string, MonthlyStats> = {};

      typedData.forEach((call) => {
        const day = startOfDay(new Date(call.created)).toISOString();
        if (!aggregatedData[day]) {
          aggregatedData[day] = {
            created: day,
            total_calls: 0
          };
        }
        aggregatedData[day].total_calls += 1;
      });

      return Object.values(aggregatedData);
    },
  });

  const getMetrics = () => {
    if (!weeklyCallLogs) return { total: 0, avgDuration: 0, totalSMS: 0, eIdRate: 0 };
    
    const total = weeklyCallLogs.reduce((acc, day) => acc + day.total_calls, 0);
    const avgDuration = weeklyCallLogs.length > 0
      ? Math.round(weeklyCallLogs.reduce((acc, day) => acc + day.call_time_phone, 0) / weeklyCallLogs.length)
      : 0;
    
    return {
      total,
      avgDuration,
      totalSMS: 0,
      eIdRate: 0
    };
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    return format(new Date(dateStr), 'MMM dd');
  };

  const metrics = getMetrics();

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

  const formClosingStats = getFormClosingStats();

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="flex-1 space-y-6 p-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-4xl font-semibold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Call Analytics
            </h2>
            <p className="text-gray-500 mt-2">Real-time insights into your call center performance</p>
          </div>
          <div className="flex items-center gap-4">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
              id="csv-upload"
            />
            <label htmlFor="csv-upload">
              <Button variant="outline" className="cursor-pointer bg-white/50 backdrop-blur-sm border border-gray-200 hover:bg-white/80 transition-all duration-300" asChild>
                <span>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload CSV
                </span>
              </Button>
            </label>
            <Button 
              variant="outline" 
              onClick={handleDeleteAllLogs}
              className="bg-white/50 backdrop-blur-sm border border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all duration-300"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete All Logs
            </Button>
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="bg-white/50 backdrop-blur-sm border border-gray-200 hover:bg-white/80 transition-all duration-300"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <Card className="bg-white/50 backdrop-blur-sm border border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Calls</CardTitle>
              <PhoneCall className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.total}</div>
              <p className="text-xs text-gray-500">Processed calls</p>
            </CardContent>
          </Card>
          <Card className="bg-white/50 backdrop-blur-sm border border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Duration</CardTitle>
              <Clock className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.avgDuration}s</div>
              <p className="text-xs text-gray-500">Per call</p>
            </CardContent>
          </Card>
          <Card className="bg-white/50 backdrop-blur-sm border border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total SMS</CardTitle>
              <MessageSquare className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalSMS}</div>
              <p className="text-xs text-gray-500">Messages exchanged</p>
            </CardContent>
          </Card>
          <Card className="bg-white/50 backdrop-blur-sm border border-gray-200 relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Digital Identity Rate</CardTitle>
              <Shield className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.eIdRate}%</div>
              <p className="text-xs text-gray-500">Verified calls</p>
            </CardContent>
            <div 
              className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-green-500 to-emerald-500" 
              style={{ width: `${metrics.eIdRate}%` }}
            />
          </Card>
        </div>

        <Card className="bg-white/50 backdrop-blur-sm border border-gray-200">
          <CardHeader>
            <CardTitle>Weekly Call Duration</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyCallLogs || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="created" 
                    tickFormatter={formatDate}
                    angle={-45}
                    textAnchor="end"
                    height={70}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={formatDate}
                    formatter={(value, name) => {
                      if (name === 'call_time_phone') return [`${value}s`, 'Avg. Duration'];
                      return [value, name];
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="call_time_phone" 
                    stroke="#8884d8" 
                    name="Average Duration"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/50 backdrop-blur-sm border border-gray-200">
          <CardHeader>
            <CardTitle>Monthly Call Volume</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyCallLogs || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="created" 
                    tickFormatter={formatDate}
                    angle={-45}
                    textAnchor="end"
                    height={70}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={formatDate}
                    formatter={(value) => [`${value} calls`, 'Total Calls']}
                  />
                  <Bar 
                    dataKey="total_calls" 
                    fill="#82ca9d" 
                    name="Total Calls"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/50 backdrop-blur-sm border border-gray-200">
          <CardHeader>
            <CardTitle>Form Closing Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={formClosingStats}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {formClosingStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ScrollArea className="h-[200px] mt-4">
              <div className="space-y-2">
                {formClosingStats.map((stat, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-white/30 rounded">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span>{stat.name}</span>
                    </div>
                    <span className="font-semibold">{stat.value} calls</span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
