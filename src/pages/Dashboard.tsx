
import { useEffect } from "react";
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
} from "recharts";

const Dashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

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

  const { data: callLogs, isLoading, refetch } = useQuery({
    queryKey: ["callLogs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("call_logs")
        .select("*")
        .order("created", { ascending: false })
        .limit(100);

      if (error) throw error;
      return data;
    },
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session found');

      const response = await fetch(
        'https://mngmsroqvkaurledgfvn.supabase.co/functions/v1/process-csv',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: formData,
        }
      );

      const result = await response.json();

      if (!response.ok) throw new Error(result.error);

      toast({
        title: "Success",
        description: result.message,
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
    if (!callLogs) return { total: 0, avgDuration: 0, totalSMS: 0 };
    return {
      total: callLogs.length,
      avgDuration: Math.round(
        callLogs.reduce((acc, log) => acc + (log.call_time_phone || 0), 0) /
          callLogs.length
      ),
      totalSMS:
        callLogs.reduce((acc, log) => acc + (log.sms_sent || 0), 0) +
        callLogs.reduce((acc, log) => acc + (log.sms_received || 0), 0),
    };
  };

  const metrics = getMetrics();

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
              onClick={handleLogout}
              className="bg-white/50 backdrop-blur-sm border border-gray-200 hover:bg-white/80 transition-all duration-300"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
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
        </div>

        <Card className="bg-white/50 backdrop-blur-sm border border-gray-200">
          <CardContent className="p-6">
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="bg-gray-100/50 p-1">
                <TabsTrigger value="overview" className="data-[state=active]:bg-white">Overview</TabsTrigger>
                <TabsTrigger value="details" className="data-[state=active]:bg-white">Details</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-6">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={callLogs || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="created" />
                      <YAxis />
                      <Tooltip />
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
