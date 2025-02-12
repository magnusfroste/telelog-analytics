
interface TokenUsage {
  model: string;
  input_tokens: number;
  output_tokens: number;
}

interface DeveloperInfoProps {
  tokenUsage: TokenUsage | null;
}

const DeveloperInfo = ({ tokenUsage }: DeveloperInfoProps) => {
  return (
    <div className="bg-white/50 backdrop-blur-sm border border-gray-200 rounded-lg p-4 mt-8">
      <h3 className="text-sm font-semibold mb-2 text-gray-700">Developer Information</h3>
      <div className="space-y-1 text-sm text-gray-600">
        <p>Model: {tokenUsage?.model || 'No analysis performed yet'}</p>
        <p>Input Tokens: {tokenUsage?.input_tokens || 0}</p>
        <p>Output Tokens: {tokenUsage?.output_tokens || 0}</p>
        <p>Total Tokens: {tokenUsage ? tokenUsage.input_tokens + tokenUsage.output_tokens : 0}</p>
      </div>
    </div>
  );
};

export default DeveloperInfo;
