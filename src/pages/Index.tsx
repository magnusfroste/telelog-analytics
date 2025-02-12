
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Brain, LineChart, Sparkles, MessageSquare, Zap, BarChart3 } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200">
      {/* Hero Section */}
      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
        </div>

        <div className="mx-auto max-w-6xl py-12 sm:py-20">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-gray-900 via-purple-900 to-violet-800 bg-clip-text text-transparent sm:text-6xl">
              Your Call Center Analytics,{" "}
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Powered by AI
              </span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 max-w-3xl mx-auto">
              Transform your dashboard into an intelligent insights engine. Chat with your data, uncover hidden patterns, and make data-driven decisions faster than ever before.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button
                size="lg"
                onClick={() => navigate('/auth')}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Get Started Free
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div className="relative group">
            <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 opacity-20 group-hover:opacity-30 transition-opacity blur" />
            <div className="relative space-y-4 rounded-lg bg-white/90 backdrop-blur-sm p-6 shadow-lg ring-1 ring-gray-900/5">
              <div className="flex items-center gap-4">
                <Brain className="h-8 w-8 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-900">AI-Powered Analysis</h3>
              </div>
              <p className="text-gray-600">
                Our AI understands your data context and provides intelligent insights automatically.
              </p>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 opacity-20 group-hover:opacity-30 transition-opacity blur" />
            <div className="relative space-y-4 rounded-lg bg-white/90 backdrop-blur-sm p-6 shadow-lg ring-1 ring-gray-900/5">
              <div className="flex items-center gap-4">
                <MessageSquare className="h-8 w-8 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-900">Chat with Your Data</h3>
              </div>
              <p className="text-gray-600">
                Ask questions in plain English and get instant insights from your call center data.
              </p>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 opacity-20 group-hover:opacity-30 transition-opacity blur" />
            <div className="relative space-y-4 rounded-lg bg-white/90 backdrop-blur-sm p-6 shadow-lg ring-1 ring-gray-900/5">
              <div className="flex items-center gap-4">
                <LineChart className="h-8 w-8 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-900">Real-time Insights</h3>
              </div>
              <p className="text-gray-600">
                Get live updates and actionable insights as your call center data flows in.
              </p>
            </div>
          </div>
        </div>

        {/* Analytics Preview */}
        <div className="mt-24 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Experience the Future of Analytics
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Our AI-powered dashboard gives you superhuman abilities to understand and optimize your call center operations.
          </p>
          <div className="mt-16 rounded-xl bg-white/90 backdrop-blur-sm shadow-2xl ring-1 ring-gray-900/5 p-8">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <BarChart3 className="h-6 w-6 text-purple-600 mx-auto" />
                <h4 className="font-semibold text-gray-900">Smart Metrics</h4>
                <p className="text-sm text-gray-600">Automatically track what matters most</p>
              </div>
              <div className="space-y-2">
                <Brain className="h-6 w-6 text-purple-600 mx-auto" />
                <h4 className="font-semibold text-gray-900">Pattern Detection</h4>
                <p className="text-sm text-gray-600">Uncover hidden trends and anomalies</p>
              </div>
              <div className="space-y-2">
                <Zap className="h-6 w-6 text-purple-600 mx-auto" />
                <h4 className="font-semibold text-gray-900">Instant Analysis</h4>
                <p className="text-sm text-gray-600">Get insights in milliseconds</p>
              </div>
              <div className="space-y-2">
                <MessageSquare className="h-6 w-6 text-purple-600 mx-auto" />
                <h4 className="font-semibold text-gray-900">Natural Interaction</h4>
                <p className="text-sm text-gray-600">Chat with your data naturally</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
