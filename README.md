# 雷速体育面试准备静态站点

本目录可以直接作为 GitHub 仓库根目录，通过 GitHub Pages 和 GitHub Actions 发布。

## 页面

- `index.html`：所有公开 HTML 的导航首页
- `pages.json`：导航页使用的页面目录
- `interview-guide.html`：产品总监面试准备（公开脱敏版）
- `metrics.html`：雷速体育指标体系
- `data-analysis-discussion.html`：通用数据分析问题与九个业务场景的持续讨论记录
- `AGENTS.md`：约束后续每轮讨论的更新、检查与发布流程

新增 HTML 时，同时在 `pages.json` 中登记标题、描述、路径、分类和更新日期。

## 发布

1. 将本目录中的全部文件推送到 GitHub 仓库的 `main` 分支。
2. 打开仓库的 `Settings > Pages`。
3. 在 `Build and deployment > Source` 中选择 `GitHub Actions`。
4. 打开仓库的 `Actions` 页面，等待 `Deploy GitHub Pages` 完成。

GitHub Pages 通常公开可访问。发布前请再次检查页面内容是否适合公开。
