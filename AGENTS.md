# 数据分析讨论站点协作规则

本目录既是数据分析讨论工作区，也是 GitHub Pages 仓库
`Small-Ma/leisu-sports-interview-guide` 的本地工作树。

## 固定讨论范围

用户提出每一个数据分析问题时，除回答通用方法外，必须分别引申到以下
9 个公司或业务场景：

1. 哈哆普惠
2. 迪果科技
3. 同程旅行
4. 传音控股
5. 趣丸
6. 即刻
7. 波克城市
8. 喜马拉雅
9. 雷速体育

招聘公司信息以
`/Users/mazhenxing/Desktop/马振兴/找工作/招聘JD/招聘JD整理.md`
为基础；喜马拉雅和雷速体育结合本目录及相邻面试准备资料。

## 每轮讨论后的必做事项

每次与用户完成一轮实质性数据分析讨论后：

1. 将问题、核心结论、分析框架和 9 个场景的应用补充到
   `data-analysis-discussion.html`。
2. 更新页面中的讨论次数、最近更新时间和左侧目录。
3. 若页面内容发生变化，将 `pages.json` 对应条目的 `updated` 更新为当天日期。
4. 检查新增内容是否适合公开，避免写入手机号、邮箱、账号、内部数据或其他敏感信息。
5. 验证 HTML、JSON 和站内链接后提交到 `main` 并推送，触发
   `.github/workflows/pages.yml` 部署。
6. 检查 GitHub Actions 结果及线上页面可访问性。

## 每个问题的推荐结构

- 问题重述：把业务提问转成可验证的数据问题。
- 通用框架：目标、指标、维度、方法、结论、行动与验证。
- 场景引申：逐一覆盖上述 9 个公司或业务。
- 面试表达：沉淀为可以在面试中直接使用的回答。
- 追问清单：记录仍需确认的口径、数据和业务约束。

## 站点约定

- 导航首页为 `index.html`。
- 页面目录为 `pages.json`。
- 长期讨论主文档为 `data-analysis-discussion.html`。
- GitHub Pages 地址为
  `https://small-ma.github.io/leisu-sports-interview-guide/`。
- 保持纯静态 HTML/CSS/JavaScript，不增加不必要的构建依赖。
