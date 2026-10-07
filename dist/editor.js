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
      markdown:['01 / 源码编辑','查看并修改源码','源码编辑可以直接调整 Markdown 标记；切回文字编辑后，继续用工具栏整理格式。'],
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
    function selectDemoTab(name) {
      const layout = name === 'layout';
      $('demoTextTools').hidden = layout;
      $('demoLayoutTools').hidden = !layout;
      $('demoTag').textContent = layout ? '布局模块演示' : '文字模块演示';
      demo.querySelectorAll('[data-demo-tab]').forEach(button => button.setAttribute('aria-selected', String(button.dataset.demoTab === name)));
      document.querySelectorAll('[data-module-card]').forEach(card => card.classList.toggle('is-active', card.dataset.moduleCard === name));
      showHelp(name);
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
        if (action === 'markdown') button.textContent = demoState.markdown ? '返回文字编辑' : '源码编辑';
        if (['bold','heading','highlight','list','markdown'].includes(action)) button.setAttribute('aria-pressed', String(demoState[action]));
        if (['portrait','landscape'].includes(action)) button.setAttribute('aria-pressed', String(demoState.orientation === action));
        if (['columns3','columns4'].includes(action)) button.setAttribute('aria-pressed', String(demoState.columns === Number(action.at(-1))));
      });
    }
    demo.addEventListener('click', event => {
      const tab = event.target.closest('[data-demo-tab]');
      if (tab) {
        selectDemoTab(tab.dataset.demoTab);
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
    function syncDemoPreviewText() {
      $('demoPaperTitle').textContent = richContent.querySelector('h1,h2,h3')?.textContent || '';
      $('demoPaperIntro').textContent = richContent.querySelector('p')?.textContent || '';
      $('demoPaperAccent').textContent = richContent.querySelectorAll('p')[1]?.textContent || '';
    }
    richContent.addEventListener('input', () => {
      sourceContent.textContent = htmlToMarkdown(richContent);
      syncDemoPreviewText(); showHelp('text');
    });
    sourceContent.addEventListener('input', () => {
      const parsed = document.createElement('div');
      parsed.innerHTML = markdownToHtml(sourceContent.innerText);
      parsed.querySelector('h1,h2,h3')?.setAttribute('id','demoEditorHeading');
      parsed.querySelectorAll('p')[1]?.setAttribute('id','demoEditorAccent');
      parsed.querySelector('ul,ol')?.setAttribute('id','demoEditorList');
      richContent.innerHTML = parsed.innerHTML;
      syncDemoPreviewText(); showHelp('markdown');
    });
    document.querySelectorAll('[data-demo-open]').forEach(button => button.addEventListener('click', () => {
      selectDemoTab(button.dataset.demoOpen);
      demo.scrollIntoView({ behavior:'smooth', block:'start' });
    }));
    fontInput.addEventListener('input', () => { demoState.font = Number(fontInput.value); showHelp('font'); renderDemo(); });
    renderDemo();
    selectDemoTab('text');
  }
  const key = 'zhijian-cheatsheet-v2';
  const oldKey = 'zhijian-cheatsheet-v1';
  const draftsKey = 'cloudypage-drafts-v1';
  const exampleVersion = 3;
  const state = { orientation:'landscape', columns:'auto', font:7, margin:0, line:1.6, zoom:1, sourceMode:false };
  const exampleMarkdown = `# 数据分析与机器学习速查

## 基础
- **均值**：x̄ = Σxᵢ / n；对极端值敏感。
- **中位数**：排序后位于中间的数；适合偏态分布。
- **标准差**：刻画观测值围绕均值的离散程度。
- **标准化**：z = (x − μ) / σ；使变量尺度可比较。
- **四分位距**：IQR = Q₃ − Q₁；适合描述偏态数据的离散程度。
- **样本量**：比较分组结果前，先核对每组有效观测数。

### 先明确问题
- 预测问题关注新样本上的表现；解释问题关注变量与结果的关系。
- 写清目标变量、观察单位、时间窗口与适用人群。
- 选择指标时考虑实际代价：漏判与误判未必同样严重。

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
- 去重时先定义重复记录的判定键；同一对象多次观测不一定是重复。
- 缺失可能与结果有关，插补后也要保留缺失比例和处理方式。
- 类别合并、文本清洗、日期转换都应记录规则，便于复现。

### 数据划分
- 随机划分适合相互独立的样本；同一人的记录应放在同一侧。
- 时间预测应使用较早的数据训练、较晚的数据验证。
- 测试集用于最终评估，不应用来反复调整模型和阈值。

### 缺失与异常的判断顺序
1. 先确认数值是否超出业务上可能的范围。
2. 回看原始记录，区分录入错误和真实的极端观察。
3. 比较处理前后的分布和关键结论。
4. 保留处理规则，不只保存清理后的数据。

- 完全随机缺失、条件随机缺失和非随机缺失，所需假设不同。
- 用均值填补会压缩方差；重要变量应尝试敏感性分析。
- 删除异常值前，说明阈值来源并统计被删除的数量。
- 单位混用可能伪装成异常值，例如元与万元、秒与毫秒。

### 特征构造
- 比率变量要核对分母是否接近零，以及分母的实际含义。
- 滚动均值、滞后项只能使用预测时已经可见的信息。
- 高基数类别可以合并稀有类，但合并规则应在训练集确定。
- 文本和日期特征应从原始字段稳定生成，避免手工改写。

## 探索性分析 EDA
- 分布：直方图、箱线图、分位数和缺失比例。
- 关系：散点图、分组比较、相关矩阵。
- 相关关系不等于因果关系；注意共同原因。
- 先检查单位、样本边界、异常和重复记录。
- 画图前先看原始点和样本量，均值可能掩盖分布差异。
- 分组比较时注意基数差异，以及可能改变整体结论的分层结构。
- 对高度偏斜的变量，可以同时报告中位数与分位数。

### 常用图形
| 想看什么 | 图形 | 先检查 |
| --- | --- | --- |
| 单变量分布 | 直方图、箱线图 | 单位与离群值 |
| 两变量关系 | 散点图 | 非线性与分组 |
| 时间变化 | 折线图 | 缺测与时间间隔 |
| 分类占比 | 条形图 | 分母是否一致 |

### 描述统计小卡片
- 计数：总记录数、独立对象数、有效样本数分别列出。
- 中心：均值和中位数一起看，差距较大时留意偏态。
- 离散：标准差、四分位距和极差回答不同问题。
- 比例：说明分子、分母、观察期和是否允许重复计数。
- 相关：Pearson 更关注线性关系；Spearman 更关注排序关系。

### 作图提醒
- 不同组共用同一纵轴刻度，便于直接比较。
- 时间序列若缺少观测，别把断点连成连续变化。
- 小样本优先显示原始点，避免柱形高度隐藏个体差异。
- 颜色用于分组时，图例和文字标签应能独立说明含义。

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
- 多次检验会提高误报机会；探索结果应标明并谨慎解释。
- 统计显著不代表实际影响很大，要结合效应大小与成本判断。

### 置信区间
- 区间越宽，通常表示估计越不精确。
- 比较两组时，优先看“组间差值”的区间，而非两个区间是否重叠。
- 描述结论时保留方向、量级和不确定性，不只写显著或不显著。

### 选用检验之前
- 同一对象的前后测量属于配对数据，不宜当成独立样本。
- 数据偏态、样本过小或离群值明显时，检查方法的适用条件。
- 提前确定主要指标和比较组，减少事后挑选结论。
- 若关心实际差异，先设定值得关注的最小效应大小。

### 常见误解
- “未达到显著”不等于“证明没有差异”。
- 置信区间不是单个已算出区间含有参数的概率陈述。
- 大样本能让很小的差异显著，却未必具有实际价值。
- 只比较两个回归中各自的 p 值，不能证明两组效应不同。

## 监督学习
### 线性回归
- 模型：y = β₀ + β₁x + ε。
- 系数表示 x 变化一个单位时，y 条件均值的变化。
- 检查残差、异常值、多重共线性和外推风险。
- 加入交互项时，说明一个变量的作用如何随另一个变量改变。
- 正则化可约束系数，强度应在训练数据内部选择。

### 分类模型
- Logistic 回归输出类别概率；需选择分类阈值。
- 决策树易解释，但深树容易过拟合。
- 随机森林降低方差；梯度提升逐步修正残差。
- 类别不平衡时，准确率可能很高但少数类几乎没有识别出来。
- 分类阈值决定 Precision 与 Recall 的取舍，应结合使用场景设定。

### 回归诊断
- 残差图可提示非线性、方差变化和系统性遗漏。
- 单个高影响点可能明显改变系数，核查后再决定处理方式。
- 相关特征会使单个系数不稳定，但不必然损害整体预测。
- 对预测区间外的输入保持警惕，那属于外推。

### 分类诊断
- 混淆矩阵把真阳性、假阳性、真阴性、假阴性分开。
- Recall = 真阳性 / 实际阳性；关注漏掉了多少正例。
- Precision = 真阳性 / 预测阳性；关注预测为正的可信度。
- F1 综合 Precision 与 Recall，但不包含真阴性的代价。
- ROC AUC 衡量排序能力；极不平衡时也要看 PR 曲线。

### 评价指标
| 任务 | 指标 | 提醒 |
| --- | --- | --- |
| 回归 | MAE、RMSE | RMSE 更重视大误差 |
| 分类 | Precision、Recall | 结合错误代价 |
| 概率 | Brier、校准曲线 | 检查概率可信度 |

### 验证与调参
1. 先建立简单基线，例如均值预测或多数类预测。
2. 固定数据划分、评价指标与随机种子。
3. 在训练集内部交叉验证，比较候选模型和参数。
4. 锁定方案后，只在测试集评估一次。

- 训练分数好、验证分数差：检查过拟合、泄漏或分布变化。
- 两边分数都差：检查特征、模型容量以及任务本身是否可预测。
- 报告多次划分或交叉验证结果时，保留波动范围。

### 过拟合与欠拟合
| 现象 | 可能原因 | 先试什么 |
| --- | --- | --- |
| 训练好、验证差 | 模型过于复杂 | 降低复杂度、增加数据 |
| 两边都差 | 特征不足或关系复杂 | 检查特征和基线 |
| 不同折差异大 | 样本少或分组不均 | 检查划分与置信范围 |

- 学习曲线比较训练量与误差，有助于判断增加数据是否可能有用。
- 超参数搜索范围越大，越需要独立验证防止碰巧选中好结果。
- 若目标指标有多个，先明确主指标，再观察其他指标的代价。

## 无监督学习
- K-means：先指定 K；对距离和特征尺度敏感。
- PCA：寻找最大方差方向；先标准化量纲。
- 聚类结果需要结合业务含义与稳定性解释。
- 聚类标签只是算法分组，不能直接当作真实类别。
- PCA 的方差解释率说明信息保留程度，不保证预测效果。

### 聚类结果怎么检查
- 换一个随机种子或样本子集，观察分组是否稳定。
- 对每一组描述规模、关键变量和典型样本。
- 距离度量会改变“相近”的含义，应根据变量性质选择。
- 噪声点可能很重要，不要仅为了整齐而强行归入某类。

### 降维结果怎么读
- 二维图是高维数据的投影，相邻关系可能发生改变。
- 主成分的正负号本身可翻转，应看相对载荷和解释。
- 降维前后的尺度、缺失处理和样本范围要保持一致。

## 结果解释与使用
### 解释边界
- 模型重要性反映当前数据和模型中的关联，不自动说明因果作用。
- 训练样本之外的人群、时间或环境，可能出现性能下降。
- 如果数据收集方式改变，应重新检查缺失、分布和指标。

### 展示结果
- 在标题中写结论，在正文中补充样本、口径和计算方法。
- 同时展示基线与改进幅度，避免只报一个孤立分数。
- 对失败案例做分类：数据错误、边界样本、概念混淆或环境变化。
- 记录数据版本、处理步骤与模型参数，使结果可以复查。

### 上线后的观察
- 监测输入字段缺失率、取值范围和主要人群占比。
- 按时间和关键群体分别看指标，整体均值可能掩盖退化。
- 记录人工复核与纠错结果，作为更新模型的依据。
- 设定性能下降时的处理办法，而不只是重新训练。

### 一段清楚的结论
1. 先说明研究对象、样本期间和任务目标。
2. 给出主要发现及其量级，并与基线比较。
3. 交代不确定性、数据限制和可能的替代解释。
4. 最后说结论适用于哪里，以及下一步需要验证什么。

## 最后检查
- [ ] 变量口径和时间范围一致
- [ ] 无训练集与测试集泄漏
- [ ] 结果有合适的基线比较
- [ ] 评价指标对应实际使用场景
- [ ] 报告不确定性与局限性
- [ ] 图表标明单位、分母与样本量
- [ ] 记录数据、代码与模型版本`;
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
  const exampleHtml = markdownToHtml(exampleMarkdown);

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
    try { localStorage.setItem(key, JSON.stringify({ html:rich.innerHTML, orientation:state.orientation, columns:state.columns, font:state.font, margin:state.margin, line:state.line, exampleVersion:rich.innerHTML===exampleHtml?exampleVersion:null })); $('saveStatus').textContent = '● 已自动保存'; return true; }
    catch { $('saveStatus').textContent = '● 无法保存到浏览器'; return false; }
  }
  function readDrafts() {
    try { const drafts=JSON.parse(localStorage.getItem(draftsKey)||'[]'); return Array.isArray(drafts)?drafts:[]; }
    catch { return []; }
  }
  function updateDraftsButton() { $('openDraftsBtn').textContent=`草稿箱 (${readDrafts().length})`; }
  function renderDrafts() {
    const list=$('draftList'), drafts=readDrafts(); list.replaceChildren();
    $('draftsEmpty').hidden=drafts.length>0;
    drafts.sort((a,b)=>new Date(b.updatedAt)-new Date(a.updatedAt)).forEach(draft=>{
      const row=document.createElement('article'); row.className='saved-draft';
      const info=document.createElement('div'); info.className='saved-draft-info';
      const title=document.createElement('div'); title.className='saved-draft-title'; title.textContent=draft.title||'未命名草稿';
      const date=document.createElement('div'); date.className='saved-draft-date'; date.textContent=new Date(draft.updatedAt).toLocaleString();
      info.append(title,date);
      const actions=document.createElement('div'); actions.className='saved-draft-actions';
      const open=document.createElement('button'); open.type='button'; open.textContent='打开'; open.dataset.openDraft=draft.id;
      const remove=document.createElement('button'); remove.type='button'; remove.textContent='删除'; remove.dataset.deleteDraft=draft.id;
      actions.append(open,remove); row.append(info,actions); list.append(row);
    });
    updateDraftsButton();
  }
  function saveNamedDraft() {
    const suggested=rich.querySelector('h1,h2,h3')?.textContent.trim()||'未命名草稿';
    const title=prompt('给这份草稿起个名字：',suggested);
    if (title===null) return;
    const drafts=readDrafts();
    drafts.unshift({ id:`${Date.now()}-${Math.random().toString(36).slice(2,8)}`, title:title.trim()||'未命名草稿', html:rich.innerHTML, orientation:state.orientation, columns:state.columns, font:state.font, margin:state.margin, line:state.line, updatedAt:new Date().toISOString() });
    try {
      localStorage.setItem(draftsKey,JSON.stringify(drafts)); save(); renderDrafts();
      $('saveStatus').textContent='● 草稿已另存'; $('draftsDialog').showModal();
    } catch { $('saveStatus').textContent='● 草稿保存失败，请减少草稿数量'; }
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
    flow.style.columnCount = String(columns); flow.style.columnGap = `${gap}px`; flow.style.columnFill = 'auto';
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
    $('sourceBtn').textContent=state.sourceMode?'返回文字编辑':'源码编辑';
    $('sourceBtn').title=state.sourceMode?'返回格式化文字编辑':'编辑 Markdown 源码';
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
  source.addEventListener('input',()=>{ sourceDirty=true; showingExample=false; rich.innerHTML=markdownToHtml(source.value); schedule(); });
  document.querySelectorAll('[data-orientation]').forEach(button=>button.addEventListener('click',()=>{ state.orientation=button.dataset.orientation; syncControls(); schedule(); }));
  document.querySelectorAll('[data-columns]').forEach(button=>button.addEventListener('click',()=>{ state.columns=button.dataset.columns; syncControls(); schedule(); }));
  [['fontSlider','font'],['marginSlider','margin'],['lineSlider','line']].forEach(([id,field])=>$(id).addEventListener('input',()=>{ state[field]=Number($(id).value); syncControls(); schedule(); }));
  $('zoomOut').addEventListener('click',()=>{ state.zoom=Math.max(.5,state.zoom-.1); render(); });
  $('zoomIn').addEventListener('click',()=>{ state.zoom=Math.min(1.8,state.zoom+.1); render(); });
  $('saveDraftBtn').addEventListener('click',saveNamedDraft);
  $('openDraftsBtn').addEventListener('click',()=>{ renderDrafts(); $('draftsDialog').showModal(); });
  $('closeDraftsBtn').addEventListener('click',()=>$('draftsDialog').close());
  $('draftList').addEventListener('click',event=>{
    const open=event.target.closest('[data-open-draft]'), remove=event.target.closest('[data-delete-draft]');
    const drafts=readDrafts();
    if (open) {
      const draft=drafts.find(item=>item.id===open.dataset.openDraft);
      if (!draft || !confirm(`打开“${draft.title}”会替换当前编辑区。继续吗？`)) return;
      save(); rich.innerHTML=draft.html; state.orientation=draft.orientation||'landscape'; state.columns=draft.columns||'auto';
      state.font=draft.font??7; state.margin=draft.margin??0; state.line=draft.line??1.6;
      showingExample=rich.innerHTML===exampleHtml; sourceDirty=false;
      if (state.sourceMode) source.value=htmlToMarkdown(rich);
      syncControls(); schedule(); $('draftsDialog').close();
    } else if (remove) {
      const draft=drafts.find(item=>item.id===remove.dataset.deleteDraft);
      if (!draft || !confirm(`删除草稿“${draft.title}”？`)) return;
      try { localStorage.setItem(draftsKey,JSON.stringify(drafts.filter(item=>item.id!==draft.id))); renderDrafts(); }
      catch { $('saveStatus').textContent='● 草稿删除失败'; }
    }
  });
  $('downloadMdBtn').addEventListener('click',()=>{ const blob=new Blob([state.sourceMode?source.value:htmlToMarkdown(rich)],{type:'text/markdown;charset=utf-8'}); const link=document.createElement('a'); link.href=URL.createObjectURL(blob); link.download='cheatsheet.md'; link.click(); setTimeout(()=>URL.revokeObjectURL(link.href),1000); });
  $('printBtn').addEventListener('click',()=>{ render(); window.print(); });
  window.addEventListener('resize',()=>{ if(renderFrame) cancelAnimationFrame(renderFrame); renderFrame=requestAnimationFrame(render); });
  try {
    const stored=JSON.parse(localStorage.getItem(key)||'null');
    const previous=stored?null:JSON.parse(localStorage.getItem(oldKey)||'null');
    const legacyExample=stored?.html && !stored.exampleVersion && /^<h1>数据分析与机器学习速查<\/h1>/.test(stored.html) && /假设检验/.test(stored.html) && /K-means/.test(stored.html) && /最后检查/.test(stored.html) && !/缺失与异常的判断顺序/.test(stored.html);
    if (legacyExample) {
      rich.innerHTML=exampleHtml; showingExample=true;
    }
    else if (stored?.html) { rich.innerHTML=stored.html; showingExample=stored.exampleVersion===exampleVersion; }
    else if (previous?.markdown) rich.innerHTML=markdownToHtml(`${previous.title?`# ${previous.title}\n\n`:''}${previous.markdown}`);
    else { rich.innerHTML=exampleHtml; showingExample=true; }
    state.orientation=stored?.orientation==='portrait'?'portrait':'landscape';
    state.columns=stored?.columns||'auto'; state.font=stored?.font??7; state.margin=stored?.margin??0; state.line=stored?.line??1.6;
    if (legacyExample) save();
  } catch { rich.innerHTML=exampleHtml; showingExample=true; }
  renderDrafts(); setupGuidedDemo(); syncControls(); syncScreen();
  if (document.fonts?.ready) document.fonts.ready.then(render);
})();
