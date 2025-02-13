
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Upload } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface ColumnConfig {
  name: string;
  type: string;
  required?: boolean;
  defaultSelected?: boolean;
}

const COLUMNS: ColumnConfig[] = [
  { name: 'teleq_id', type: 'number', required: true, defaultSelected: true },
  { name: 'created', type: 'date', required: true, defaultSelected: true },
  { name: 'form_closing', type: 'text', defaultSelected: true },
  { name: 'category', type: 'text', defaultSelected: true },
  { name: 'call_time_phone', type: 'number', defaultSelected: true },
  { name: 'sms_sent', type: 'number', defaultSelected: true },
  { name: 'type_of_task_closed', type: 'text', defaultSelected: true },
  { name: 'e_identification', type: 'boolean', defaultSelected: true },
  { name: 'unique_task_id', type: 'text' },
  { name: 'phone_no', type: 'text' },
  { name: 'number_pres', type: 'text' },
  { name: 'scheduled_time', type: 'date' },
  { name: 'closed', type: 'date' },
  { name: 'first_contact', type: 'text' },
  { name: 'created_on', type: 'date' },
  { name: 'created_by', type: 'text' },
  { name: 'first_user_id', type: 'text' },
  { name: 'last_user_id', type: 'text' },
  { name: 'call_time_video', type: 'number' },
  { name: 'customer_number', type: 'text' },
  { name: 'sms_received', type: 'number' },
  { name: 'user_time', type: 'text' },
  { name: 'post_tag_code', type: 'text' },
  { name: 'recordings', type: 'number' },
  { name: 'first_offered_time', type: 'date' },
  { name: 'type_of_task_created', type: 'text' }
];

const Import = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState<string[]>(
    COLUMNS.filter(col => col.defaultSelected || col.required).map(col => col.name)
  );

  const handleColumnToggle = (columnName: string, checked: boolean) => {
    if (checked) {
      setSelectedColumns(prev => [...prev, columnName]);
    } else {
      setSelectedColumns(prev => prev.filter(col => col !== columnName));
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const text = await file.text();
      const rows = text.split('\n');
      const records = rows.slice(1).map(row => {
        const values = row.split(',');
        const record: Record<string, any> = {};
        
        selectedColumns.forEach((columnName, index) => {
          const column = COLUMNS.find(col => col.name === columnName);
          const value = values[index];
          
          if (column) {
            switch (column.type) {
              case 'number':
                record[columnName] = value ? parseInt(value) : null;
                break;
              case 'boolean':
                record[columnName] = value === 'true';
                break;
              default:
                record[columnName] = value || null;
            }
          }
        });
        
        return record;
      }).filter(record => record.teleq_id);

      // First store the selected columns
      const { error: metadataError } = await supabase
        .from('analysis_config')
        .upsert({ 
          id: 'selected_columns',
          columns: selectedColumns 
        });

      if (metadataError) throw metadataError;

      // Then insert the records
      const { error } = await supabase
        .from('call_logs')
        .insert(records);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Successfully imported ${records.length} records`,
      });

      navigate('/dashboard');
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Import Call Logs</h1>
            <p className="text-gray-500 mt-2">
              Upload your CSV file containing call center data. Select the columns you want to include in the analysis.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-medium text-gray-900">Column Selection</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {COLUMNS.map((column) => (
                <div key={column.name} className="flex items-center space-x-2">
                  <Checkbox
                    id={column.name}
                    checked={selectedColumns.includes(column.name)}
                    onCheckedChange={(checked) => {
                      if (!column.required) {
                        handleColumnToggle(column.name, checked as boolean);
                      }
                    }}
                    disabled={column.required}
                  />
                  <Label
                    htmlFor={column.name}
                    className="text-sm cursor-pointer"
                  >
                    {column.name}
                    {column.required && <span className="text-red-500 ml-1">*</span>}
                    <span className="text-gray-500 ml-1">({column.type})</span>
                  </Label>
                </div>
              ))}
            </div>

            <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
                id="csv-upload"
              />
              <label htmlFor="csv-upload">
                <div className="flex flex-col items-center cursor-pointer">
                  <Upload className="h-12 w-12 text-gray-400" />
                  <span className="mt-2 text-sm font-medium text-gray-900">
                    {isUploading ? "Uploading..." : "Click to upload CSV"}
                  </span>
                  <span className="mt-1 text-xs text-gray-500">
                    Only .csv files are supported
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Import;
