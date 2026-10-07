# CloudyPage · 云中笺

一个在浏览器中使用的多栏速查表编辑器。可以粘贴 Markdown、直接编辑文字格式，调整纸张方向、栏数、字号、行距和边距，并通过浏览器打印或保存 PDF。内容保存在当前浏览器的本地存储中。

## 使用

下载本仓库后，打开 `dist/index.html`。`dist/editor.css` 和 `dist/editor.js` 需要与它保存在同一目录。也可以只下载 `dist/standalone.html`，它把页面、样式和脚本放在同一个文件中。首页点击“立即使用”即可进入排版器；在排版器左上角点击名称可返回首页。无需安装依赖，也无需联网。

- 在左侧编辑区粘贴 Markdown；替换整篇时先在编辑区按 `Ctrl+A`，再粘贴。
- 用“文字”工具栏设置标题、列表、颜色和高亮；用“布局”工具栏调整多栏排版。
- 点击“打印 / PDF”，在浏览器打印窗口选择保存为 PDF。打印颜色还可能受浏览器的“背景图形”设置影响。
- 文档会自动保存在本机当前浏览器中；换电脑或清除浏览器数据前，请用“下载 .md”备份内容。

## 许可与署名

本项目**源码公开，采用 [PolyForm Noncommercial License 1.0.0](LICENSE.md)**。允许该许可范围内的使用、修改和分发；商业用途，包括将软件或修改版收费提供给他人，需要另行取得版权所有者授权。请以许可原文为准。这个许可并非 OSI 认可的开源许可证。

复制或分发本项目及其修改版时，请一并提供许可条款或其网址，并保留 [`NOTICE`](NOTICE) 中以 `Required Notice:` 开头的署名行。修改版请明确标识修改者及修改内容，不要让使用者误认为它是原作者发布的版本。

项目名称与图标的使用说明见 [`BRANDING.md`](BRANDING.md)。如需商业授权，请通过 [Issues](https://github.com/Penny-Z/CloudyPage/issues) 联系维护者。

欢迎用 Issues 反馈问题或提出建议。外部代码贡献的版权授权方式尚未确定，暂不接收 Pull Request；这不影响你在许可范围内自行修改和分发自己的版本。

## 项目文件

- `dist/index.html`：页面结构
- `dist/editor.css`：界面和打印样式
- `dist/editor.js`：编辑、Markdown 转换、分栏预览和本地保存
- `dist/standalone.html`：可单独下载使用的离线版本；由 `python scripts/build_standalone.py` 生成
- `LICENSE.md`：PolyForm Noncommercial 1.0.0 正式条款
- `NOTICE`：需要随副本保留的署名
