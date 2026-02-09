import type { ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

type PreviewStudioLayoutProps = {
  children: ReactNode;
};

export function PreviewStudioLayout({ children }: PreviewStudioLayoutProps) {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white dark:bg-[#0b0f1a]">
      {children}
    </div>
  );
}
