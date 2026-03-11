#!/usr/bin/env node
/**
 * 列出「中文文档里仍引用英文 snippet」的 import，便于批量改为 _cn 路径。
 *
 * 约定：文档路径含 (root)_cn、/_cn/、*_cn 或 /_cn 目录段视为中文文档；
 * snippet 存在 xxx_cn 目录或 xxx_cn.mdx 或 _cn/xxx 则视为有中文版。
 *
 * 用法：node scripts/list-cn-docs-using-en-snippets.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONTENT_ROOT = path.join(__dirname, "..", "content", "docs");
const SNIPPETS_ROOT = path.join(__dirname, "..", "snippets");

function* walkMdx(dir, prefix = "") {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const rel = path.join(prefix, e.name);
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      yield* walkMdx(full, rel);
    } else if (e.name.endsWith(".mdx")) {
      yield { rel, full };
    }
  }
}

function toSnippetKey(rel) {
  const normalized = rel.replace(/\.mdx$/, "").split(path.sep).join("/");
  const segs = normalized.split("/").filter(Boolean);
  let isCn = false;
  const keySegs = [];
  for (const s of segs) {
    if (s === "_cn") {
      isCn = true;
      continue;
    }
    if (s.endsWith("_cn")) {
      isCn = true;
      keySegs.push(s.slice(0, -3));
    } else {
      keySegs.push(s);
    }
  }
  const key = keySegs.join("/");
  return key ? { key, isCn } : { key: null, isCn: false };
}

/** 是否为中文文档路径（相对 content/docs） */
function isCnDocPath(rel) {
  const n = path.normalize(rel).split(path.sep).join("/");
  if (n.startsWith("(root)_cn")) return true;
  if (n.includes("/_cn/") || n.includes("\\_cn\\")) return true;
  if (/\/([^/]+)_cn(\/|$)/.test(n) || /\\([^\\]+)_cn(\\|$)/.test(n)) return true;
  return false;
}

/** 从文件内容中提取 import ... from "@/snippets/xxx.mdx" 的 xxx 路径 */
function extractSnippetImports(content) {
  const re = /import\s+\w+\s+from\s+["']@\/snippets\/([^"']+\.mdx)["']/g;
  const paths = [];
  let m;
  while ((m = re.exec(content)) !== null) {
    paths.push(m[1].replace(/\.mdx$/, ""));
  }
  return paths;
}

// 1) 建立 snippet 逻辑 key -> 中文版实际路径（相对 snippets/）
const snippetKeyToCnRel = new Map();
if (fs.existsSync(SNIPPETS_ROOT)) {
  for (const { rel } of walkMdx(SNIPPETS_ROOT)) {
    const norm = path.normalize(rel).split(path.sep).join("/");
    const { key, isCn } = toSnippetKey(norm);
    if (!key || !isCn) continue;
    snippetKeyToCnRel.set(key, norm + (norm.endsWith(".mdx") ? "" : ".mdx"));
  }
}

// 2) 扫描中文文档，收集「引用了英文 snippet 且该 snippet 有中文版」的项
const entries = [];
for (const { rel, full } of walkMdx(CONTENT_ROOT)) {
  const norm = path.normalize(rel).split(path.sep).join("/");
  if (!isCnDocPath(norm)) continue;

  const content = fs.readFileSync(full, "utf8");
  const imports = extractSnippetImports(content);
  for (const snippetPath of imports) {
    const cnRel = snippetKeyToCnRel.get(snippetPath);
    if (cnRel) {
      entries.push({
        doc: norm,
        current: snippetPath + ".mdx",
        suggested: cnRel,
      });
    }
  }
}

// 3) 按文档路径分组输出
const byDoc = new Map();
for (const e of entries) {
  if (!byDoc.has(e.doc)) byDoc.set(e.doc, []);
  byDoc.get(e.doc).push({ current: e.current, suggested: e.suggested });
}

const out = [];
out.push("# 中文文档中应改为 _cn 的 Snippet Import");
out.push("");
out.push("以下文档为中文版，但 import 仍指向英文 snippet；若对应 snippet 已有中文版，请将路径改为下表中的「建议路径」。");
out.push("");
out.push("| 文档 | 当前 import | 建议改为 |");
out.push("|------|-------------|----------|");

for (const [doc, items] of [...byDoc.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
  const uniq = Array.from(
    new Map(items.map((i) => [i.current, i.suggested])).entries()
  );
  for (const [current, suggested] of uniq) {
    out.push("| `" + doc + "` | `@/snippets/" + current + "` | `@/snippets/" + suggested + "` |");
  }
}

out.push("");
out.push("## 统计");
out.push("");
out.push("- 涉及中文文档数: " + byDoc.size);
out.push("- 建议修改的 import 条数: " + entries.length);

const reportPath = path.join(__dirname, "..", "CN_DOCS_EN_SNIPPET_IMPORTS.md");
fs.writeFileSync(reportPath, out.join("\n"), "utf8");
console.log("Written:", reportPath);
console.log(out.join("\n"));
