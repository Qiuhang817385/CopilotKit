<!-- nx 配置开始 -->
<!-- 保留起始和结束注释以自动接收更新。 -->

# Nx 使用通用指南

- 运行任务（如构建、代码检查、测试、端到端测试等）时，始终优先通过 `nx` 运行（即 `nx run`、`nx run-many`、`nx affected`），而不是直接使用底层工具
- 你可以使用 Nx MCP 服务器及其工具，它们能为你提供帮助
- 回答关于代码仓库的问题时，优先使用 `nx_workspace` 工具来理解工作区架构
- 在单个项目中工作时，使用 `nx_project_details` mcp 工具来分析和理解特定项目的结构与依赖关系
- 如有关于 Nx 配置、最佳实践的问题或不确定的地方，使用 `nx_docs` 工具获取相关、最新的文档。始终使用此工具，不要对 Nx 配置做假设
- 如果用户需要帮助解决 Nx 配置或项目图谱错误，使用 `nx_workspace` 工具获取错误信息
- 关于 Nx 插件最佳实践，请查看 `node_modules/@nx/<plugin>/PLUGIN.md`。并非所有插件都有此文件——如果没有，直接继续即可

<!-- nx 配置结束 -->

# CopilotKit

三层 AI Agent 框架：**前端**（React/Angular/原生）→ **运行时**（Express/Hono）→ **Agent**（LangGraph/CrewAI/内置/自定义），通过 AG-UI 协议（基于事件的 SSE）进行通信。

## 项目概览

CopilotKit 是构建全栈智能体应用、生成式 UI 和聊天应用的顶级 SDK。它是 **AG-UI 协议**的幕后推手，这是一个基于事件的智能体-用户交互标准，已被 Google、LangChain、AWS、Microsoft、Mastra 和 PydanticAI 采用。

这是一个由 **pnpm** 工作区管理的 **Nx 单体仓库**项目，同时支持 TypeScript/JavaScript（Node.js）和 Python SDK。

### 核心特性

- **聊天 UI** — 基于 React 的聊天界面，支持消息流式传输和工具调用
- **后端工具渲染** — Agent 调用后端工具，返回在客户端渲染的 UI 组件
- **生成式 UI** — Agent 在运行时动态生成和更新 UI 组件
- **共享状态** — Agent 和 UI 组件之间的同步状态层
- **人机协同** — Agent 暂停执行以请求用户输入、确认或编辑

## 技术栈

| 层级 | 技术 |
|------|------|
| 包管理器 | pnpm 10.13.1 |
| 单体仓库工具 | Nx 22.5.0 |
| 语言 | TypeScript 5.8.2 |
| 构建工具 | tsdown（包）、Next.js（示例/文档） |
| 样式 | Tailwind CSS 4.x |
| 测试 | Vitest 3.x |
| 代码检查 | ESLint 9.x + typescript-eslint |
| 代码格式化 | Prettier 3.x |
| Python SDK | Poetry + Python 3.10-3.12 |
| CI/CD | GitHub Actions |

## 架构设计

### 三层架构

```
前端（React/Angular/原生）→ 运行时（Express/Hono 服务器）→ Agent（LangGraph/CrewAI/内置/自定义）
```

所有层通过 **AG-UI 协议**通信——一个基于事件的标准，通过 SSE（服务器发送事件）流式传输。

### V1 vs V2

| 版本 | 包名前缀 | 用途 |
|------|----------|------|
| V2 | `@copilotkitnext/*` | 真正的实现。新功能优先在此开发。 |
| V1 | `@copilotkit/*` | 公共兼容层，内部包装 V2。 |

**原则**：V2 是源头。V1 包是用于向后兼容的薄包装层/重导出。新功能始终放在 V2 中。

### V2 包（`packages/v2/`）

