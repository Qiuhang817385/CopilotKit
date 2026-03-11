#!/usr/bin/env node
/**
 * 梳理未翻译文档：对比 content/docs 与 snippets 下的英文/中文 MDX，输出尚无中文版本的英文路径。
 *
 * content/docs 约定：
 * - 英文根文档：(root)/* -> 路径 /xxx
 * - 中文根文档：(root)_cn/* -> 对应路径 /xxx
 * - 英文集成：integrations/{name}/* -> /{name}/xxx
 * - 中文集成：integrations/{name}_cn/* 或 .../_cn/*、*_cn.mdx -> /{name}/xxx
 *
 * snippets 约定：
 * - 英文：snippets/shared/guides/mcp-server-setup.mdx -> key = shared/guides/mcp-server-setup
 * - 中文：snippets/shared_cn/guides/mcp-server-setup.mdx 或 .../xxx_cn.mdx 或 snippets/_cn/xxx.mdx -> 同一 key，isCn
 *
 * 用法：node scripts/list-untranslated-docs.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONTENT_ROOT = path.join(__dirname, "..", "content", "docs");
const SNIPPETS_ROOT = path.join(__dirname, "..", "snippets");

const CN_INTEGRATIONS = [
  "adk",
  "aws-strands",
  "built-in-agent",
  "langgraph",
  "mastra",
  "microsoft-agent-framework",
];

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

/**
 * 从相对 content/docs 的路径得到「逻辑路径」和是否为中文。
 * 逻辑路径 = 英文 URL 形式，用于对比同一页的 EN/CN。
 */
function toLogicalPath(rel) {
  // rel is normalized (forward slashes); strip .mdx and split by /
  const segs = rel.replace(/\.mdx$/, "").split("/").filter(Boolean);

  // (root)/index -> /, (root)/quickstart -> /quickstart
  if (segs[0] === "(root)" && !rel.includes("_cn")) {
    const rest = segs.slice(1);
    if (rest.length === 0 || rest[0] === "index") return { key: "/", isCn: false };
    return { key: "/" + rest.join("/"), isCn: false };
  }

  // (root)_cn/...
  if (segs[0] === "(root)_cn") {
    const rest = segs.slice(1);
    const key = rest.length === 0 || rest[0] === "index" ? "/" : "/" + rest.join("/");
    return { key, isCn: true };
  }

  // reference/v1/..., learn/... (xxx_cn filename or _cn folder -> CN)
  if (segs[0] === "reference" || segs[0] === "learn") {
    let keySegs = segs;
    let isCn = false;
    const cnIdx = segs.indexOf("_cn");
    if (cnIdx >= 0) {
      isCn = true;
      keySegs = [...segs.slice(0, cnIdx), ...segs.slice(cnIdx + 1)];
    } else {
      const last = segs[segs.length - 1];
      if (typeof last === "string" && last.endsWith("_cn")) {
        isCn = true;
        keySegs = [...segs.slice(0, -1), last.slice(0, -3)];
      }
    }
    return { key: "/" + keySegs.join("/"), isCn };
  }

  // integrations/name/... or integrations/name_cn/... or .../_cn/... or .../file_cn.mdx
  if (segs[0] === "integrations" && segs.length >= 2) {
    const name = segs[1];
    let rest = segs.slice(2);
    let isCn = false;

    // file_cn.mdx (last segment ends with _cn) -> CN, key uses segment without _cn
    const lastSegment = rest[rest.length - 1];
    if (typeof lastSegment === "string" && lastSegment.endsWith("_cn")) {
      isCn = true;
      rest = [...rest.slice(0, -1), lastSegment.slice(0, -3)];
    }

    const cnSegmentIndex = rest.indexOf("_cn");
    let integrationName = name;
    let restPath = rest;

    if (name.endsWith("_cn")) {
      integrationName = name.slice(0, -3);
      isCn = true;
    } else if (cnSegmentIndex >= 0) {
      restPath = [...rest.slice(0, cnSegmentIndex), ...rest.slice(cnSegmentIndex + 1)];
      isCn = true;
    }

    const key = "/" + integrationName + (restPath.length ? "/" + restPath.join("/") : "");
    return { key, isCn };
  }

  // _cn/integrations/... (alternate structure)
  if (segs[0] === "_cn") {
    const rest = segs.slice(1);
    const key = "/" + rest.join("/");
    return { key, isCn: true };
  }

  return { key: null, isCn: false };
}

/**
 * 从相对 snippets 的路径得到「逻辑路径」和是否为中文。
 * 约定：目录或文件名带 _cn 的为中文，key 为去掉 _cn 后的路径（如 shared_cn/guides/foo -> shared/guides/foo）。
 */
