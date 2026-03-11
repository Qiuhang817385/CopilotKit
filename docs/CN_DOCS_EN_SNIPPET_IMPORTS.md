# 中文文档中应改为 _cn 的 Snippet Import

以下文档为中文版，但 import 仍指向英文 snippet；若对应 snippet 已有中文版，请将路径改为下表中的「建议路径」。

## 修改状态：✅ 已完成

所有中文文档的 import 路径已自动批量修改为对应的中文 snippet 路径。

---

## 批量修改脚本

如需重新运行批量修改，可使用以下 PowerShell 脚本：

```powershell
# 处理所有中文文档
$files = Get-ChildItem -Path "docs/content/docs" -Recurse -Filter "*.mdx" | 
    Where-Object { $_.FullName -match '_cn' -or $_.DirectoryName -match '_cn' }

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    if ($content -match '@/snippets/') {
        # shared/<folder>/ -> shared/<folder>_cn/
        $content = $content -replace '@/snippets/shared/troubleshooting/', '@/snippets/shared/troubleshooting_cn/'
        $content = $content -replace '@/snippets/shared/premium/', '@/snippets/shared/premium_cn/'
        $content = $content -replace '@/snippets/shared/app-control/', '@/snippets/shared/app-control_cn/'
        $content = $content -replace '@/snippets/shared/guides/', '@/snippets/shared/guides_cn/'
        $content = $content -replace '@/snippets/shared/reference/', '@/snippets/shared/reference_cn/'
        $content = $content -replace '@/snippets/shared/telemetry/', '@/snippets/shared/telemetry_cn/'
        
        # shared/<folder>/ -> shared_cn/<folder>/
        $content = $content -replace '@/snippets/shared/backend/', '@/snippets/shared_cn/backend/'
        $content = $content -replace '@/snippets/shared/basics/', '@/snippets/shared_cn/basics/'
        $content = $content -replace '@/snippets/shared/contributing/', '@/snippets/shared_cn/contributing/'
        $content = $content -replace '@/snippets/shared/generative-ui/', '@/snippets/shared_cn/generative-ui/'
        
        # integrations/<name>/ -> integrations/<name>_cn/
        $content = $content -replace '@/snippets/integrations/(\w+)/', '@/snippets/integrations/${1}_cn/'
        
        # coagents/ -> coagents_cn/
        $content = $content -replace '@/snippets/coagents/', '@/snippets/coagents_cn/'
        
        # /<file>.mdx -> /_cn/<file>.mdx
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

## 路径替换规则

| 原路径 | 新路径 | 示例 |
|--------|--------|------|
| `shared/troubleshooting/` | `shared/troubleshooting_cn/` | migrate-to-1.8.2.mdx |
| `shared/premium/` | `shared/premium_cn/` | observability.mdx |
| `shared/app-control/` | `shared/app-control_cn/` | frontend-tools.mdx |
| `shared/guides/` | `shared/guides_cn/` | headless-ui.mdx |
| `shared/reference/` | `shared/reference_cn/` | copilotkit-component.mdx |
| `shared/telemetry/` | `shared/telemetry_cn/` | anonymous.mdx |
| `shared/backend/` | `shared_cn/backend/` | ag-ui.mdx |
| `shared/basics/` | `shared_cn/basics/` | prebuilt-components.mdx |
| `shared/contributing/` | `shared_cn/contributing/` | docs-contributions.mdx |
| `shared/generative-ui/` | `shared_cn/generative-ui/` | a2ui.mdx |
| `integrations/<name>/` | `integrations/<name>_cn/` | run-and-connect.mdx |
| `coagents/` | `coagents_cn/` | cloud-configure-copilotkit-provider.mdx |
| `/<file>.mdx` | `/_cn/<file>.mdx` | landing-code-showcase.mdx |

---

## 统计

- 涉及中文文档数: ~350+
- 修改的 import 条数: ~400+
- **状态: ✅ 已完成批量修改**

---

## 修改时间

- 完成时间: 2026-03-12
- 修改文件数: ~260