| 包名 | 描述 |
|------|------|
| `@copilotkitnext/shared` | 公共工具函数、类型和常量 |
| `@copilotkitnext/core` | `CopilotKitCore` 编排器 —— 前端的核心大脑 |
| `@copilotkitnext/react` | React Hooks（`useAgent`、`useFrontendTool` 等）和 `CopilotKitProvider` |
| `@copilotkitnext/angular` | Angular 依赖注入令牌、服务和基于信号的状态 |
| `@copilotkitnext/runtime` | 服务器端 `CopilotRuntime`，支持 Express 和 Hono 适配器 |
| `@copilotkitnext/agent` | `BuiltInAgent` —— 由 Vercel AI SDK 驱动的默认 Agent |
| `@copilotkitnext/voice` | 语音输入和转录支持 |
| `@copilotkitnext/web-inspector` | 调试控制台（Lit Web 组件），用于检查 Agent 通信 |
| `@copilotkitnext/sqlite-runner` | `AgentRunner` 实现，将状态持久化到 SQLite |
| `@copilotkitnext/demo-agents` | 用于测试和示例的演示 Agent |
| `@copilotkitnext/typescript-config` | 共享的 TypeScript 配置 |
| `@copilotkitnext/eslint-config` | 共享的 ESLint 配置 |

### V1 包（`packages/v1/`）

| 包名 | 描述 |
|------|------|
| `@copilotkit/react-core` | 公共 `<CopilotKit>` Provider 和 Hooks（包装 V2） |
| `@copilotkit/react-ui` | 聊天 UI 组件（`CopilotChat`、`CopilotPopup` 等） |
| `@copilotkit/react-textarea` | `CopilotTextarea`，用于 AI 辅助文本编辑 |
| `@copilotkit/shared` | 共享类型和遥测 |
| `@copilotkit/runtime` | 服务器端运行时，带 GraphQL 服务器 |
| `@copilotkit/runtime-client-gql` | 基于 urql 的 GraphQL 客户端 |
| `@copilotkit/sdk-js` | LangGraph/LangChain 集成助手 |
| `@copilotkit/a2ui-renderer` | A2UI 渲染组件 |

### Python SDK（`sdk-python/`）

- **包名**：`copilotkit`（发布到 PyPI）
- **构建工具**：Poetry
- **Python 版本**：3.10 - 3.12
- **关键依赖**：LangGraph、LangChain、FastAPI、CrewAI（可选）
- **入口点**：`copilotkit` 模块，集成 FastAPI

## 工作区配置

### pnpm 工作区（`pnpm-workspace.yaml`）

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

### Nx 配置（`nx.json`）

- **默认基础分支**：`main`
- **并行度**：14 个任务
- **缓存**：为 build、test、lint、check-types 启用
- **输出**：构建输出到 `{projectRoot}/dist/**`，测试覆盖率输出到 `{projectRoot}/coverage/**`

## 构建和测试命令

### 根级命令（来自 `package.json`）

```bash
# 构建
pnpm build                    # 构建所有包
pnpm build:examples          # 构建所有示例
pnpm build:storybook         # 构建 Storybook 项目

# 开发
pnpm dev                     # 构建并监听所有包
pnpm dev:classic             # 仅监听 V1 包
pnpm dev:next                # 仅监听 V2 包
pnpm dev:examples            # 监听示例

# 测试
pnpm test                    # 运行所有测试
pnpm test:classic            # 仅运行 V1 测试
pnpm test:next               # 仅运行 V2 测试
pnpm test:watch              # 以监听模式运行测试
pnpm test:coverage           # 运行测试并生成覆盖率报告

# 代码质量
pnpm lint                    # 对包运行 ESLint
pnpm format                  # 使用 Prettier 格式化代码
pnpm check-prettier          # 检查 Prettier 格式化
pnpm check-types             # 对所有包进行类型检查
pnpm check:packages          # 对包运行 publint 和 attw

# Storybook
pnpm storybook               # 运行 React Storybook
pnpm storybook:angular       # 运行 Angular Storybook

# 文档
pnpm docs:next               # 运行 V2 文档
pnpm docs:classic            # 生成 V1 文档
```

### 包级命令

每个包支持以下标准目标：

```bash
nx run <package>:build          # 构建包
nx run <package>:dev            # 带监听的开发模式
nx run <package>:test           # 运行单元测试
nx run <package>:test:watch     # 监听模式运行测试
nx run <package>:test:coverage  # 带覆盖率报告的测试
nx run <package>:lint           # 运行 ESLint
nx run <package>:check-types    # TypeScript 类型检查
nx run <package>:publint        # 验证包导出
nx run <package>:attw           # 使用 @arethetypeswrong/cli 检查 TypeScript 类型
```

