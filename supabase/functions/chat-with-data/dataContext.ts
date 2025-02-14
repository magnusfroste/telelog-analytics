
import { SimilarDoc } from './supabase.ts';

export function createDataContext(similarDocs: SimilarDoc[], selectedColumns: string[]): string {
  const summary = {
    totalRelevantCalls: similarDocs.length,
    averageCallDuration: Math.round(
      similarDocs.reduce((acc, doc) => acc + (doc.metadata.call_time_phone || 0), 0) / similarDocs.length
    ),
    relevantClosingMethods: Object.entries(
      similarDocs.reduce((acc, doc) => {
        const method = doc.metadata.form_closing || 'Unknown';
        acc[method] = (acc[method] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    ),
  };

  return `Here is the analysis of the most relevant call logs based on the user's question:

Summary of relevant calls:
- Total relevant calls analyzed: ${summary.totalRelevantCalls}
- Average call duration: ${summary.averageCallDuration} seconds
- Closing methods distribution: ${summary.relevantClosingMethods.map(([method, count]) => 
  `${method}: ${count} calls`).join(', ')}

Sample of relevant call logs:
${JSON.stringify(similarDocs.slice(0, 5).map(doc => doc.metadata), null, 2)}

The data shown above represents the most relevant call logs based on the user's question. 
Available columns for analysis: ${selectedColumns.join(', ')}`;
}

export function updateMessages(messages: any[], dataContext: string) {
  return messages.map((msg: any, index: number) => {
    if (index === 0 && msg.role === 'system') {
      return {
        ...msg,
        content: `${msg.content}\n\nHere's the relevant data to analyze:\n${dataContext}`
      };
    }
    return msg;
  });
}
