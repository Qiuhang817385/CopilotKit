# vercel.json 配置参考

`vercel.json` 放在项目根目录（或 Vercel 设置的 Root Directory），用于覆盖 Vercel 的默认行为。**该文件中的配置优先于 Vercel 仪表盘中的项目设置**。

可在文件顶部添加 `$schema` 以在编辑器中获得自动补全与校验：

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json"
}
```

---

## 构建与开发

### buildCommand

- **类型**: `string | null`
- **说明**: 覆盖「项目设置」中的 Build Command 以及 `package.json` 中的 `build` 脚本。部署时实际执行的构建命令以此为准。

```json
{
  "buildCommand": "next build"
}
```

### installCommand

- **类型**: `string | null`
- **说明**: 覆盖「项目设置」中的 Install Command。设为空字符串会跳过安装步骤。

```json
{
  "installCommand": "pnpm install"
}
```

### devCommand

- **类型**: `string | null`
- **说明**: 覆盖「项目设置」中的 Development Command（如 `vercel dev` 时使用的命令）。

```json
{
  "devCommand": "next dev"
}
```

### ignoreCommand

- **类型**: `string | null`
- **说明**: 覆盖「Ignored Build Step」中的命令。命令退出码为 `0` 时跳过本次构建，为 `1` 时执行构建。

```json
{
  "ignoreCommand": "git diff --quiet HEAD^ HEAD ./"
}
```

---

## 框架与输出

### framework

- **类型**: `string | null`
- **说明**: 覆盖「项目设置」中的 Framework Preset。须为合法框架 slug（如 `nextjs`）。设为 `null` 表示选择「Other」。

```json
{
  "framework": "nextjs"
}
```

### outputDirectory

- **类型**: `string | null`
- **说明**: 覆盖「项目设置」中的 Output Directory，即构建产物的目录（如 `build`、`.next`）。

```json
{
  "outputDirectory": "build"
}
```

---

## 路由与重定向

### redirects

- **类型**: `Array`  of redirect 对象
- **说明**: 定义重定向规则。

| 属性 | 说明 |
|------|------|
| `source` | 匹配请求路径的模式（不含 query） |
| `destination` | 目标路径或完整 URL |
| `permanent` | `true` 为 308 永久重定向，`false` 为 307 临时重定向，默认 `true` |
| `statusCode` | 指定状态码（如 301、302、307、308），与 `permanent` 二选一 |
| `has` | 条件匹配：需满足指定 header/cookie/query 等才重定向 |
| `missing` | 条件匹配：需缺少指定属性才重定向 |

```json
{
  "redirects": [
    { "source": "/me", "destination": "/profile.html", "permanent": false },
    { "source": "/blog/:path*", "destination": "/news/:path*" }
  ]
}
```

### rewrites

- **类型**: `Array` of rewrite 对象
- **说明**: URL 重写（不改变浏览器地址栏，内部转发）。可配合 `has`/`missing` 做条件重写。

| 属性 | 说明 |
|------|------|
| `source` | 匹配路径的模式 |
| `destination` | 目标路径或外部 URL |
| `has` / `missing` | 条件匹配 |

```json
{
  "rewrites": [
    { "source": "/proxy/:match*", "destination": "https://example.com/:match*" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### routes

- **类型**: `Array` of route 对象
- **说明**: 使用 PCRE 正则定义路由规则，可做重定向、改写、自定义 header、状态码、transforms 等。常见场景更推荐用上层的 `redirects`、`rewrites`、`headers`。

| 属性 | 别名 | 说明 |
|------|------|------|
| `src` | `source` | 匹配路径的 PCRE 正则 |
| `dest` | `destination` | 目标路径或 URL，可用 `$1`、`$2` 引用捕获组 |
| `methods` | — | HTTP 方法数组，不写则匹配所有方法 |
| `headers` | — | 响应头键值对 |
| `status` | `statusCode` | 响应状态码 |
| `continue` | — | `true` 时匹配后继续后续路由 |
| `has` / `missing` | — | 条件匹配 |
| `transforms` | — | 对 request/response header、query 的增删改 |
| `mitigate` | — | WAF 行为：`action` 为 `"challenge"` 或 `"deny"` |

### bulkRedirectsPath

- **类型**: `string`（文件或目录路径）
- **说明**: 从 CSV/JSON/JSONL 文件（或目录下多文件）批量导入大量重定向。不支持通配符或 header 条件。

```json
{
  "bulkRedirectsPath": "redirects.csv"
}
```

### trailingSlash

- **类型**: `boolean`（默认 `undefined`）
- **说明**: 控制路径末尾斜杠行为。
  - `false`: `/about/` 重定向到 `/about`（308）
  - `true`: `/about` 重定向到 `/about/`（308），带扩展名的路径不重定向
  - `undefined`: 不重定向，两种 URL 都返回同一内容（不推荐，易导致重复收录）

```json
{
  "trailingSlash": false
}
```

### cleanUrls

- **类型**: `boolean`（默认 `false`）
- **说明**: 为 `true` 时，访问路径会去掉 `.html` 等扩展名；带扩展名访问会 308 重定向到无扩展名路径。

```json
{
  "cleanUrls": true
}
```

---

## 请求头与安全

### headers

- **类型**: `Array` of header 对象
- **说明**: 为匹配的路径设置自定义响应头。

| 属性 | 说明 |
|------|------|
| `source` | 匹配路径的模式 |
| `headers` | `key`/`value` 组成的响应头数组 |
| `has` / `missing` | 条件匹配（如按 header、cookie、query） |

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" }
      ]
    }
  ]
}
```

---

## 函数（Serverless / ISR）

### functions

- **类型**: `Object`，key 为 glob 模式，value 为配置对象
- **说明**: 为匹配的 Vercel Functions（或 ISR 路由）设置运行参数。

**Key**：glob 模式，如 `api/*.js`、`app/og/**`、`pages/blog/[slug].tsx`。

**Value 常用属性**：

| 属性 | 说明 |
|------|------|
| `maxDuration` | 最大执行时间（秒），受套餐限制（Hobby 最高 60s，Pro 300s，Enterprise 900s） |
| `memory` | 内存 MB（128–10240）。启用 Fluid 时需在仪表盘设置 |
| `runtime` | 社区 Runtime 的 npm 包名及版本 |
| `regions` | 部署区域数组，覆盖项目级 `regions` |
| `functionFailoverRegions` | 故障转移区域（Enterprise） |
| `excludeFiles` / `includeFiles` | 排除/包含的 glob（Next.js 中请用 next.config 的 outputFileTracingExcludes/Includes） |
| `supportsCancellation` | 是否支持请求取消（仅 Node.js 运行时） |

```json
{
  "functions": {
    "app/og/**": {
      "maxDuration": 60
    },
    "api/*.js": {
      "memory": 1024,
      "maxDuration": 30
    }
  }
}
```

### regions

- **类型**: `Array` of 区域标识字符串
- **说明**: 项目级默认的 Vercel Functions 部署区域。默认 `iad1`。Pro/Enterprise 可多区域；单函数可用 `functions` 下的 `regions` 覆盖。

```json
{
  "regions": ["sfo1", "iad1"]
}
```

### functionFailoverRegions

- **类型**: `Array` of 区域标识字符串
- **说明**: 主区域不可用时的故障转移区域（Enterprise 等）。也可在 `functions` 中为单函数配置。

```json
{
  "functionFailoverRegions": ["iad1", "sfo1"]
}
```

---

## 图片与资源

### images

- **类型**: `Object`
- **说明**: 配置 [Vercel Image Optimization](https://vercel.com/docs/image-optimization) 行为。

| 属性 | 说明 |
|------|------|
| `sizes` | **必填**。允许的图片宽度数组，请求中的 `w` 必须在此列表中 |
| `remotePatterns` | 允许优化的远程图片域名/路径规则（`protocol`、`hostname`、`pathname`、`search` 等） |
| `localPatterns` | 允许的本地路径规则 |
| `minimumCacheTTL` | 优化后图片的缓存时间（秒） |
| `formats` | 如 `["image/avif", "image/webp"]` |
| `qualities` | 允许的 `q` 参数值数组 |
| `dangerouslyAllowSVG` | 是否允许 SVG 输入（默认 false） |
| `contentSecurityPolicy` | 优化图片的 CSP |
| `contentDispositionType` | `"inline"` 或 `"attachment"` |

> 注意：旧版 `domains` 已废弃，请用 `remotePatterns`。

```json
{
  "images": {
    "sizes": [640, 1080, 2048, 3840],
    "remotePatterns": [
      { "protocol": "https", "hostname": "example.com", "pathname": "/**" }
    ],
    "minimumCacheTTL": 60
  }
}
```

---

## 定时与计算

### crons

- **类型**: `Array` of cron 对象
- **说明**: 为生产环境配置定时任务（Cron Jobs）。

| 属性 | 说明 |
|------|------|
| `schedule` | **必填**。Cron 表达式（最长 256 字符） |
| `path` | **必填**。触发时请求的路径，须以 `/` 开头（最长 512 字符） |

```json
{
  "crons": [
    { "path": "/api/every-hour", "schedule": "0 * * * *" }
  ]
}
```

### fluid

- **类型**: `boolean | null`
- **说明**: 是否启用 [Fluid Compute](https://vercel.com/docs/fluid-compute)。可按部署或环境覆盖。新项目默认可能已开启。

```json
{
  "fluid": true
}
```

---

## 运行时与可见性

### bunVersion

- **类型**: `string`
- **说明**: 使用 Bun 运行时替代 Node.js。当前有效值为 `"1.x"`。需相应权限。

```json
{
  "bunVersion": "1.x"
}
```

### public

- **类型**: `boolean`（默认 `false`）
- **说明**: 为 `true` 时，Source View 与 Logs View 对所有人可见。

```json
{
  "public": true
}
```

---

## 已废弃 / 遗留字段

以下字段仍可被解析，但不建议新项目使用：

| 属性 | 说明 |
|------|------|
| `builds` | 旧版构建配置，请用框架自动检测或 `buildCommand` |
| `build.env` | 构建时环境变量，请用仪表盘 Environment Variables |
| `env` | 部署环境变量，请用仪表盘 |
| `name` | 部署名前缀，请用 [Project Linking](https://vercel.com/docs/cli/project-linking) |

---

## 优先级说明

配置生效优先级（高 → 低）：

1. **项目根目录下的 `vercel.json`**（含 `buildCommand`、`installCommand`、`redirects` 等）
2. **Vercel 仪表盘** → Project Settings → Build and Deployment 等
3. **框架默认**（如 Next.js 的 `next build`）或 **`package.json`** 中的 `scripts.build`

因此若在 `vercel.json` 中写了 `buildCommand`，会覆盖仪表盘和 `package.json` 的 build 配置。

---

## 参考链接

- [Vercel – Static Configuration (vercel.json)](https://vercel.com/docs/project-configuration/vercel-json)
- [Schema（编辑器补全）](https://openapi.vercel.sh/vercel.json)
- [Redirects](https://vercel.com/docs/redirects) · [Rewrites](https://vercel.com/docs/rewrites) · [Headers](https://vercel.com/docs/headers)
- [Configuring Functions](https://vercel.com/docs/functions/configuring-functions) · [Regions](https://vercel.com/docs/regions) · [Cron Jobs](https://vercel.com/docs/cron-jobs)