## 代码风格指南

### TypeScript 配置

- **基础配置**：`packages/v2/typescript-config/base.json`
- **目标**：ES2022
- **模块**：NodeNext
- **严格模式**：启用 `noUncheckedIndexedAccess: true`
- **声明文件**：同时生成 `.d.ts` 和 `.d.ts.map`

### ESLint 配置

- **基础配置**：`packages/v2/eslint-config/base.js`
- **插件**：`@eslint/js`、`typescript-eslint`、`eslint-plugin-turbo`、`eslint-plugin-only-warn`
- **Prettier**：通过 `eslint-config-prettier` 集成
- **忽略**：`dist/**` 目录

### 代码规范

1. **优先选择最简单正确的方案** —— 避免过度工程
2. **对所有任务使用 Nx** —— 永远不要直接运行底层工具
3. **ESM 优先** —— 所有 V2 包使用 `"type": "module"`
4. **双模式导出** —— 同时支持 ESM（`.mjs`）和 CJS（`.cjs`）

### 导入/导出模式

```typescript
// V2 包使用以下导出模式
{
  ".": {
    "import": "./dist/index.mjs",
    "require": "./dist/index.cjs"
  }
}
```

## 测试说明

### 测试框架

- **运行器**：Vitest 3.x
- **DOM**：React 组件测试使用 jsdom
- **覆盖率**：`@vitest/coverage-v8`

### 测试文件模式

- 单元测试：`*.test.ts`、`*.test.tsx`
- 端到端测试：`*.e2e.test.ts`、`*.e2e.test.tsx`
- 位置：`src/__tests__/` 或与源代码放在一起

### 运行测试

```bash
# 所有测试
pnpm test

# 特定包
nx run @copilotkitnext/core:test

# 监听模式
nx run @copilotkitnext/react:test:watch

# 覆盖率
nx run @copilotkitnext/core:test:coverage
```

### 测试分类

1. **单元测试** —— 快速、独立的函数/组件测试
2. **端到端测试** —— 使用真实运行时连接的集成测试
3. **视觉/插槽测试** —— 测试组件插槽渲染和自定义

## 开发工作流

### Git 工作流

1. **使用 git 工作树**进行非简单的工作（参见 `.claude/docs/git.md`）
2. **分支命名规范**：
   - `feat/<ISSUE_NUMBER>-<描述>` —— 新功能
   - `fix/<ISSUE_NUMBER>-<描述>` —— Bug 修复
   - `docs/<ISSUE_NUMBER>-<描述>` —— 文档

### Commit 规范

使用 Conventional Commits 配合 commitlint：

```
<type>(<package>): <主题>
```

类型：`feat`、`fix`、`docs`、`style`、`refactor`、`perf`、`test`、`chore`

标题最大长度：120 个字符

### 预提交钩子（Lefthook）

提交时自动运行：

1. **二进制文件检查** —— 防止提交二进制文件、构建产物、大于 1MB 的文件
2. **锁文件同步** —— 如果 package.json 更改，更新 pnpm-lock.yaml
3. **代码检查修复** —— 运行 ESLint `--fix` 和 Prettier
4. **测试和包检查** —— 运行测试并使用 publint/attw 验证包

### 计划 vs 自主工作

- **Bug 修复**（< 5 个文件）：自主修复，运行测试
- **大型 Bug**（5+ 个文件或架构性）：先进入计划模式
- **新功能/重构**：始终进入计划模式，写入 `tasks/todo.md`

## 发布流程

### Changesets

- **配置**：`.changeset/config.json`
- **固定版本**：所有 `@copilotkit/*` 和 `@copilotkitnext/*` 包版本同步更新
- **基础分支**：`origin/main`

### 版本管理命令

```bash
pnpm changeset              # 添加 changeset
pnpm changeset version      # 版本化包
pnpm changeset publish      # 发布包
```

## 安全注意事项

### 二进制文件

预提交钩子会阻止：
- 可执行文件（`.exe`、`.dll`、`.so`、`.dylib` 等）
- 构建目录（`/build/`）
- dSYM 目录
- 大于 1MB 的文件

