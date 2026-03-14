# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run setup       # First-time setup: install deps, generate Prisma client, run migrations
npm run dev         # Dev server with Turbopack (wraps Next.js with node-compat.cjs)
npm run build       # Production build
npm run lint        # ESLint via next lint
npm run test        # Vitest unit tests
npm run db:reset    # Reset database (prisma migrate reset --force)
```

To run a single test file:
```bash
npx vitest run src/path/to/file.test.ts
```

Environment: copy `.env` and add `ANTHROPIC_API_KEY`. Without a key, the app falls back to a mock provider that returns static component examples.

## Architecture

UIGen is a Next.js 15 app (App Router) where users chat with Claude to generate React components. The generated code lives in a **virtual file system** (in-memory, no disk writes) and is compiled client-side with Babel for live preview.

### Request Flow

1. User types a prompt in the chat panel
2. `ChatContext` calls `/api/chat` with the current messages and serialized VFS state
3. The API route streams a response using Vercel AI SDK's `streamText()` with the `claude-haiku-4-5` model
4. Claude calls tools (`str_replace_editor`, `file_manager`) to create/modify files
5. Tool call results update `FileSystemContext` (in-memory VFS)
6. `PreviewFrame` compiles the VFS with Babel and renders it in an iframe
7. For authenticated users, the project (messages + VFS) auto-saves to SQLite via Prisma

### Key Architectural Decisions

**Virtual File System** (`src/lib/file-system.ts`): All generated files exist only in memory as a `Map<string, FileNode>`. The VFS is serialized to JSON for storage in the `Project.data` DB column and re-hydrated on load. The `FileSystemContext` (`src/lib/contexts/file-system-context.tsx`) wraps this and exposes it to the UI.

**AI Tools** (`src/lib/tools/`): Claude is given two tools:
- `str_replace_editor` — view, create, and edit files (str_replace, insert commands)
- `file_manager` — rename and delete files

**Provider/Model** (`src/lib/provider.ts`): Wraps `@ai-sdk/anthropic`. If no `ANTHROPIC_API_KEY` is set, a `MockLanguageModel` is used instead, returning hardcoded component examples.

**Auth** (`src/lib/auth.ts`): JWT sessions via Jose, stored as HTTPOnly cookies with 7-day expiry. Middleware (`src/middleware.ts`) validates tokens on protected routes. Server actions in `src/actions/` handle sign-up/sign-in/sign-out and project CRUD.

**Layout** (`src/app/main-content.tsx`): Three-panel resizable layout — Chat on the left, Preview/Code tabs on the right. The Code tab shows a file tree alongside a Monaco editor.

**Anonymous users**: Can use the app without signing up. Work is tracked in localStorage (`anon-work-tracker`) and can be saved by creating an account.

## Code Style

Only add comments where the logic isn't self-evident. Don't annotate what the code already says clearly.

### Data Models (Prisma / SQLite)

The database schema is defined in `prisma/schema.prisma` — reference it anytime you need to understand the structure of data stored in the database.



- `User`: id, email, hashed password
- `Project`: id, name, userId (nullable for anon), `messages` (JSON string), `data` (JSON string — serialized VFS)
