
interface CallLogMatch {
  id: number;
  similarity: number;
  metadata: {
    teleq_id: number;
    created: string;
    form_closing: string;
    category: string;
    type_of_task_closed: string;
  };
}

export function getDataContext(similarLogs: CallLogMatch[]): string {
  if (!similarLogs.length) {
    return "No similar call logs found.";
  }

  return similarLogs
    .map(
      (log) => `
Call ID: ${log.metadata.teleq_id}
Created: ${log.metadata.created}
Form Closing: ${log.metadata.form_closing}
Category: ${log.metadata.category}
Task Type: ${log.metadata.type_of_task_closed}
Similarity: ${(log.similarity * 100).toFixed(2)}%
---`
    )
    .join("\n");
}
