# Fumadocs i18n 参考 (Context 7)

整理自 [Fumadocs 官方文档](https://www.fumadocs.dev/docs/internationalization/next)。

## 1. 配置 (defineI18n)

```ts
import { defineI18n } from 'fumadocs-core/i18n';

export const i18n = defineI18n({
  defaultLanguage: 'en',
  languages: ['en', 'cn', 'vi'],
});
```

## 2. Middleware

```ts
import { createI18nMiddleware } from 'fumadocs-core/i18n/middleware';
export default createI18nMiddleware(i18n);
```

## 3. 路由与传 locale

- 使用 `/app/[lang]`，将 `lang` 传入 layout：`baseOptions(lang)`，`source.getPageTree(lang)`，`source.getPage(slug, lang)`。
- RootProvider：`i18n={i18nUI.provider(lang)}`。

## 4. 站内链接

- `useParams()` 取 `lang`，链接写 `/${lang}/...`。
- MDX 内可用 `<DynamicLink href="/[lang]/another-page">`。

---

本项目采用自定义方案：`/_cn` 前缀 + `(root)_cn` / `*_cn` 目录，未使用 `[lang]` 动态段。
