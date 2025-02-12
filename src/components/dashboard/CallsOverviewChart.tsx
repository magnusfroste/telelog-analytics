
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CallLog {
  created: string;
  call_time_phone: number;
  sms_sent: number;
  sms_received: number;
}

interface CallsOverviewChartProps {
  callLogs: CallLog[] | null;
  formatDate: (dateStr: string | number) => string;
}

const CallsOverviewChart = ({ callLogs, formatDate }: CallsOverviewChartProps) => {
  return (
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
                    tickFormatter={(value: string) => formatDate(value)}
                    angle={-45}
                    textAnchor="end"
                    height={70}
                  />
                  <YAxis />
                  <Tooltip labelFormatter={(value: string) => formatDate(value)} />
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
  );
};

export default CallsOverviewChart;
