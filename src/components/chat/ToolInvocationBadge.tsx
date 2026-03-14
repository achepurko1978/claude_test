"use client";

import { type ToolInvocation } from "ai";
import { Loader2 } from "lucide-react";

interface ToolInvocationBadgeProps {
  readonly toolInvocation: ToolInvocation;
}

function getToolLabel(toolName: string, args: Record<string, unknown>): string {
  const rawPath = args.path;
  const filename =
    typeof rawPath === "string"
      ? (rawPath.split("/").pop() ?? rawPath)
      : undefined;

  if (toolName === "str_replace_editor") {
    switch (args.command) {
      case "create":
        return filename !== undefined ? `Creating ${filename}` : toolName;
      case "str_replace":
      case "insert":
      case "undo_edit":
        return filename !== undefined ? `Editing ${filename}` : toolName;
      case "view":
        return filename !== undefined ? `Reading ${filename}` : toolName;
    }
  }

  if (toolName === "file_manager") {
    switch (args.command) {
      case "rename":
        return filename !== undefined ? `Renaming ${filename}` : toolName;
      case "delete":
        return filename !== undefined ? `Deleting ${filename}` : toolName;
    }
  }

  return toolName;
}

export function ToolInvocationBadge({ toolInvocation }: ToolInvocationBadgeProps) {
  const label = getToolLabel(
    toolInvocation.toolName,
    toolInvocation.args as Record<string, unknown>,
  );
  const isComplete =
    toolInvocation.state === "result" && Boolean(toolInvocation.result);

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs border border-neutral-200">
      {isComplete ? (
        <>
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-neutral-700">{label}</span>
        </>
      ) : (
        <>
          <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
          <span className="text-neutral-700">{label}</span>
        </>
      )}
    </div>
  );
}
