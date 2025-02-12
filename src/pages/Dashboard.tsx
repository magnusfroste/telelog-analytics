import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
  PhoneCall,
  MessageSquare,
  Clock,
  Users,
  BarChart3,
  Calendar,
  Upload,
  LogOut,
  Shield,
  Trash2,
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
import { addDays, subDays, startOfDay, endOfDay } from "date-fns";

const Dashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/auth');
    }
  };

  useEffect(() => {
    checkUser();
  }, []);

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
    queryKey: ["callLogs", currentDate],
    queryFn: async () => {
      const startDate = startOfDay(subDays(currentDate, 6)); // Start of 7 days ago
      const endDate = endOfDay(currentDate); // End of current day

      const { data, error } = await supabase
        .from("call_logs")
        .select("*")
        .gte('created', startDate.toISOString())
        .lte('created', endDate.toISOString())
        .order("created", { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  const handlePreviousWeek = () => {
    setCurrentDate(prev => subDays(prev, 7));
  };

  const handleNextWeek = () => {
    const nextDate = addDays(currentDate, 7);
    if (nextDate <= new Date()) { // Don't allow future dates
      setCurrentDate(nextDate);
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
    }, {});

    return Object.entries(stats).map(([name, value]) => ({
      name,
      value,
    }));
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          <CardContent className="p-6">
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="bg-gray-100/50 p-1">
                <TabsTrigger value="overview" className="data-[state=active]:bg-white">Overview</TabsTrigger>
                <TabsTrigger value="details" className="data-[state=active]:bg-white">Details</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-6">
                <div className="flex justify-between items-center mb-4">
                  <Button 
                    variant="outline" 
                    onClick={handlePreviousWeek}
                    className="bg-white/50 backdrop-blur-sm border border-gray-200"
                  >
                    Previous Week
                  </Button>
                  <span className="text-sm text-gray-500">
                    {formatDate(subDays(currentDate, 6).toISOString())} - {formatDate(currentDate.toISOString())}
                  </span>
                  <Button 
                    variant="outline" 
                    onClick={handleNextWeek}
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
                      <Tooltip labelFormatter={formatDate} />
                      <Line type="monotone" dataKey="call_time_phone" stroke="#8884d8" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
              
              <TabsContent value="details">
                <ScrollArea className="h-[400px] rounded-md border p-4">
                  <div className="space-y-6">
                    {callLogs?.map((log, index) => (
                      <Card key={index} className="bg-white/30">
                        <CardContent className="p-4">
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <p className="text-sm font-medium text-gray-500">Call Duration</p>
                              <p className="text-lg font-semibold">{log.call_time_phone}s</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-500">SMS Sent</p>
                              <p className="text-lg font-semibold">{log.sms_sent}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-500">SMS Received</p>
                              <p className="text-lg font-semibold">{log.sms_received}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
