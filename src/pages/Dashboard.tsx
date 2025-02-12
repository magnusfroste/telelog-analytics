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
} from "recharts";
import { startOfDay, endOfDay, subDays, addDays } from "date-fns";

// Define types for our data
interface CallLog {
  created: string;
  call_time_phone: number;
  form_closing: string;
  sms_sent: number;
  sms_received: number;
  e_identification: boolean;
}

interface AggregatedData {
  created: string;
  call_time_phone: number;
  total_calls: number;
  form_closings: Record<string, number>;
}

interface FormClosingStat {
  name: string;
  value: number;
}

const COLORS = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7300",
  "#0088fe",
  "#00c49f",
  "#ffbb28",
  "#ff8042",
];

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
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const { data: callLogs, isLoading, refetch } = useQuery({
    queryKey: ["callLogs", currentDate],
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
      
      // Aggregate data by day
      const aggregatedData = typedData.reduce<Record<string, AggregatedData>>((acc, call) => {
        const day = startOfDay(new Date(call.created)).toISOString();
        if (!acc[day]) {
          acc[day] = {
            created: day,
            call_time_phone: 0,
            total_calls: 0,
            form_closings: {}
          };
        }
        acc[day].call_time_phone += call.call_time_phone || 0;
        acc[day].total_calls += 1;
        
        // Track form closings
        const formClosing = call.form_closing || 'Not Specified';
        acc[day].form_closings[formClosing] = (acc[day].form_closings[formClosing] || 0) + 1;
        
        return acc;
      }, {});

      return Object.values(aggregatedData).map(day => ({
        ...day,
        call_time_phone: Math.round(day.call_time_phone / day.total_calls)
      }));
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

  const getMetrics = () => {
    if (!callLogs) return { total: 0, avgDuration: 0, totalSMS: 0, eIdRate: 0 };
    
    return {
      total: callLogs.reduce((acc, day) => acc + day.total_calls, 0),
      avgDuration: Math.round(
        callLogs.reduce((acc, day) => acc + day.call_time_phone, 0) / callLogs.length
      ),
      totalSMS: 0, // We don't have SMS data in the aggregated data
      eIdRate: 0, // We don't have e-identification data in the aggregated data
    };
  };

  const getFormClosingStats = (): FormClosingStat[] => {
    if (!callLogs) return [];
    
    // Combine form closings from all days
    const combinedStats = callLogs.reduce((acc, day) => {
      Object.entries(day.form_closings).forEach(([category, count]) => {
        acc[category] = (acc[category] || 0) + count;
      });
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(combinedStats).map(([name, value]) => ({
      name,
      value,
    }));
  };

  const metrics = getMetrics();
  const formClosingStats = getFormClosingStats();

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString();
  };

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

        <Card className="bg-white/50 backdrop-blur-sm border border-gray-200">
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-4">
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentDate(prev => subDays(prev, 7))}
                  className="bg-white/50 backdrop-blur-sm border border-gray-200"
                >
                  Previous Week
                </Button>
                <span className="text-sm text-gray-500">
                  {formatDate(subDays(currentDate, 6).toISOString())} - {formatDate(currentDate.toISOString())}
                </span>
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentDate(prev => addDays(prev, 7))}
                  disabled={addDays(currentDate, 7) > new Date()}
                  className="bg-white/50 backdrop-blur-sm border border-gray-200"
                >
                  Next Week
                </Button>
              </div>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={callLogs || []}>
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
