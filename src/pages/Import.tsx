
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Upload } from "lucide-react";

const Import = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const text = await file.text();
      const rows = text.split('\n');
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
      }).filter(record => record.teleq_id);

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
              Upload your CSV file containing call center data. Make sure your file follows the required format.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-medium text-gray-900">CSV Template Format</h2>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <p className="text-sm text-gray-600">Your CSV file should include the following columns in order:</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <h3 className="font-medium text-gray-900">Required Columns:</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-600">
                    <li>teleq_id (number)</li>
                    <li>unique_task_id (text)</li>
                    <li>phone_no (text)</li>
                    <li>created (date)</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Optional Columns:</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-600">
                    <li>number_pres (text)</li>
                    <li>scheduled_time (date)</li>
                    <li>closed (date)</li>
                    <li>form_closing (text)</li>
                    <li>first_contact (text)</li>
                    <li>created_on (date)</li>
                    <li>created_by (text)</li>
                    <li>category (text)</li>
                    <li>first_user_id (text)</li>
                    <li>last_user_id (text)</li>
                    <li>call_time_phone (number)</li>
                    <li>call_time_video (number)</li>
                    <li>customer_number (text)</li>
                    <li>sms_received (number)</li>
                    <li>sms_sent (number)</li>
                    <li>user_time (text)</li>
                    <li>post_tag_code (text)</li>
                    <li>type_of_task_closed (text)</li>
                    <li>recordings (number)</li>
                    <li>first_offered_time (date)</li>
                    <li>type_of_task_created (text)</li>
                    <li>e_identification (boolean)</li>
                  </ul>
                </div>
              </div>
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
