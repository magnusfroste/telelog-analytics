
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface ChartData {
  name: string;
  value: number;
}

interface DistributionChartsProps {
  formClosingStats: ChartData[];
  taskCreatedStats: ChartData[];
  colors: string[];
}

const DistributionCharts = ({ formClosingStats, taskCreatedStats, colors }: DistributionChartsProps) => {
  return (
    <div className="grid grid-cols-2 gap-6">
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
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
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
                      style={{ backgroundColor: colors[index % colors.length] }}
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
        <CardHeader>
          <CardTitle>Task Type Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={taskCreatedStats}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {taskCreatedStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ScrollArea className="h-[200px] mt-4">
            <div className="space-y-2">
              {taskCreatedStats.map((stat, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-white/30 rounded">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: colors[index % colors.length] }}
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
  );
};

export default DistributionCharts;