function toSnippetLogicalPath(rel) {
  const normalized = rel.replace(/\.mdx$/, "").split(path.sep).join("/");
  const segs = normalized.split("/").filter(Boolean);

  if (segs.length === 0) return { key: null, isCn: false };

  let isCn = false;
  const keySegs = [];

  for (let i = 0; i < segs.length; i++) {
    const s = segs[i];
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

const enKeys = new Set();
const cnKeys = new Set();

for (const { rel } of walkMdx(CONTENT_ROOT)) {
  const normalized = path.normalize(rel).split(path.sep).join("/");
  const { key, isCn } = toLogicalPath(normalized);
  if (!key) continue;

  if (isCn) {
    cnKeys.add(key);
  } else {
    enKeys.add(key);
  }
}

const snippetEnKeys = new Set();
const snippetCnKeys = new Set();
if (fs.existsSync(SNIPPETS_ROOT)) {
  for (const { rel } of walkMdx(SNIPPETS_ROOT)) {
    const { key, isCn } = toSnippetLogicalPath(rel);
    if (!key) continue;
    if (isCn) {
      snippetCnKeys.add(key);
    } else {
      snippetEnKeys.add(key);
    }
  }
}

const snippetUntranslated = [...snippetEnKeys].filter((k) => !snippetCnKeys.has(k)).sort();

const integrationPrefixes = CN_INTEGRATIONS.map((n) => "/" + n + "/");
const isRootDoc = (k) => {
  if (k === "/") return true;
  const parts = k.replace(/^\//, "").split("/");
  return parts.length === 1; // e.g. /quickstart
};
const isCnIntegrationPath = (k) =>
  integrationPrefixes.some((p) => k === p.slice(0, -1) || k.startsWith(p));

const untranslatedRoot = [];
const untranslatedByIntegration = new Map();
const allUntranslated = [];

for (const key of enKeys) {
  if (cnKeys.has(key)) continue;
  allUntranslated.push(key);

  if (key.startsWith("/reference") || key.startsWith("/learn")) {
    continue; // 不要求 reference/learn 有中文
  }

  if (isRootDoc(key)) {
    untranslatedRoot.push(key);
    continue;
  }

  if (isCnIntegrationPath(key)) {
    const intName = key.split("/")[1];
    if (!untranslatedByIntegration.has(intName)) {
      untranslatedByIntegration.set(intName, []);
    }
    untranslatedByIntegration.get(intName).push(key);
  }
}

// 输出
const out = [];
out.push("# 未翻译文档梳理");
out.push("");
out.push("基于 `content/docs` 下 MDX 与约定规则对比得出：尚无中文版本的英文路径。");
out.push("");

if (untranslatedRoot.length) {
  out.push("## 根文档 (root) 未翻译");
  out.push("");
  untranslatedRoot.sort().forEach((k) =>
    out.push("- `" + k + "` 或 `(root)/" + k.replace(/^\//, "") + "`")
  );
  out.push("");
}

out.push("## 集成文档未翻译（仅列出有 _cn 的集成）");
out.push("");
for (const [name, paths] of [...untranslatedByIntegration.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
  out.push(`### ${name}`);
  paths.sort().forEach((p) => out.push(`- \`${p}\``));
  out.push("");
}

out.push("## 全部未翻译的英文路径（含 reference、learn、无 _cn 的集成）");
out.push("");
allUntranslated.sort();
allUntranslated.forEach((k) => out.push("- `" + k + "`"));
out.push("");

out.push("## Snippets 未翻译");
out.push("");
out.push("基于 `snippets/` 下 MDX：目录或文件名为 `*_cn` 或位于 `_cn/` 下视为中文版，其余为英文；同一逻辑路径（去掉 _cn 后）有 EN 无 CN 则列入未翻译。");
out.push("");
if (snippetUntranslated.length === 0) {
  out.push("（当前无未翻译 snippet）");
} else {
  snippetUntranslated.forEach((k) => out.push("- `snippets/" + k.replace(/\//g, "/") + ".mdx`"));
}
out.push("");

out.push("## 统计");
out.push("");
out.push("- 英文路径总数: " + enKeys.size);
out.push("- 中文路径总数: " + cnKeys.size);
out.push("- 未翻译英文路径总数: " + allUntranslated.length);
out.push("- 根文档未翻译数量: " + untranslatedRoot.length);
out.push("- 有未翻译页的集成数: " + untranslatedByIntegration.size);
out.push("- 集成未翻译条数: " + [...untranslatedByIntegration.values()].reduce((s, arr) => s + arr.length, 0));
out.push("- **Snippets 英文数: " + snippetEnKeys.size + "**");
out.push("- **Snippets 中文数: " + snippetCnKeys.size + "**");
out.push("- **Snippets 未翻译数: " + snippetUntranslated.length + "**");

const reportPath = path.join(__dirname, "..", "UNTRANSLATED_DOCS.md");
fs.writeFileSync(reportPath, out.join("\n"), "utf8");
console.log("Written:", reportPath);
console.log(out.join("\n"));
