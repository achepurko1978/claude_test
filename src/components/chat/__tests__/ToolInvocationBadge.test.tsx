import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolInvocationBadge } from "../ToolInvocationBadge";
import type { ToolInvocation } from "ai";

afterEach(() => {
  cleanup();
});

function makeInvocation(
  toolName: string,
  args: Record<string, unknown>,
  state: "call" | "result" = "result",
  result?: unknown,
): ToolInvocation {
  if (state === "result") {
    return { toolCallId: "id", toolName, args, state, result: result ?? "ok" };
  }
  return { toolCallId: "id", toolName, args, state };
}

test("str_replace_editor create → Creating <filename>", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={makeInvocation("str_replace_editor", {
        command: "create",
        path: "src/Card.tsx",
      })}
    />,
  );
  expect(screen.getByText("Creating Card.tsx")).toBeDefined();
});

test("str_replace_editor str_replace → Editing <filename>", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={makeInvocation("str_replace_editor", {
        command: "str_replace",
        path: "src/App.tsx",
      })}
    />,
  );
  expect(screen.getByText("Editing App.tsx")).toBeDefined();
});

test("str_replace_editor insert → Editing <filename>", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={makeInvocation("str_replace_editor", {
        command: "insert",
        path: "src/App.tsx",
      })}
    />,
  );
  expect(screen.getByText("Editing App.tsx")).toBeDefined();
});

test("str_replace_editor view → Reading <filename>", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={makeInvocation("str_replace_editor", {
        command: "view",
        path: "src/index.tsx",
      })}
    />,
  );
  expect(screen.getByText("Reading index.tsx")).toBeDefined();
});

test("file_manager rename → Renaming <filename>", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={makeInvocation("file_manager", {
        command: "rename",
        path: "src/Foo.tsx",
      })}
    />,
  );
  expect(screen.getByText("Renaming Foo.tsx")).toBeDefined();
});

test("file_manager delete → Deleting <filename>", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={makeInvocation("file_manager", {
        command: "delete",
        path: "src/Foo.tsx",
      })}
    />,
  );
  expect(screen.getByText("Deleting Foo.tsx")).toBeDefined();
});

test("unknown tool with no args → raw toolName", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={makeInvocation("unknown_tool", {})}
    />,
  );
  expect(screen.getByText("unknown_tool")).toBeDefined();
});

test("in-progress state renders spinner, not green dot", () => {
  const { container } = render(
    <ToolInvocationBadge
      toolInvocation={makeInvocation(
        "str_replace_editor",
        { command: "create", path: "src/Card.tsx" },
        "call",
      )}
    />,
  );
  expect(container.querySelector(".animate-spin")).toBeDefined();
  expect(container.querySelector(".bg-emerald-500")).toBeNull();
});

test("completed state renders green dot, not spinner", () => {
  const { container } = render(
    <ToolInvocationBadge
      toolInvocation={makeInvocation(
        "str_replace_editor",
        { command: "create", path: "src/Card.tsx" },
        "result",
        "ok",
      )}
    />,
  );
  expect(container.querySelector(".bg-emerald-500")).toBeDefined();
  expect(container.querySelector(".animate-spin")).toBeNull();
});

test("nested path extracts basename only", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={makeInvocation("str_replace_editor", {
        command: "create",
        path: "src/components/ui/Button.tsx",
      })}
    />,
  );
  expect(screen.getByText("Creating Button.tsx")).toBeDefined();
});
