<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

# General Guidelines for working with Nx

- When running tasks (for example build, lint, test, e2e, etc.), always prefer running the task through `nx` (i.e. `nx run`, `nx run-many`, `nx affected`) instead of using the underlying tooling directly
- You have access to the Nx MCP server and its tools, use them to help the user
- When answering questions about the repository, use the `nx_workspace` tool first to gain an understanding of the workspace architecture where applicable.
- When working in individual projects, use the `nx_project_details` mcp tool to analyze and understand the specific project structure and dependencies
- For questions around nx configuration, best practices or if you're unsure, use the `nx_docs` tool to get relevant, up-to-date docs. Always use this instead of assuming things about nx configuration
- If the user needs help with an Nx configuration or project graph error, use the `nx_workspace` tool to get any errors
- For Nx plugin best practices, check `node_modules/@nx/<plugin>/PLUGIN.md`. Not all plugins have this file - proceed without it if unavailable.

<!-- nx configuration end-->

# CopilotKit

AI agent framework with three layers: **Frontend** (React/Angular/Vanilla) → **Runtime** (Express/Hono) → **Agent** (LangGraph/CrewAI/BuiltIn/Custom), communicating via the AG-UI protocol (event-based SSE).

## Project Overview

CopilotKit is a best-in-class SDK for building full-stack agentic applications, Generative UI, and chat applications. It is the company behind the **AG-UI Protocol**, an event-based standard for agent-user interaction adopted by Google, LangChain, AWS, Microsoft, Mastra, and PydanticAI.

This is an **Nx monorepo** managed with **pnpm** workspaces. The project supports both TypeScript/JavaScript (Node.js) and Python SDKs.

### Key Features

- **Chat UI** – React-based chat interface with message streaming and tool calls
- **Backend Tool Rendering** – Agents call backend tools that return UI components rendered in the client
- **Generative UI** – Agents dynamically generate and update UI components at runtime
- **Shared State** – Synchronized state layer for agents and UI components
- **Human-in-the-Loop** – Agents pause execution to request user input, confirmation, or edits

## Technology Stack

| Layer | Technologies |
|-------|-------------|
| Package Manager | pnpm 10.13.1 |
| Monorepo Tool | Nx 22.5.0 |
| Language | TypeScript 5.8.2 |
| Build Tool | tsdown (packages), Next.js (examples/docs) |
| Styling | Tailwind CSS 4.x |
| Testing | Vitest 3.x |
| Linting | ESLint 9.x with typescript-eslint |
| Formatting | Prettier 3.x |
| Python SDK | Poetry with Python 3.10-3.12 |
| CI/CD | GitHub Actions |

## Architecture

### Three-Layer Architecture

```
Frontend (React/Angular/Vanilla) → Runtime (Express/Hono server) → Agent (LangGraph/CrewAI/BuiltIn/Custom)
```

All layers communicate via the **AG-UI protocol** — an event-based standard streamed over SSE.

### V1 vs V2

| Version | Package Prefix | Purpose |
|---------|---------------|---------|
| V2 | `@copilotkitnext/*` | The real implementation. Build new features here first. |
| V1 | `@copilotkit/*` | Public compatibility layer that wraps V2 internally. |

**Rule**: V2 is the source of truth. V1 packages are thin wrappers/re-exports for backward compatibility. New features always go in V2.

### V2 Packages (`packages/v2/`)

| Package | Description |
|---------|-------------|
| `@copilotkitnext/shared` | Common utilities, types, and constants |
| `@copilotkitnext/core` | `CopilotKitCore` orchestrator — central brain on frontend |
| `@copilotkitnext/react` | React hooks (`useAgent`, `useFrontendTool`, etc.) and `CopilotKitProvider` |
| `@copilotkitnext/angular` | Angular DI tokens, services, and signal-based state |
| `@copilotkitnext/runtime` | Server-side `CopilotRuntime` with Express and Hono adapters |
| `@copilotkitnext/agent` | `BuiltInAgent` — default agent powered by Vercel AI SDK |
| `@copilotkitnext/voice` | Voice input and transcription support |
| `@copilotkitnext/web-inspector` | Debug console (Lit web component) for inspecting agent communication |
| `@copilotkitnext/sqlite-runner` | `AgentRunner` implementation persisting state to SQLite |
| `@copilotkitnext/demo-agents` | Demo agents for testing and examples |
| `@copilotkitnext/typescript-config` | Shared TypeScript configurations |
| `@copilotkitnext/eslint-config` | Shared ESLint configurations |

### V1 Packages (`packages/v1/`)

