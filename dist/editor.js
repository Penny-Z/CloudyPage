/* Required Notice: Copyright 2026 Penny-Z. */
/* Required Notice: Licensed under the PolyForm Noncommercial License 1.0.0: https://polyformproject.org/licenses/noncommercial/1.0.0 */
(() => {
  const $ = id => document.getElementById(id);
  const rich = $('richEditor'), source = $('markdownEditor'), pages = $('pages'), stage = $('previewStage');
  let currentScreen = null;
  function syncScreen() {
    const nextScreen = location.hash === '#editor' ? 'editor' : 'home';
    if (nextScreen === currentScreen) return;
    currentScreen = nextScreen;
    $('homeScreen').hidden = nextScreen === 'editor';
    $('appScreen').hidden = nextScreen !== 'editor';
    document.body.classList.toggle('editor-open', nextScreen === 'editor');
    document.title = nextScreen === 'editor' ? 'CloudyPage 云中笺 · 排版器' : 'CloudyPage 云中笺 · 把笔记整理成一页';
    window.scrollTo(0, 0);
    if (nextScreen === 'editor') requestAnimationFrame(render);
  }
  window.addEventListener('hashchange', syncScreen);
  function setupGuidedDemo() {
    const demo = $('guidedDemo');
    if (!demo) return;
    const windowEl = demo.querySelector('.demo-window');
    const paper = $('demoPaper');
    const richContent = $('demoRichContent');
    const sourceContent = $('demoSourceContent');
    const fontInput = $('demoFont');
    const demoState = { orientation:'landscape', columns:4, font:8, markdown:false, bold:false, heading:false, highlight:false, list:false };
    const help = {
      text:['01 / 文字','直接编辑文字','选中内容后，可以用工具栏设置标题、加粗、列表和颜色。这里先点按钮体验效果。'],
      layout:['02 / 布局','让纸张适应内容','横向适合较多栏目；纵向更适合阅读。栏数和字号可以随时调整。'],
      markdown:['01 / Markdown','在文字与源码之间切换','源码模式展示原始 Markdown；切回文字模式可以直接编辑排好的内容。'],
      bold:['01 / 加粗','把关键词提出来','加粗会同时出现在编辑内容和右侧纸张预览中，适合强调定义与结论。'],
      heading:['01 / 标题','建立清晰的层级','标题能把大段内容分成容易查找的小节。'],
      highlight:['01 / 高亮','给重点加一点颜色','高亮适合标出容易忘记的公式、概念或提醒。'],
      list:['01 / 列表','把步骤拆开','项目符号让零散信息变成可以逐项浏览的清单。'],
      landscape:['02 / 横向','横向放下更多栏目','A4 横向页面较宽，适合三到四栏的紧凑速查表。'],
      portrait:['02 / 纵向','换成竖版阅读','纵向页面更接近日常文档，可以按需要继续调整栏数。'],
      columns3:['02 / 三栏','栏目更宽','三栏给每一栏更多横向空间，适合较长的句子和表格。'],
      columns4:['02 / 四栏','一页容纳更多重点','四栏适合精简后的术语、步骤和公式。内容会依次流入下一栏。'],
      font:['02 / 字号','用字号控制密度','拖动滑块，纸张预览会同步改变字的大小。'],
      download:['03 / 下载','保留可继续编辑的笔记','完整排版器中的“下载 .md”会保存 Markdown 文件，方便备份和继续修改。'],
      print:['03 / 导出','把这一页带走','完整排版器中的“打印 / PDF”会打开浏览器打印窗口，可选择纸张打印或保存 PDF。']
    };
    function showHelp(action) {
      const [step,title,description] = help[action];
      $('demoGuideStep').textContent = step;
      $('demoGuideTitle').textContent = title;
      $('demoGuideText').textContent = description;
    }
    function renderDemo() {
      for (const name of ['bold','heading','highlight','list']) windowEl.classList.toggle(`demo-${name}`, demoState[name]);
      richContent.hidden = demoState.markdown;
      sourceContent.hidden = !demoState.markdown;
      paper.dataset.orientation = demoState.orientation;
      paper.dataset.columns = String(demoState.columns);
      paper.style.setProperty('--demo-columns', demoState.columns);
      paper.style.setProperty('--demo-font', `${demoState.font}px`);
      $('demoFontValue').textContent = demoState.font;
      $('demoPreviewLabel').textContent = `A4 ${demoState.orientation === 'portrait' ? '纵向' : '横向'} · ${demoState.columns} 栏 · ${demoState.font} pt`;
      demo.querySelectorAll('[data-demo-action]').forEach(button => {
        const action = button.dataset.demoAction;
        if (['bold','heading','highlight','list','markdown'].includes(action)) button.setAttribute('aria-pressed', String(demoState[action]));
        if (['portrait','landscape'].includes(action)) button.setAttribute('aria-pressed', String(demoState.orientation === action));
        if (['columns3','columns4'].includes(action)) button.setAttribute('aria-pressed', String(demoState.columns === Number(action.at(-1))));
      });
    }
    demo.addEventListener('click', event => {
      const tab = event.target.closest('[data-demo-tab]');
      if (tab) {
        const layout = tab.dataset.demoTab === 'layout';
        $('demoTextTools').hidden = layout;
        $('demoLayoutTools').hidden = !layout;
        demo.querySelectorAll('[data-demo-tab]').forEach(button => button.setAttribute('aria-selected', String(button === tab)));
        showHelp(layout ? 'layout' : 'text');
        return;
      }
      const button = event.target.closest('[data-demo-action]');
      if (!button) return;
      const action = button.dataset.demoAction;
      if (['bold','heading','highlight','list','markdown'].includes(action)) demoState[action] = !demoState[action];
      else if (['portrait','landscape'].includes(action)) demoState.orientation = action;
      else if (['columns3','columns4'].includes(action)) demoState.columns = Number(action.at(-1));
      showHelp(action);
      renderDemo();
    });
    fontInput.addEventListener('input', () => { demoState.font = Number(fontInput.value); showHelp('font'); renderDemo(); });
    renderDemo();
  }
  const key = 'zhijian-cheatsheet-v2';
  const oldKey = 'zhijian-cheatsheet-v1';
  const state = { orientation:'landscape', columns:'auto', font:7, margin:0, line:1.6, zoom:1, sourceMode:false };
  const exampleMarkdown = `# 数据分析与机器学习速查

## 基础
- **均值**：x̄ = Σxᵢ / n；对极端值敏感。
- **中位数**：排序后位于中间的数；适合偏态分布。
- **标准差**：刻画观测值围绕均值的离散程度。
- **标准化**：z = (x − μ) / σ；使变量尺度可比较。

## 数据清理与预处理
### 常见问题
| 问题 | 处理 | 注意 |
| --- | --- | --- |
| 缺失值 | 删除、插补 | 先判断缺失机制 |
| 异常值 | 核查、截尾 | 不要机械删除 |
| 类别变量 | 独热编码 | 留意高基数 |
| 数值变量 | 标准化 | 仅用训练集拟合 |

- 训练集、验证集、测试集要在预处理前划分。
- 对时间序列保留时间顺序，避免未来信息泄漏。
- 在交叉验证中，预处理应位于每个训练折内部。

## 探索性分析 EDA
- 分布：直方图、箱线图、分位数和缺失比例。
- 关系：散点图、分组比较、相关矩阵。
- 相关关系不等于因果关系；注意共同原因。
- 先检查单位、样本边界、异常和重复记录。

## 假设检验
1. 写出原假设 H₀ 与备择假设 H₁。
2. 根据数据结构选择统计量。
3. 计算 p 值，并与预设显著性水平比较。
4. 同时报告估计值、置信区间和样本量。

> p 值不是“原假设为真的概率”。

### 两类错误
- I 类错误：H₀ 为真却拒绝，概率为 α。
- II 类错误：H₀ 为假却未拒绝，概率为 β。
- 检验功效 = 1 − β。

## 监督学习
### 线性回归
- 模型：y = β₀ + β₁x + ε。
- 系数表示 x 变化一个单位时，y 条件均值的变化。
- 检查残差、异常值、多重共线性和外推风险。

### 分类模型
- Logistic 回归输出类别概率；需选择分类阈值。
- 决策树易解释，但深树容易过拟合。
- 随机森林降低方差；梯度提升逐步修正残差。

### 评价指标
| 任务 | 指标 | 提醒 |
| --- | --- | --- |
| 回归 | MAE、RMSE | RMSE 更重视大误差 |
| 分类 | Precision、Recall | 结合错误代价 |
| 概率 | Brier、校准曲线 | 检查概率可信度 |

## 无监督学习
- K-means：先指定 K；对距离和特征尺度敏感。
- PCA：寻找最大方差方向；先标准化量纲。
- 聚类结果需要结合业务含义与稳定性解释。

## 最后检查
- [ ] 变量口径和时间范围一致
- [ ] 无训练集与测试集泄漏
- [ ] 结果有合适的基线比较
- [ ] 报告不确定性与局限性`;
  let renderFrame = 0, saveTimer = 0, sourceDirty = false, showingExample = false, colorRange = null;

  const escapeHtml = text => String(text).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const safeColor = value => /^(?:#[0-9a-f]{3,8}|rgba?\([\d\s.,%]+\))$/i.test(String(value).trim()) ? String(value).trim() : '';
  function inline(text) {
    const colorTags=[]; let depth=0;
    const withColorTokens=String(text).replace(/<\/?span\b[^>]*>/gi, tag=>{
      if (/^<\/span/i.test(tag)) { if (!depth) return tag; depth--; colorTags.push('</span>'); return `\u0003${colorTags.length-1}\u0004`; }
      const style=tag.match(/\bstyle\s*=\s*["']([^"']+)["']/i)?.[1]||'';
      const color=safeColor(style.match(/(?:^|;)\s*color\s*:\s*([^;]+)/i)?.[1]||'');
      const background=safeColor(style.match(/(?:^|;)\s*background-color\s*:\s*([^;]+)/i)?.[1]||'');
      if (!color && !background) return tag;
      depth++; colorTags.push(`<span style="${color?`color:${color};`:''}${background?`background-color:${background};`:''}">`);
      return `\u0003${colorTags.length-1}\u0004`;
    });
    let value = escapeHtml(withColorTokens), codes = [];
    value = value.replace(/`([^`]+)`/g, (_, code) => { codes.push(`<code>${code}</code>`); return `\u0001${codes.length - 1}\u0002`; });
    value = value.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, (_, label, url) => `<a href="${url}" target="_blank" rel="noopener noreferrer">${label}</a>`);
    value = value.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/__(.+?)__/g, '<strong>$1</strong>');
    value = value.replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, '<em>$1</em>').replace(/(?<!_)_([^_\n]+)_(?!_)/g, '<em>$1</em>');
    value = value.replace(/~~(.+?)~~/g, '<del>$1</del>');
    return value.replace(/\u0001(\d+)\u0002/g, (_, index) => codes[Number(index)]).replace(/\u0003(\d+)\u0004/g, (_, index) => colorTags[Number(index)]);
  }
  const cells = line => line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map(s => s.trim());
  const tableRule = line => /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(line);
  function markdownToHtml(markdown) {
    const lines = String(markdown).replace(/\r\n?/g, '\n').split('\n');
    const result = [];
    for (let i = 0; i < lines.length;) {
      const line = lines[i];
      if (!line.trim()) { i++; continue; }
      if (/^\s*<!--\s*column-break\s*-->\s*$/.test(line)) { result.push('<div data-column-break contenteditable="false"></div>'); i++; continue; }
      if (/^\s*```/.test(line)) {
        const code = []; i++;
        while (i < lines.length && !/^\s*```/.test(lines[i])) code.push(lines[i++]);
        if (i < lines.length) i++;
        result.push(`<pre><code>${escapeHtml(code.join('\n'))}</code></pre>`); continue;
      }
      const heading = line.match(/^(#{1,6})\s+(.+)$/);
      if (heading) { const n = heading[1].length; result.push(`<h${n}>${inline(heading[2])}</h${n}>`); i++; continue; }
      if (/^\s*(---+|\*\*\*+)\s*$/.test(line)) { result.push('<hr>'); i++; continue; }
      if (i + 1 < lines.length && line.includes('|') && tableRule(lines[i + 1])) {
        const header = cells(line); i += 2; const rows = [];
        while (i < lines.length && lines[i].trim() && lines[i].includes('|')) rows.push(cells(lines[i++]));
        result.push(`<table><thead><tr>${header.map(value => `<th>${inline(value)}</th>`).join('')}</tr></thead><tbody>${rows.map(row => `<tr>${header.map((_, j) => `<td>${inline(row[j] || '')}</td>`).join('')}</tr>`).join('')}</tbody></table>`); continue;
      }
      if (/^\s*>/.test(line)) {
        const quote = [];
        while (i < lines.length && /^\s*>/.test(lines[i])) quote.push(lines[i++].replace(/^\s*>\s?/, ''));
        result.push(`<blockquote>${quote.map(inline).join('<br>')}</blockquote>`); continue;
      }
      if (/^\s*(?:[-+*]|\d+\.)\s+/.test(line)) {
        const ordered = /^\s*\d+\./.test(line), items = [];
        while (i < lines.length && /^\s*(?:[-+*]|\d+\.)\s+/.test(lines[i])) {
          const raw = lines[i++].replace(/^\s*(?:[-+*]|\d+\.)\s+/, '');
          const check = raw.match(/^\[([ xX])\]\s*(.*)$/);
          items.push(`<li>${check ? `<span class="checkbox">${check[1].toLowerCase() === 'x' ? '☑' : '☐'}</span>${inline(check[2])}` : inline(raw)}</li>`);
        }
        const tag = ordered ? 'ol' : 'ul'; result.push(`<${tag}>${items.join('')}</${tag}>`); continue;
      }
      const paragraph = [];
      while (i < lines.length && lines[i].trim() && !/^\s*<!--\s*column-break\s*-->\s*$/.test(lines[i]) && !/^(#{1,6})\s+/.test(lines[i]) && !/^\s*(?:[-+*]|\d+\.)\s+/.test(lines[i]) && !/^\s*>/.test(lines[i]) && !/^\s*```/.test(lines[i]) && !/^\s*(---+|\*\*\*+)\s*$/.test(lines[i]) && !(i + 1 < lines.length && lines[i].includes('|') && tableRule(lines[i + 1]))) paragraph.push(lines[i++]);
      if (paragraph.length) result.push(`<p>${paragraph.map(inline).join('<br>')}</p>`); else i++;
    }
    return result.join('');
  }

  function inlineToMarkdown(node) {
    if (node.nodeType === Node.TEXT_NODE) return node.textContent;
    if (node.nodeType !== Node.ELEMENT_NODE) return '';
    const tag = node.tagName.toLowerCase();
    const inner = [...node.childNodes].map(inlineToMarkdown).join('');
    if (tag === 'br') return '\n';
    if (tag === 'strong' || tag === 'b') return `**${inner}**`;
    if (tag === 'em' || tag === 'i') return `*${inner}*`;
    if (tag === 'del' || tag === 's') return `~~${inner}~~`;
    if (tag === 'code') return `\`${inner}\``;
    if (tag === 'a') return `[${inner}](${node.getAttribute('href') || ''})`;
    if (tag === 'span' || tag === 'font') {
      const color=safeColor(node.style.color || node.getAttribute('color') || '');
      const background=safeColor(node.style.backgroundColor || '');
      if (color || background) return `<span style="${color?`color:${color};`:''}${background?`background-color:${background};`:''}">${inner}</span>`;
    }
    return inner;
  }
  function htmlToMarkdown(root) {
    const output = [];
    for (const node of root.childNodes) {
      if (node.nodeType === Node.TEXT_NODE) { if (node.textContent.trim()) output.push(node.textContent.trim()); continue; }
      if (node.nodeType !== Node.ELEMENT_NODE) continue;
      const tag = node.tagName.toLowerCase();
      if (node.hasAttribute('data-column-break')) { output.push('<!-- column-break -->'); continue; }
      if (/^h[1-6]$/.test(tag)) output.push(`${'#'.repeat(Number(tag[1]))} ${inlineToMarkdown(node)}`);
      else if (tag === 'ul' || tag === 'ol') output.push([...node.children].filter(child => child.tagName === 'LI').map((child,index) => `${tag === 'ol' ? `${index+1}.` : '-'} ${inlineToMarkdown(child)}`).join('\n'));
      else if (tag === 'table') {
        const rows = [...node.querySelectorAll('tr')].map(row => [...row.children].map(cell => inlineToMarkdown(cell).replace(/\|/g,'\\|')));
        if (rows.length) output.push(`| ${rows[0].join(' | ')} |\n| ${rows[0].map(()=>'---').join(' | ')} |${rows.slice(1).map(row=>`\n| ${row.join(' | ')} |`).join('')}`);
      }
      else if (tag === 'blockquote') output.push(inlineToMarkdown(node).split('\n').map(line=>`> ${line}`).join('\n'));
      else if (tag === 'pre') output.push(`\`\`\`\n${node.textContent}\n\`\`\``);
      else if (tag === 'hr') output.push('---');
      else output.push(inlineToMarkdown(node));
    }
    return output.filter(Boolean).join('\n\n').trim();
  }

  function setTab(tab) {
    const layout = tab === 'layout';
    $('textTab').classList.toggle('active', !layout); $('layoutTab').classList.toggle('active', layout);
    $('textTab').setAttribute('aria-selected', String(!layout)); $('layoutTab').setAttribute('aria-selected', String(layout));
    $('textToolbar').hidden = layout; $('layoutPanel').hidden = !layout;
  }
  function selectionInEditor() {
    const selection = window.getSelection();
    return selection?.rangeCount && rich.contains(selection.getRangeAt(0).commonAncestorContainer) ? selection : null;
  }
  function selectionCoversEditor() {
    const selection = selectionInEditor();
    if (!selection || selection.isCollapsed) return false;
    const selected = selection.getRangeAt(0).cloneContents();
    const container = document.createElement('div'); container.appendChild(selected);
    return container.textContent.trim() === rich.textContent.trim();
  }
  function insertMarkdownAtCursor(html) {
    const selection = selectionInEditor();
    if (!selection) { rich.insertAdjacentHTML('beforeend', html); return; }
    const range = selection.getRangeAt(0);
    range.deleteContents();
    let top = range.startContainer.nodeType === Node.ELEMENT_NODE ? range.startContainer : range.startContainer.parentElement;
    while (top && top !== rich && top.parentElement !== rich) top = top.parentElement;
    const template = document.createElement('template'); template.innerHTML = html;
    const fragment = template.content, last = fragment.lastChild;
    if (!last) return;
    if (!top || top === rich) range.insertNode(fragment);
    else if (!top.textContent.trim()) top.replaceWith(fragment);
    else if (/^(P|DIV|H[1-6]|BLOCKQUOTE)$/.test(top.tagName) && range.startContainer !== rich) {
      const tailRange = document.createRange();
      tailRange.setStart(range.startContainer, range.startOffset);
      tailRange.setEnd(top, top.childNodes.length);
      const tail = tailRange.extractContents();
      const tailBlock = tail.textContent.trim() ? top.cloneNode(false) : null;
      if (tailBlock) tailBlock.appendChild(tail);
      top.after(fragment);
      if (tailBlock) last.after(tailBlock);
    } else top.after(fragment);
    const caret = document.createRange(); caret.setStartAfter(last); caret.collapse(true);
    selection.removeAllRanges(); selection.addRange(caret);
  }
  function rememberColorSelection() {
    const selection = selectionInEditor();
    if (selection) colorRange = selection.getRangeAt(0).cloneRange();
  }
  function applyColor(command, color) {
    rich.focus();
    if (colorRange) { const selection = window.getSelection(); selection.removeAllRanges(); selection.addRange(colorRange); }
    document.execCommand('styleWithCSS', false, true);
    document.execCommand(command, false, color);
    rememberColorSelection(); schedule();
  }
  function syncControls() {
    $('fontSlider').value = state.font; $('marginSlider').value = state.margin; $('lineSlider').value = state.line;
    $('fontValue').textContent = `${Number(state.font).toFixed(1)} pt`;
    $('marginValue').textContent = `${state.margin} mm`;
    $('lineValue').textContent = Number(state.line).toFixed(2);
    document.querySelectorAll('[data-orientation]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.orientation === state.orientation)));
    document.querySelectorAll('[data-columns]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.columns === state.columns)));
  }
  function save() {
    try { localStorage.setItem(key, JSON.stringify({ html:rich.innerHTML, orientation:state.orientation, columns:state.columns, font:state.font, margin:state.margin, line:state.line })); $('saveStatus').textContent = '● 已自动保存'; }
    catch { $('saveStatus').textContent = '● 无法保存到浏览器'; }
  }
  function schedule() {
    $('saveStatus').textContent = '● 正在保存…';
    if (renderFrame) cancelAnimationFrame(renderFrame);
    renderFrame = requestAnimationFrame(render);
    clearTimeout(saveTimer); saveTimer = setTimeout(save, 450);
  }
  function makeFlow(html, columns, contentW, contentH, gap) {
    const flow = document.createElement('div'); flow.className = 'sheet-flow';
    flow.style.width = `${contentW}px`; flow.style.height = `${contentH}px`;
    flow.style.columnCount = String(columns); flow.style.columnGap = `${gap}px`;
    flow.style.fontSize = `${state.font * 96 / 72}px`; flow.style.lineHeight = String(state.line);
    flow.innerHTML = html;
    return flow;
  }
  function page(number, pageCount, html, columns, width, height, scale, gap, marginPx, contentW, contentH) {
    const shell = document.createElement('div'); shell.className = 'page-shell';
    shell.style.width = `${width * scale}px`; shell.style.height = `${height * scale}px`;
    shell.style.setProperty('--paper-w', `${state.orientation === 'landscape' ? 297 : 210}mm`);
    shell.style.setProperty('--paper-h', `${state.orientation === 'landscape' ? 210 : 297}mm`);
    const sheet = document.createElement('article'); sheet.className = 'page';
    sheet.style.width = `${width}px`; sheet.style.height = `${height}px`; sheet.style.transform = `scale(${scale})`;
    sheet.style.setProperty('--paper-w', `${state.orientation === 'landscape' ? 297 : 210}mm`);
    sheet.style.setProperty('--paper-h', `${state.orientation === 'landscape' ? 210 : 297}mm`);
    sheet.style.setProperty('--page-margin', `${marginPx}px`);
    const inner = document.createElement('div'); inner.className = 'page-inner';
    const clip = document.createElement('div'); clip.className = 'sheet-clip';
    clip.style.width = `${contentW}px`; clip.style.height = `${contentH}px`;
    const flow = makeFlow(html, columns, contentW, contentH, gap);
    flow.style.transform = `translateX(-${(number - 1) * (contentW + gap)}px)`;
    clip.appendChild(flow);
    const foot = document.createElement('div'); foot.className = 'sheet-footer'; foot.textContent = `${number} / ${pageCount}`;
    inner.append(clip,foot); sheet.appendChild(inner); shell.appendChild(sheet); pages.appendChild(shell);
  }
  function render() {
    renderFrame = 0;
    const landscape = state.orientation === 'landscape';
    const width = landscape ? 1123 : 794, height = landscape ? 794 : 1123;
    const marginPx = state.margin * 96 / 25.4;
    const gap = Math.max(9, state.font * 1.55);
    const usable = width - marginPx * 2;
    const minColumn = Math.max(165, state.font * 96 / 72 * 26);
    const natural = Math.floor((usable + gap) / (minColumn + gap));
    const columns = state.columns === 'auto' ? (landscape ? Math.max(3,Math.min(4,natural)) : Math.max(2,Math.min(3,natural))) : Number(state.columns);
    const fit = Math.min(1, Math.max(0.25, (stage.clientWidth - 34) / width));
    const scale = Math.max(.3, Math.min(1.8, fit * state.zoom));
    $('zoomValue').textContent = `${Math.round(scale*100)}%`;
    let printStyle = $('printPageStyle');
    if (!printStyle) { printStyle = document.createElement('style'); printStyle.id = 'printPageStyle'; document.head.appendChild(printStyle); }
    printStyle.textContent = `@page{size:A4 ${state.orientation};margin:0}`;
    pages.replaceChildren();
    const contentW = width - 2 * marginPx;
    const contentH = height - 2 * marginPx - 13;
    const html = rich.innerHTML;
    const measure = makeFlow(html, columns, contentW, contentH, gap);
    measure.classList.add('sheet-measure'); document.body.appendChild(measure);
    const fullWidth = Math.max(contentW, measure.scrollWidth);
    measure.remove();
    const stride = contentW + gap;
    const pageCount = Math.max(1, Math.ceil((fullWidth + gap - 1) / stride));
    for (let number = 1; number <= pageCount; number++) page(number,pageCount,html,columns,width,height,scale,gap,marginPx,contentW,contentH);
    $('layoutSummary').textContent = `A4 ${landscape?'横向':'纵向'} · ${columns} 栏 · 顺序填栏 · ${pageCount} 页`;
    $('charCount').textContent = `${rich.textContent.replace(/\s/g,'').length} 字`;
  }

  $('textTab').addEventListener('click',()=>setTab('text'));
  $('layoutTab').addEventListener('click',()=>setTab('layout'));
  $('sourceBtn').addEventListener('click',()=>{
    state.sourceMode=!state.sourceMode;
    if (state.sourceMode) { source.value=htmlToMarkdown(rich); sourceDirty=false; }
    else if (sourceDirty) rich.innerHTML=markdownToHtml(source.value);
    rich.hidden=state.sourceMode; source.hidden=!state.sourceMode;
    $('sourceBtn').setAttribute('aria-pressed',String(state.sourceMode));
    document.querySelectorAll('[data-command],[data-block],#linkBtn,#codeBtn,#tableBtn,#columnBreakBtn,[data-palette-trigger],.swatches button').forEach(button=>button.disabled=state.sourceMode);
    (state.sourceMode?source:rich).focus(); schedule();
  });
  document.querySelectorAll('.toolbar button[data-command],.toolbar button[data-block],#linkBtn,#codeBtn,#tableBtn,#columnBreakBtn,[data-palette-trigger],.swatches button').forEach(button=>button.addEventListener('mousedown',event=>{ if (button.dataset.paletteTrigger) rememberColorSelection(); event.preventDefault(); }));
  const paletteColors = {
    foreColor:[['黑色','#20272b'],['深灰','#667085'],['红色','#c62828'],['橙色','#e46b12'],['黄色','#b68400'],['绿色','#23814a'],['蓝色','#2563c9'],['紫色','#7b43b5'],['青色','#087f8c'],['粉色','#c83c81'],['棕色','#8a5a30'],['白色','#ffffff']],
    hiliteColor:[['无高亮','#ffffff'],['淡黄','#fff2ad'],['淡绿','#d9f3d9'],['淡蓝','#dcecff'],['淡粉','#ffe0ec'],['淡橙','#ffe6c9'],['淡紫','#ecdefa'],['亮黄','#ffe45c'],['薄荷','#b7eacb'],['青绿','#b9e7e9'],['浅灰','#e7eaed'],['珊瑚','#ffd2ca']]
  };
  Object.entries(paletteColors).forEach(([command, colors])=>{
    const parent=document.querySelector(`.swatches[data-palette="${command}"]`);
    colors.forEach(([name,color])=>{ const button=document.createElement('button'); button.type='button'; button.title=name; button.setAttribute('aria-label',name); button.style.setProperty('--swatch',color); button.addEventListener('mousedown',event=>event.preventDefault()); button.addEventListener('click',()=>{ applyColor(command,color); parent.closest('.color-palette').hidden=true; }); parent.appendChild(button); });
  });
  document.querySelectorAll('[data-palette-trigger]').forEach(button=>button.addEventListener('click',()=>{
    const palette=button.nextElementSibling, opening=palette.hidden;
    document.querySelectorAll('.color-palette').forEach(item=>item.hidden=true);
    document.querySelectorAll('[data-palette-trigger]').forEach(item=>item.setAttribute('aria-expanded','false'));
    palette.hidden=!opening; button.setAttribute('aria-expanded',String(opening));
  }));
  [['textColorCustom','foreColor'],['highlightCustom','hiliteColor']].forEach(([id,command])=>$(id).addEventListener('input',event=>applyColor(command,event.target.value)));
  document.addEventListener('click',event=>{ if (!event.target.closest('.palette-wrap')) { document.querySelectorAll('.color-palette').forEach(item=>item.hidden=true); document.querySelectorAll('[data-palette-trigger]').forEach(item=>item.setAttribute('aria-expanded','false')); } });
  document.querySelectorAll('[data-command]').forEach(button=>button.addEventListener('click',()=>{ rich.focus(); document.execCommand(button.dataset.command,false,button.dataset.value || null); schedule(); }));
  document.querySelectorAll('[data-block]').forEach(button=>button.addEventListener('click',()=>{ rich.focus(); document.execCommand('formatBlock',false,button.dataset.block); schedule(); }));
  $('linkBtn').addEventListener('click',()=>{ const url=prompt('链接地址（https://…）'); if (url && /^https?:\/\//i.test(url)) { rich.focus(); document.execCommand('createLink',false,url); schedule(); } });
  $('codeBtn').addEventListener('click',()=>{ const selected=window.getSelection()?.toString()||'代码'; rich.focus(); document.execCommand('insertHTML',false,`<code>${escapeHtml(selected)}</code>`); schedule(); });
  $('tableBtn').addEventListener('click',()=>{ rich.focus(); document.execCommand('insertHTML',false,'<table><thead><tr><th>概念</th><th>说明</th></tr></thead><tbody><tr><td>示例</td><td>内容</td></tr></tbody></table><p><br></p>'); schedule(); });
  $('columnBreakBtn').addEventListener('click',()=>{ rich.focus(); document.execCommand('insertHTML',false,'<div data-column-break contenteditable="false"></div><p><br></p>'); schedule(); });
  rich.addEventListener('paste',event=>{
    event.preventDefault();
    const text=event.clipboardData.getData('text/plain');
    if (!text) return;
    const markdown=/(^|\n)\s*(#{1,6}\s|[-*+]\s|\d+\.\s|>\s|\|.*\||```)|\*\*|\[[^\]]+\]\(/m.test(text);
    const fullDocument=selectionCoversEditor() || showingExample;
    if (markdown || text.includes('\n')) {
      const html=markdownToHtml(text);
      if (fullDocument) { rich.innerHTML=html; const caret=document.createRange(); caret.selectNodeContents(rich); caret.collapse(false); const selection=window.getSelection(); selection.removeAllRanges(); selection.addRange(caret); }
      else insertMarkdownAtCursor(html);
    } else if (fullDocument) rich.innerHTML=`<p>${escapeHtml(text)}</p>`;
    else document.execCommand('insertText',false,text);
    showingExample=false;
    schedule();
  });
  rich.addEventListener('input',()=>{ showingExample=false; schedule(); });
  source.addEventListener('input',()=>{ sourceDirty=true; rich.innerHTML=markdownToHtml(source.value); schedule(); });
  document.querySelectorAll('[data-orientation]').forEach(button=>button.addEventListener('click',()=>{ state.orientation=button.dataset.orientation; syncControls(); schedule(); }));
  document.querySelectorAll('[data-columns]').forEach(button=>button.addEventListener('click',()=>{ state.columns=button.dataset.columns; syncControls(); schedule(); }));
  [['fontSlider','font'],['marginSlider','margin'],['lineSlider','line']].forEach(([id,field])=>$(id).addEventListener('input',()=>{ state[field]=Number($(id).value); syncControls(); schedule(); }));
  $('zoomOut').addEventListener('click',()=>{ state.zoom=Math.max(.5,state.zoom-.1); render(); });
  $('zoomIn').addEventListener('click',()=>{ state.zoom=Math.min(1.8,state.zoom+.1); render(); });
  $('exampleBtn').addEventListener('click',()=>{ if (rich.textContent.trim() && !confirm('用示例替换当前内容？')) return; rich.innerHTML=markdownToHtml(exampleMarkdown); showingExample=true; if (state.sourceMode) source.value=exampleMarkdown; schedule(); });
  $('downloadMdBtn').addEventListener('click',()=>{ const blob=new Blob([state.sourceMode?source.value:htmlToMarkdown(rich)],{type:'text/markdown;charset=utf-8'}); const link=document.createElement('a'); link.href=URL.createObjectURL(blob); link.download='cheatsheet.md'; link.click(); setTimeout(()=>URL.revokeObjectURL(link.href),1000); });
  $('printBtn').addEventListener('click',()=>{ render(); window.print(); });
  window.addEventListener('resize',()=>{ if(renderFrame) cancelAnimationFrame(renderFrame); renderFrame=requestAnimationFrame(render); });
  try {
    const stored=JSON.parse(localStorage.getItem(key)||'null');
    const previous=stored?null:JSON.parse(localStorage.getItem(oldKey)||'null');
    if (stored?.html) rich.innerHTML=stored.html;
    else if (previous?.markdown) rich.innerHTML=markdownToHtml(`${previous.title?`# ${previous.title}\n\n`:''}${previous.markdown}`);
    else { rich.innerHTML=markdownToHtml(exampleMarkdown); showingExample=true; }
    state.orientation=stored?.orientation==='portrait'?'portrait':'landscape';
    state.columns=stored?.columns||'auto'; state.font=stored?.font??7; state.margin=stored?.margin??0; state.line=stored?.line??1.6;
  } catch { rich.innerHTML=markdownToHtml(exampleMarkdown); showingExample=true; }
  setupGuidedDemo(); syncControls(); syncScreen();
  if (document.fonts?.ready) document.fonts.ready.then(render);
})();
