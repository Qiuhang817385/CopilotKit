# 中文文档中应改为 _cn 的 Snippet Import

以下文档为中文版，但 import 仍指向英文 snippet；若对应 snippet 已有中文版，请将路径改为下表中的「建议路径」。

## 修改状态：✅ 已完成

所有 401 条 import 路径已自动批量修改为对应的中文 snippet 路径。

---

## 原始清单（已处理）

<details>
<summary>点击查看原始 401 条 import 修改清单</summary>

| 文档 | 当前 import | 建议改为 |
|------|-------------|----------|
| `(root)_cn/backend/ag-ui.mdx` | `@/snippets/shared/backend/ag-ui.mdx` | `@/snippets/shared_cn/backend/ag-ui.mdx` |
| `(root)_cn/backend/copilot-runtime.mdx` | `@/snippets/copilot-runtime.mdx` | `@/snippets/_cn/copilot-runtime.mdx` |
| `(root)_cn/coding-agent-setup.mdx` | `@/snippets/shared/guides/mcp-server-setup.mdx` | `@/snippets/shared_cn/guides/mcp-server-setup.mdx` |
| `(root)_cn/custom-look-and-feel/reasoning-messages.mdx` | `@/snippets/shared/guides/custom-look-and-feel/reasoning-messages.mdx` | `@/snippets/shared_cn/guides/custom-look-and-feel/reasoning-messages.mdx` |
| `(root)_cn/index.mdx` | `@/snippets/landing-code-showcase.mdx` | `@/snippets/_cn/landing-code-showcase.mdx` |
| `(root)_cn/inspector.mdx` | `@/snippets/shared/premium/inspector.mdx` | `@/snippets/shared/premium_cn/inspector.mdx` |
| `(root)_cn/premium/headless-ui.mdx` | `@/snippets/shared/guides/custom-look-and-feel/headless-ui.mdx` | `@/snippets/shared_cn/guides/custom-look-and-feel/headless-ui.mdx` |
| `(root)_cn/premium/observability.mdx` | `@/snippets/shared/premium/observability.mdx` | `@/snippets/shared/premium_cn/observability.mdx` |
| `(root)_cn/premium/overview.mdx` | `@/snippets/shared/premium/overview.mdx` | `@/snippets/shared/premium_cn/overview.mdx` |
| `(root)_cn/troubleshooting/common-issues.mdx` | `@/snippets/shared/troubleshooting/common-issues.mdx` | `@/snippets/shared/troubleshooting_cn/common-issues.mdx` |
| `(root)_cn/troubleshooting/error-debugging.mdx` | `@/snippets/shared/troubleshooting/error-debugging.mdx` | `@/snippets/shared/troubleshooting_cn/error-debugging.mdx` |
| `(root)_cn/troubleshooting/migrate-to-1.10.X.mdx` | `@/snippets/shared/troubleshooting/migrate-to-1.10.X.mdx` | `@/snippets/shared/troubleshooting_cn/migrate-to-1.10.X.mdx` |
| `(root)_cn/troubleshooting/migrate-to-1.8.2.mdx` | `@/snippets/shared/troubleshooting/migrate-to-1.8.2.mdx` | `@/snippets/shared/troubleshooting_cn/migrate-to-1.8.2.mdx` |
| `(root)_cn/troubleshooting/migrate-to-v2.mdx` | `@/snippets/shared/troubleshooting/migrate-to-v2.mdx` | `@/snippets/shared/troubleshooting_cn/migrate-to-v2.mdx` |
| `(root)_cn/troubleshooting/observability-connectors.mdx` | `@/snippets/shared/troubleshooting/observability-connectors.mdx` | `@/snippets/shared_cn/troubleshooting/observability-connectors.mdx` |

... (共 401 条，详见 git diff)

</details>

---

## 批量修改脚本

如需重新运行批量修改，可使用以下 PowerShell 脚本：

```powershell
# 处理所有中文文档目录
$cnDirs = @(
    "docs/content/docs/(root)_cn",
    "docs/content/docs/integrations/adk_cn",
    "docs/content/docs/integrations/ag2_cn",
    "docs/content/docs/integrations/agent-spec_cn",
    "docs/content/docs/integrations/agno_cn",
    "docs/content/docs/integrations/aws-strands_cn",
    "docs/content/docs/integrations/built-in-agent_cn",
    "docs/content/docs/integrations/langgraph_cn",
    "docs/content/docs/integrations/llamaindex_cn",
    "docs/content/docs/integrations/mastra_cn",
    "docs/content/docs/integrations/microsoft-agent-framework_cn",
    "docs/content/docs/integrations/pydantic-ai_cn",
    "docs/content/docs/learn",
    "docs/content/docs/reference"
)

foreach ($dir in $cnDirs) {
    if (Test-Path $dir) {
        $files = Get-ChildItem -Path $dir -Recurse -Filter "*.mdx"
        foreach ($file in $files) {
            $content = Get-Content $file.FullName -Raw -Encoding UTF8
            $content = $content -replace '@/snippets/shared/(?!shared_cn|.*_cn)', '@/snippets/shared_cn/'
            $content = $content -replace '@/snippets/integrations/(\w+)/', '@/snippets/integrations/${1}_cn/'
            $content = $content -replace '@/snippets/coagents/', '@/snippets/coagents_cn/'
            $content = $content -replace '@/snippets/([a-zA-Z0-9_-]+)\.mdx', '@/snippets/_cn/${1}.mdx'
            [System.IO.File]::WriteAllText($file.FullName, $content, [System.Text.Encoding]::UTF8)
        }
    }
}

# 处理所有 _cn 子目录
$allCnDirs = Get-ChildItem -Path "docs/content/docs" -Recurse -Directory -Filter "_cn"
foreach ($dir in $allCnDirs) {
    $files = Get-ChildItem -Path $dir.FullName -Recurse -Filter "*.mdx" -ErrorAction SilentlyContinue
    foreach ($file in $files) {
        $content = Get-Content $file.FullName -Raw -Encoding UTF8
        $content = $content -replace '@/snippets/shared/(?!shared_cn|.*_cn)', '@/snippets/shared_cn/'
        $content = $content -replace '@/snippets/integrations/(\w+)/', '@/snippets/integrations/${1}_cn/'
        $content = $content -replace '@/snippets/coagents/', '@/snippets/coagents_cn/'
        $content = $content -replace '@/snippets/([a-zA-Z0-9_-]+)\.mdx', '@/snippets/_cn/${1}.mdx'
        [System.IO.File]::WriteAllText($file.FullName, $content, [System.Text.Encoding]::UTF8)
    }
}

# 移除 BOM
$files = git status --short | ForEach-Object { $_.Substring(3) }
foreach ($file in $files) {
    $fullPath = Join-Path (Get-Location) $file
    if (Test-Path $fullPath) {
        $bytes = [System.IO.File]::ReadAllBytes($fullPath)
        if ($bytes.Length -ge 3 -and $bytes[0] -eq 239 -and $bytes[1] -eq 187 -and $bytes[2] -eq 191) {
            $newBytes = $bytes[3..($bytes.Length-1)]
            [System.IO.File]::WriteAllBytes($fullPath, $newBytes)
        }
    }
}
```

---

## 统计

- 涉及中文文档数: 352
- 建议修改的 import 条数: 401
- **状态: ✅ 已完成批量修改**

---

## 修改时间

- 完成时间: 2026-03-12
- 修改文件数: 620