| Package | Description |
|---------|-------------|
| `@copilotkit/react-core` | Public `<CopilotKit>` provider and hooks (wraps V2) |
| `@copilotkit/react-ui` | Chat UI components (`CopilotChat`, `CopilotPopup`, etc.) |
| `@copilotkit/react-textarea` | `CopilotTextarea` for AI-assisted text editing |
| `@copilotkit/shared` | Shared types and telemetry |
| `@copilotkit/runtime` | Server-side runtime with GraphQL server |
| `@copilotkit/runtime-client-gql` | urql-based GraphQL client |
| `@copilotkit/sdk-js` | LangGraph/LangChain integration helpers |
| `@copilotkit/a2ui-renderer` | A2UI renderer component |

### Python SDK (`sdk-python/`)

- **Package**: `copilotkit` (published to PyPI)
- **Build Tool**: Poetry
- **Python Version**: 3.10 - 3.12
- **Key Dependencies**: LangGraph, LangChain, FastAPI, CrewAI (optional)
- **Entry Point**: `copilotkit` module with FastAPI integration

## Workspace Configuration

### pnpm Workspaces (`pnpm-workspace.yaml`)

```yaml
packages:
  - "packages/v1/*"
  - "packages/v2/*"
  - "examples/v1/*"
  - "examples/v2/*"
  - "examples/v2/*/apps/*"
  - "examples/v2/react/*"
  - "examples/v2/angular/*"
```

### Nx Configuration (`nx.json`)

- **Default Base**: `main`
- **Parallel**: 14 tasks
- **Cache**: Enabled for build, test, lint, check-types
- **Outputs**: `{projectRoot}/dist/**` for builds, `{projectRoot}/coverage/**` for tests

## Build and Test Commands

### Root-level Commands (from `package.json`)

```bash
# Building
pnpm build                    # Build all packages
pnpm build:examples          # Build all examples
pnpm build:storybook         # Build storybook projects

# Development
pnpm dev                     # Build and watch all packages
pnpm dev:classic             # Watch V1 packages only
pnpm dev:next                # Watch V2 packages only
pnpm dev:examples            # Watch examples

# Testing
pnpm test                    # Run all tests
pnpm test:classic            # Run V1 tests only
pnpm test:next               # Run V2 tests only
pnpm test:watch              # Run tests in watch mode
pnpm test:coverage           # Run tests with coverage

# Code Quality
pnpm lint                    # Run ESLint on packages
pnpm format                  # Format with Prettier
pnpm check-prettier          # Check Prettier formatting
pnpm check-types             # Type-check all packages
pnpm check:packages          # Run publint and attw on packages

# Storybook
pnpm storybook               # Run React storybook
pnpm storybook:angular       # Run Angular storybook

# Docs
pnpm docs:next               # Run V2 docs
pnpm docs:classic            # Generate V1 docs
```

### Package-level Commands

Each package supports these standard targets:

```bash
nx run <package>:build          # Build the package
nx run <package>:dev            # Development mode with watch
nx run <package>:test           # Run unit tests
nx run <package>:test:watch     # Tests in watch mode
nx run <package>:test:coverage  # Tests with coverage
nx run <package>:lint           # Run ESLint
nx run <package>:check-types    # TypeScript type checking
nx run <package>:publint        # Validate package exports
nx run <package>:attw           # Check TypeScript types with @arethetypeswrong/cli
```

## Code Style Guidelines

### TypeScript Configuration

- **Base Config**: `packages/v2/typescript-config/base.json`
- **Target**: ES2022
- **Module**: NodeNext
- **Strict**: Enabled with `noUncheckedIndexedAccess: true`
- **Declaration**: Both `.d.ts` and `.d.ts.map` generated

### ESLint Configuration

- **Base**: `packages/v2/eslint-config/base.js`
- **Plugins**: `@eslint/js`, `typescript-eslint`, `eslint-plugin-turbo`, `eslint-plugin-only-warn`
- **Prettier**: Integrated via `eslint-config-prettier`
- **Ignores**: `dist/**` directories

### Code Conventions

1. **Prefer simplest correct solution** — avoid over-engineering
2. **Use Nx for all tasks** — never run underlying tools directly
3. **ESM-first** — All V2 packages use `"type": "module"`
4. **Dual exports** — Support both ESM (`.mjs`) and CJS (`.cjs`)

### Import/Export Patterns

```typescript
// V2 packages use these export patterns
{
  ".": {
    "import": "./dist/index.mjs",
    "require": "./dist/index.cjs"
  }
}
```

## Testing Instructions

### Test Framework

