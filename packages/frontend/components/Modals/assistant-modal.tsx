"use client";

import { type FC } from "react";
import { Thread } from "@/components/Thread/thread";

export const AssistantModal: FC = () => {
  return (
    <div className="fixed inset-0 w-full h-full bg-background overflow-hidden">
      <Thread />
    </div>
  );
};
