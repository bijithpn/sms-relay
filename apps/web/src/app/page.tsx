import React from 'react';
import { Sidebar } from '../components/Sidebar';
import { StatCard } from '../components/StatCard';
import { Smartphone, Send, Wallet } from 'lucide-react';

export default function Dashboard() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-8">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Network Overview</h1>
          <p className="text-gray-500">Real-time monitoring of your distributed SMS relay.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Active Nodes"
            value="1,284"
            description="+12% from last week"
            icon={<Smartphone className="text-blue-500" />}
          />
          <StatCard
            title="SMS Delivered"
            value="42.5k"
            description="98.2% Success Rate"
            icon={<Send className="text-green-500" />}
          />
          <StatCard
            title="Total Earnings"
            value="$1,420.00"
            description="Across all nodes"
            icon={<Wallet className="text-purple-500" />}
          />
        </div>

        <div className="bg-white rounded-xl border shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Job Activity</h2>
          <div className="text-sm text-gray-400 text-center py-12 border-2 border-dashed rounded-lg">
            No active jobs to display. Create a new job to start sending.
          </div>
        </div>
      </main>
    </div>
  );
}
