
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { parse } from 'https://deno.land/std@0.181.0/encoding/csv.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function parseDate(dateStr: string | null): string | null {
  if (!dateStr) return null;
  
  try {
    // Handle year-only dates
    if (/^\d{4}$/.test(dateStr)) {
      return `${dateStr}-01-01T00:00:00Z`;
    }
    
    // Try parsing the date and format it properly
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      return null;
    }
    return date.toISOString();
  } catch {
    return null;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const formData = await req.formData()
    const file = formData.get('file')

    if (!file) {
      throw new Error('No file uploaded')
    }

    const text = await file.text()
    const rows = parse(text, { skipFirstRow: true })

    const records = rows.map(row => ({
      teleq_id: row[0] ? parseInt(row[0]) : null,
      unique_task_id: row[1] || null,
      phone_no: row[2] || null,
      number_pres: row[3] || null,
      created: parseDate(row[4]),
      scheduled_time: parseDate(row[5]),
      closed: parseDate(row[6]),
      form_closing: row[7] || null,
      first_contact: parseDate(row[8]),
      created_on: parseDate(row[9]),
      created_by: row[10] || null,
      category: row[11] || null,
      first_user_id: row[12] || null,
      last_user_id: row[13] || null,
      call_time_phone: row[14] ? parseInt(row[14]) : null,
      call_time_video: row[15] ? parseInt(row[15]) : null,
      customer_number: row[16] || null,
      sms_received: row[17] ? parseInt(row[17]) : null,
      sms_sent: row[18] ? parseInt(row[18]) : null,
      user_time: row[19] || null,
      post_tag_code: row[20] || null,
      type_of_task_closed: row[21] || null,
      recordings: row[22] ? parseInt(row[22]) : null,
      first_offered_time: parseDate(row[23]),
      type_of_task_created: row[24] || null,
      e_identification: row[25] === 'true'
    }))

    const { error } = await supabase
      .from('call_logs')
      .insert(records)

    if (error) throw error

    return new Response(
      JSON.stringify({ message: `Successfully imported ${records.length} records` }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error processing CSV:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
