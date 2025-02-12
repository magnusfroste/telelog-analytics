
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PhoneCall, MessageSquare, Clock, Shield } from "lucide-react";

interface MetricsCardsProps {
  metrics: {
    total: number;
    avgDuration: number;
    totalSMS: number;
    eIdRate: number;
  };
}

const MetricsCards = ({ metrics }: MetricsCardsProps) => {
  return (
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
  );
};

export default MetricsCards;
