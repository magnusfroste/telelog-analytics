
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

const Index = () => {
  const { toast } = useToast();

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
      const response = await fetch(
        'https://mngmsroqvkaurledgfvn.supabase.co/functions/v1/process-csv',
        {
          method: 'POST',
          headers: {
            'apikey': supabase.supabaseKey,
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

      // Refresh the data
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }

    // Reset the input
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
    <div className="flex min-h-screen bg-gray-50/90">
      <div className="flex-1 space-y-4 p-4 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Call Analytics</h2>
          <div className="flex items-center gap-4">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
              id="csv-upload"
            />
            <label htmlFor="csv-upload">
              <Button variant="outline" className="cursor-pointer" asChild>
                <span>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload CSV
                </span>
              </Button>
            </label>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>
          <TabsContent value="overview">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold">Overview</h3>
              <p className="text-xl text-gray-600">Call analytics overview</p>
            </div>
            <div className="mt-4">
              <p>Total Calls: {metrics.total}</p>
              <p>Average Duration: {metrics.avgDuration} seconds</p>
              <p>Total SMS: {metrics.totalSMS}</p>
            </div>
          </TabsContent>
          <TabsContent value="details">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold">Details</h3>
              <p className="text-xl text-gray-600">Detailed call logs</p>
            </div>
            <div className="mt-4">
              <ScrollArea>
                <div className="flex flex-col">
                  {callLogs?.map((log, index) => (
                    <div key={index} className="mb-4">
                      <p>Call Time: {log.call_time_phone}</p>
                      <p>SMS Sent: {log.sms_sent}</p>
                      <p>SMS Received: {log.sms_received}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
