# fumadocs-test

这是一个使用 [Create Fumadocs](https://github.com/fuma-nama/fumadocs) 生成的 Next.js 应用程序。

运行开发服务器：

```bash
npm run dev
# 或者
pnpm dev
# 或者
yarn dev
```

在浏览器中打开 http://localhost:3000 查看结果。

## 了解更多

要了解更多关于 Next.js 和 Fumadocs 的信息，请查看以下资源：

- [Next.js 文档](https://nextjs.org/docs) - 了解 Next.js 的功能和 API。
- [学习 Next.js](https://nextjs.org/learn) - 一个交互式的 Next.js 教程。
- [Fumadocs](https://fumadocs.vercel.app) - 了解 Fumadocs

## 使用 Git LFS 的 Vercel 部署

文档资源使用 Git LFS 进行跟踪。为确保生产构建始终接收真实的资源字节（而不是指针文件），请通过 GitHub Actions 使用 `.github/workflows/deploy_docs_vercel.yml` 部署文档。

所需的 GitHub 仓库密钥：

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID_DOCS`

PR 预览：

- `.github/workflows/deploy_docs_vercel_preview.yml` 为非 fork 的拉取请求部署文档预览。
- 该工作流会发布/更新一个固定的 PR 评论，其中包含可点击的 `Open Docs Preview` 链接。

推荐的 Vercel 项目设置：

- 禁用文档项目的基于 Git 的自动部署，让 GitHub Actions 工作流处理生产部署。
