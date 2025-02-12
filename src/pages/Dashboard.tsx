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
  Shield,
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

  const metrics = getMetrics();

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
              onClick={handleLogout}
              className="bg-white/50 backdrop-blur-sm border border-gray-200 hover:bg-white/80 transition-all duration-300"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
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
