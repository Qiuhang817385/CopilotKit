# docs 构建说明：npm run build 与仅打包中文

## 在 docs 里执行 `npm run build` 会发生什么

1. **prebuild**（自动执行）
   - `npm run generate`：生成集成相关数据（如 `generate-integration-features.mjs`）
   - `npm run check-links`：检查并报告断链（`check-broken-links.js`）

2. **next build**
   - **fumadocs-mdx**：根据 `source.config.ts` 和 `content/docs` 编译所有 MDX，输出到 `.source/`
   - **Next.js**：根据 `app/source.ts` 的 `source` 和 `generateStaticParams()` 为**所有文档路径**做静态生成（SSG）
   - 结果：`(root)`、`(root)_cn`、`reference`、`learn`、`integrations/*`、`integrations/*_cn` 等全部会生成静态 HTML

3. **产物**
   - `.next/`：构建结果
   - 每个文档对应一个预渲染页面（英文 + 中文都会被打包）

因此，**默认会同时打包英文和中文文档**，构建时间和体积都包含两套内容。

---

## 如果不想打包英文文档（仅打包中文）

思路：用**环境变量**在 `generateStaticParams()` 里只返回“中文”对应的 slug，这样 Next 只会为中文路由做静态生成，英文路由不会预渲染（访问时 404 或走动态渲染，取决于你是否要屏蔽英文）。

### 1. 环境变量约定

在构建时设置：

```bash
BUILD_CN_ONLY=1 npm run build
```

或在 `.env.production` 里写：

```
BUILD_CN_ONLY=1
```

### 2. 判断「是否为中文页」的 slug 规则

以下任一成立即视为中文页（与当前 i18n 约定一致）：

- 根中文：`slug[0] === '(root)_cn'`
- 集成中文：`slug[0]?.endsWith('_cn')`（如 `langgraph_cn`）
- 路径中含 `_cn` 段：`slug` 中某一段为 `'_cn'` 或某段以 `_cn` 结尾（如 `integrations/ag2/_cn/xxx`）

### 3. 已实现的改动

- **`lib/i18n-utils.ts`**：新增 `isChineseSlug(slug)`，用于判断某条静态参数是否为中文页。
- **`app/(home)/[[...slug]]/page.tsx`**：`generateStaticParams()` 在 `BUILD_CN_ONLY=1` 时只返回中文 slug。
- **`app/integrations/[[...slug]]/page.tsx`**：同上，只生成中文集成页。
- **`app/og/[...slug]/route.tsx`**：同上，只生成中文页的 og 图。

配置后效果：

- **不设 `BUILD_CN_ONLY`**：行为与现在一致，中英文都打包。
- **设 `BUILD_CN_ONLY=1`**：只对中文路由做静态生成，不打包英文文档，构建更快、产物更小。

---

## 可选：在 next.config 里读环境变量

不需要为“是否打包英文”单独改 next.config，在 `generateStaticParams()` 里用 `process.env.BUILD_CN_ONLY` 即可。若你希望 next.config 里根据该变量做不同配置（例如不同 redirect），可以：

```js
// next.config.mjs
const buildCnOnly = process.env.BUILD_CN_ONLY === '1';
```

再在 `redirects`/`rewrites` 里按 `buildCnOnly` 分支。

---

## 总结

| 问题 | 答案 |
|------|------|
| 在 docs 里执行 `npm run build` 会怎样？ | 先跑 generate + check-links，再 next build；fumadocs-mdx 编译全部 content/docs，Next 对所有文档做 SSG，中英文都会被打包。 |
| 不想打包英文文档怎么配置？ | 设置 `BUILD_CN_ONLY=1`，并在各页的 `generateStaticParams()`（以及 og 的 generateParams）里只返回“中文” slug，实现仅打包中文文档。 |
