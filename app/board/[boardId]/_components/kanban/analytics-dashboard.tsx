"use client";

import { useQuery } from "convex/react";
import { BarChart3, TrendingUp, Users, Activity, Clock, ListChecks } from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

type AnalyticsDashboardProps = {
  boardId: Id<"boards">;
};

export const AnalyticsDashboard = ({ boardId }: AnalyticsDashboardProps) => {
  const analytics = useQuery(api.analytics.getBoardAnalytics, { boardId });

  if (!analytics) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const maxActivity = Math.max(...analytics.activityLast7Days, 1);
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="h-full w-full overflow-auto p-6 bg-gray-50">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-600 rounded-lg shadow-sm">
            <BarChart3 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Board Analytics
            </h1>
            <p className="text-gray-600 text-sm">Track your board's activity and performance</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Cards */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-blue-50 rounded">
                <ListChecks className="h-5 w-5 text-blue-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{analytics.totalCards}</span>
            </div>
            <h3 className="text-sm font-semibold text-gray-700">Total Cards</h3>
            <p className="text-xs text-gray-500 mt-1">Across {analytics.totalLists} lists</p>
          </div>

          {/* Completed Cards */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-green-50 rounded">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{analytics.completedCardsCount}</span>
            </div>
            <h3 className="text-sm font-semibold text-gray-700">Completed</h3>
            <p className="text-xs text-gray-500 mt-1">
              {analytics.totalCards > 0 
                ? Math.round((analytics.completedCardsCount / analytics.totalCards) * 100)
                : 0}% completion rate
            </p>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-gray-100 rounded">
                <Activity className="h-5 w-5 text-gray-700" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{analytics.recentActivityCount}</span>
            </div>
            <h3 className="text-sm font-semibold text-gray-700">Activity (7d)</h3>
            <p className="text-xs text-gray-500 mt-1">Recent actions taken</p>
          </div>

          {/* Avg Card Lifetime */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-indigo-50 rounded">
                <Clock className="h-5 w-5 text-indigo-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{analytics.avgCardLifetimeDays}</span>
            </div>
            <h3 className="text-sm font-semibold text-gray-700">Avg Days</h3>
            <p className="text-xs text-gray-500 mt-1">To complete a card</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Activity Chart */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              Activity Last 7 Days
            </h3>
            <div className="flex items-end justify-between h-48 gap-2">
              {analytics.activityLast7Days.map((count, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full bg-gray-100 rounded-t relative overflow-hidden" style={{ height: "100%" }}>
                    <div
                      className="absolute bottom-0 w-full bg-blue-600 rounded-t transition-all duration-500"
                      style={{ height: `${(count / maxActivity) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-gray-600">{days[index]}</span>
                  <span className="text-xs font-bold text-gray-900">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Cards per List */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <ListChecks className="h-5 w-5 text-blue-600" />
              Cards per List
            </h3>
            <div className="space-y-3">
              {analytics.cardsPerList.length > 0 ? analytics.cardsPerList.map((list, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-700 truncate">{list.name}</span>
                    <span className="font-bold text-gray-900">{list.count}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all duration-500"
                      style={{ width: `${analytics.totalCards > 0 ? (list.count / analytics.totalCards) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              )) : (
                <p className="text-sm text-gray-500">No lists created yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Activity Breakdown & Top Contributors */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Activity by Action */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Activity Breakdown</h3>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(analytics.activityByAction).map(([action, count]) => (
                <div key={action} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div className={`p-2 rounded ${
                    action === "created" ? "bg-green-50 text-green-700" :
                    action === "moved" ? "bg-blue-50 text-blue-700" :
                    action === "updated" ? "bg-amber-50 text-amber-700" :
                    "bg-red-50 text-red-700"
                  }`}>
                    <span className="text-xl font-bold">{count}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-700 capitalize">{action}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Contributors */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Top Contributors
            </h3>
            {analytics.topContributors.length > 0 ? (
              <div className="space-y-3">
                {analytics.topContributors.map((contributor, index) => (
                  <div key={contributor.userId} className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{contributor.name}</p>
                      <p className="text-xs text-gray-500">{contributor.activityCount} actions</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No activity tracked yet</p>
            )}
          </div>
        </div>

        {/* Insights */}
        <div className="bg-blue-600 rounded-lg p-6 shadow-sm text-white">
          <h3 className="text-lg font-bold mb-3">Quick Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-semibold">Most Active List:</span> {analytics.mostActiveList || "No data yet"}
            </div>
            <div>
              <span className="font-semibold">Average Completion:</span> {analytics.avgCardLifetimeDays > 0 ? `${analytics.avgCardLifetimeDays} days` : "No completed cards yet"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