### 环境变量

- ESLint 通过 `turbo/no-undeclared-env-vars` 检查未声明的环境变量
- 使用 `.env*` 文件进行本地配置（从缓存输入中排除）

### 包质量检查

每个包都通过以下方式验证：

1. **publint** —— 验证 package.json 导出和结构
2. **attw**（@arethetypeswrong/cli）—— 验证 TypeScript 类型是否正确

## CI/CD

### GitHub Actions 工作流

| 工作流 | 触发条件 | 用途 |
|--------|----------|------|
| `test_unit-v2.yml` | PR/推送到 main | V2 包单元测试（Node 20/22/24） |
| `test_unit-v1.yml` | PR/推送到 main | V1 包单元测试 |
| `test_unit-python-sdk.yml` | PR/推送到 main | Python SDK 测试 |
| `static_quality.yml` | PR/推送到 main | Prettier、ESLint、publint/attw |
| `static_commitlint.yml` | PR/推送到 main | Commit 信息验证 |
| `e2e_examples.yml` | 手动/定时 | 示例端到端测试 |
| `publish_release.yml` | 手动 | 发布正式版 |
| `publish_custom-pre.yml` | 手动 | 发布预发布版 |

### 必需的秘密

- `NX_CI_EXECUTION_ID` —— 在 CI 中自动设置
- `VERCEL_TOKEN`、`VERCEL_ORG_ID`、`VERCEL_PROJECT_ID_DOCS` —— 用于文档部署

## 参考文档

- [架构与包](.claude/docs/architecture.md) —— 详细架构、请求生命周期、核心概念
- [Hook 开发](.claude/docs/hooks.md) —— 创建新 Hooks 的清单
- [工作流与流程](.claude/docs/workflow.md) —— 何时计划、验证、Bug 修复
- [Git 与 PR](.claude/docs/git.md) —— 工作树工作流、分支、创建 PR
- [贡献指南](CONTRIBUTING.md) —— 完整的贡献指南

## 文档目录结构（`docs/`）

文档站点是基于 **Fumadocs** + **Next.js** 构建的现代化文档系统，位于项目根目录的 `docs/` 文件夹中。

### 技术栈

| 技术 | 用途 |
|------|------|
| Fumadocs | 文档框架（MDX 支持、搜索、导航） |
| Next.js 16 | React 框架（App Router） |
| Tailwind CSS 4 | 样式系统 |
| Shiki | 代码语法高亮 |
| Mermaid | 流程图/图表 |

### 目录结构

```
docs/
├── app/                    # Next.js App Router
│   ├── (home)/            # 首页路由组
│   ├── api/               # API 路由（搜索、调试）
│   ├── integrations/      # 集成框架页面
│   └── layout.tsx         # 根布局
├── content/docs/          # 文档内容（MDX）
│   ├── (root)/            # 核心文档
│   ├── learn/             # 学习教程
│   ├── reference/         # API 参考文档
│   │   ├── v1/           # V1 API 参考
│   │   └── v2/           # V2 API 参考
│   └── integrations/      # 框架集成文档
├── snippets/              # 可复用文档片段
│   ├── shared/           # 跨框架共享片段
│   └── integrations/     # 集成专用片段
├── components/            # React 组件
├── lib/                   # 工具函数
├── scripts/               # 构建脚本
└── public/               # 静态资源
```

### 文档内容组织

#### 1. 核心文档 `(root)/`

| 分类 | 内容 |
|------|------|
| **Getting Started** | 首页、快速开始、编程 Agent 设置 |
| **Basics** | 预置组件、自定义外观、程序化控制、调试器 |
| **Generative UI** | 生成式 UI 指南（仅展示、交互式、工具渲染） |
| **App Control** | 前端工具、共享状态 |
| **Backend** | CopilotRuntime、AG-UI 协议 |
| **Premium** | 高级功能（可观测性、检查器） |
| **Troubleshooting** | 常见问题、错误调试、迁移指南 |

#### 2. 集成文档 `integrations/`

支持 **14 个框架/平台**的集成文档：