- **Runner**: Vitest 3.x
- **DOM**: jsdom for React component tests
- **Coverage**: `@vitest/coverage-v8`

### Test File Patterns

- Unit tests: `*.test.ts`, `*.test.tsx`
- E2E tests: `*.e2e.test.ts`, `*.e2e.test.tsx`
- Location: `src/__tests__/` or co-located with source

### Running Tests

```bash
# All tests
pnpm test

# Specific package
nx run @copilotkitnext/core:test

# Watch mode
nx run @copilotkitnext/react:test:watch

# Coverage
nx run @copilotkitnext/core:test:coverage
```

### Test Categories

1. **Unit Tests** — Fast, isolated tests for individual functions/components
2. **E2E Tests** — Integration tests using actual runtime connections
3. **Visual/Slot Tests** — Test component slot rendering and customization

## Development Workflow

### Git Workflow

1. **Use git worktrees** for non-trivial work (see `.claude/docs/git.md`)
2. **Branch naming**:
   - `feat/<ISSUE_NUMBER>-<description>` — New features
   - `fix/<ISSUE_NUMBER>-<description>` — Bug fixes
   - `docs/<ISSUE_NUMBER>-<description>` — Documentation

### Commit Conventions

Uses Conventional Commits with commitlint:

```
<type>(<package>): <subject>
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`

Max header length: 120 characters

### Pre-commit Hooks (Lefthook)

Runs automatically on commit:

1. **Binary check** — Prevents committing binaries, build artifacts, files > 1MB
2. **Lockfile sync** — Updates pnpm-lock.yaml if package.json changed
3. **Lint fix** — Runs ESLint with `--fix` and Prettier
4. **Test & package check** — Runs tests and validates packages with publint/attw

### Planning vs Autonomous Work

- **Bug fixes** (< 5 files): Fix autonomously, run tests
- **Large bugs** (5+ files or architectural): Plan mode first
- **New features/refactors**: Always enter plan mode, write to `tasks/todo.md`

## Release Process

### Changesets

- **Config**: `.changeset/config.json`
- **Fixed versions**: All `@copilotkit/*` and `@copilotkitnext/*` packages move together
- **Base branch**: `origin/main`

### Versioning Commands

```bash
pnpm changeset              # Add a changeset
pnpm changeset version      # Version packages
pnpm changeset publish      # Publish packages
```

## Security Considerations

### Binary Files

Pre-commit hooks block:
- Executable files (`.exe`, `.dll`, `.so`, `.dylib`, etc.)
- Build directories (`/build/`)
- dSYM directories
- Files larger than 1MB

### Environment Variables

- ESLint checks for undeclared environment variables via `turbo/no-undeclared-env-vars`
- Use `.env*` files for local configuration (excluded from cache inputs)

### Package Quality Checks

Every package is validated with:

1. **publint** — Validates package.json exports and structure
2. **attw** (@arethetypeswrong/cli) — Validates TypeScript types are correct

## CI/CD

### GitHub Actions Workflows

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| `test_unit-v2.yml` | PR/push to main | Unit tests for V2 packages (Node 20/22/24) |
| `test_unit-v1.yml` | PR/push to main | Unit tests for V1 packages |
| `test_unit-python-sdk.yml` | PR/push to main | Python SDK tests |
| `static_quality.yml` | PR/push to main | Prettier, ESLint, publint/attw |
| `static_commitlint.yml` | PR/push to main | Commit message validation |
| `e2e_examples.yml` | Manual/scheduled | E2E tests for examples |
| `publish_release.yml` | Manual | Release publishing |
| `publish_custom-pre.yml` | Manual | Prerelease publishing |

### Required Secrets

- `NX_CI_EXECUTION_ID` — Set automatically in CI
- `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID_DOCS` — For docs deployment

## Reference Documentation

- [Architecture & Packages](.claude/docs/architecture.md) — Detailed architecture, request lifecycle, core concepts
- [Hook Development](.claude/docs/hooks.md) — Checklist for creating new hooks
- [Workflow & Process](.claude/docs/workflow.md) — When to plan, verification, bug fixing
- [Git & PRs](.claude/docs/git.md) — Worktree workflow, branching, creating PRs
- [Contributing Guide](CONTRIBUTING.md) — Full contribution guidelines

## External Resources

- **Documentation**: https://docs.copilotkit.ai/
- **Discord**: https://discord.gg/6dffbvGU3D
- **AG-UI Protocol**: https://github.com/ag-ui-protocol/ag-ui
- **Copilot Cloud**: https://cloud.copilotkit.ai/
