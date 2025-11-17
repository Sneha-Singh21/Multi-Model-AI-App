import { Progress } from "@/components/ui/progress";
import React from "react";

const UsageCreditProgress = ({ remainingToken }) => {
  return (
    <div className="p-3 mb-4 border rounded-2xl flex flex-col gap-2">
      <h2 className="font-bold text-xl bg-linear-to-r from-blue-600 to-purple-500 text-transparent bg-clip-text">
        Free Plan
      </h2>
      <p className="text-gray-400 text-sm">
        {5 - remainingToken}/5 messages Used
      </p>
      <Progress value={100 - ((5 - remainingToken) / 5) * 100} />
    </div>
  );
};

export default UsageCreditProgress;