| 集成框架 | 路径 | 特色功能 |
|----------|------|----------|
| LangGraph | `/langgraph` | 最完整的文档，含教程、视频、高级主题 |
| CrewAI Flows | `/crewai-flows` | 人机协同、持久化 |
| Pydantic AI | `/pydantic-ai` | 快速开始、高级用法 |
| LlamaIndex | `/llamaindex` | 共享状态、生成式 UI |
| Mastra | `/mastra` | 完整功能支持 |
| AG2 | `/ag2` | 代码贡献、遥测 |
| AGno | `/agno` | 故障排查 |
| ADK | `/adk` | 高级功能 |
| Microsoft Agent Framework | `/microsoft-agent-framework` | 企业级集成 |
| AWS Strands | `/aws-strands` | AWS 生态 |
| A2A | `/a2a` | A2A 协议支持 |
| Agent Spec | `/agent-spec` | 规范实现 |
| Built-in Agent | `/built-in-agent` | 内置 Agent 教程 |

每个集成框架包含：
- `quickstart/` - 快速开始
- `generative-ui/` - 生成式 UI（含 `your-components/`）
- `shared-state/` - 状态共享
- `human-in-the-loop/` - 人机协同
- `custom-look-and-feel/` - 自定义外观
- `troubleshooting/` - 故障排查
- `premium/` - 高级功能
- `advanced/` - 高级主题（持久化等）
- `tutorials/` - 教程

#### 3. 学习区 `learn/`

| 内容 | 描述 |
|------|------|
| `whats-new/` | 新功能介绍 |
| `generative-ui/specs/` | 生成式 UI 规范 |
| `agentic-protocols` | Agent 协议 |
| `ag-ui-protocol` | AG-UI 协议详解 |
| `connect-mcp-servers` | MCP 服务器连接 |
| `a2a-protocol` | A2A 协议 |
| `architecture` | 架构说明 |

#### 4. 参考文档 `reference/`

| 版本 | 内容 |
|------|------|
| **v1** | Classes、Components、Hooks、SDK（JS/Python） |
| **v2** | Components、Hooks（新版 API） |

### Snippets（文档片段）

`snippets/` 目录包含可复用的 MDX 片段，用于跨文档保持一致性：

```
snippets/
├── shared/                    # 跨框架共享
│   ├── basics/               # 基础概念
│   ├── guides/               # 通用指南
│   ├── generative-ui/        # 生成式 UI
│   ├── backend/              # 后端
│   ├── troubleshooting/      # 故障排查
│   ├── contributing/         # 贡献指南
│   ├── premium/              # 高级功能
│   └── telemetry/            # 遥测
└── integrations/             # 集成专用
    └── <framework>/
        └── run-and-connect.mdx
```

### 关键配置文件

| 文件 | 用途 |
|------|------|
| `source.config.ts` | Fumadocs MDX 配置、插件 |
| `next.config.mjs` | Next.js 配置、URL 重定向（150+ 条） |
| `middleware.ts` | 中间件（ Clerk 认证、PostHog） |
| `meta.json` | 文档导航结构 |

### 文档开发命令

```bash
# 进入 docs 目录
cd docs

# 安装依赖
npm install

# 开发模式（含自动生成）
npm run dev

# 构建
npm run build

# 检查死链
npm run check-links

# 验证死链
npm run verify-broken-links

# 生成功能矩阵
npm run generate
```

### URL 路由设计

- **根级框架**: `/<framework>/quickstart` → `/integrations/<framework>/quickstart`
- **参考文档**: `/reference/v2/hooks/useAgent`
- **学习区**: `/learn/ag-ui-protocol`

### 文档规范

1. **MDX 格式**: 所有文档使用 `.mdx` 格式（共 575+ 个文件）
2. **Frontmatter**: 支持 `hideHeader`、`hideTOC` 等字段
3. **代码高亮**: 使用 Shiki，支持 Diff/Highlight/WordHighlight
4. **包管理器切换**: `npm`/`yarn`/`pnpm` 自动切换
5. **Mermaid 图表**: 支持流程图、序列图

## 外部资源

- **文档**：https://docs.copilotkit.ai/
- **Discord**：https://discord.gg/6dffbvGU3D
- **AG-UI 协议**：https://github.com/ag-ui-protocol/ag-ui
- **Copilot Cloud**：https://cloud.copilotkit.ai/
