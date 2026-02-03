import React from "react";
export default function Dashboard() {
  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Overview of your business performance
          </p>
        </div>
      </div>
    </div>
  );
}
