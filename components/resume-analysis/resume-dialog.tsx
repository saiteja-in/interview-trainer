"use client";

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface ResumeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  resumeUrl: string;
}

export const ResumeDialog: React.FC<ResumeDialogProps> = ({
  isOpen,
  onClose,
  resumeUrl,
}) => {
  if (!resumeUrl) return null;

  const isPDF = resumeUrl.toLowerCase().endsWith(".pdf");

  const viewerSrc = isPDF
    ? `${resumeUrl}#toolbar=0`
    : `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(resumeUrl)}`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-[90vw] h-[90vh] p-0">
        <DialogHeader className="px-6 py-3 flex flex-row items-center justify-between border-b">
          <DialogTitle className="text-lg font-semibold">Resume Preview</DialogTitle>
        </DialogHeader>
        <div className="flex-1 h-full p-0 bg-muted/30">
          <iframe
            src={viewerSrc}
            className="w-full h-[calc(90vh-4rem)]"
            style={{
              border: "none",
              backgroundColor: "transparent",
            }}
            title="Resume Preview"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
