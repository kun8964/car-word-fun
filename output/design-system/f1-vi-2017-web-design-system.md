# Kids Racing Web Design System

来源: `/Users/kkk/车车大联盟/output/pdf/F1 VI 2017（205P）.pdf`

用途: 将 PDF 的视觉识别理念抽象为面向 5-15 岁儿童的网站设计系统，适合儿童赛车启蒙、汽车知识学习、亲子活动、儿童赛事专题、玩具车/卡丁车社区、校园科技活动等场景。不要直接使用 F1 logo、F1 字体、赛道图标或商标资产，以下内容是视觉方法论与交互语言的转译。

## 1. Core Idea

关键词: fast, playful, clear, safe, energetic.

网站气质应像一条儿童可以参与的未来小赛道: 进入即有速度感，滚动时像闯关前进，信息出现像发车、过弯、收集徽章和冲线。整体要兴奋但不压迫，保留红黑白的赛车识别，同时加入更明亮的安全色、更圆润的形态、更清晰的阅读层级。

设计目标:

- 让首屏形成兴奋感: 大图形、短标题、清楚按钮、明确下一步。
- 让滚动成为闯关: 纵向进入，轻量横向穿越，局部视差，最后用奖励或任务收束。
- 让图形像儿童赛车工程室: 网格、点阵、弯角、线路、编号、计时、徽章、能量条。
- 让文字像儿童解说员: 短、清楚、有节奏，避免复杂术语和过度攻击性的表达。

## 1.1 Audience Rules

5-15 岁不是单一人群，网站需要同时照顾儿童和家长:

- 5-8 岁: 依赖图像、声音感和大按钮。页面要少字、大触控、强反馈，任务一步一屏。
- 9-12 岁: 喜欢收集、排名、解锁、知识卡。可以增加轻量数据、车型知识和互动问答。
- 13-15 岁: 接近青少年审美，避免过幼稚。可以保留更酷的黑场、技术图、性能参数和挑战系统。
- 家长/老师: 需要安全感、课程价值、活动规则、隐私说明、报名信息和明确联系方式。

默认页面应采用“双层表达”: 第一层给孩子看，直接、有趣、可点；第二层给家长看，可信、清楚、可验证。

## 2. Visual Principles

### Full Tilt Momentum

页面元素不居中摆拍，尽量带方向，但方向感要像“游戏赛道”而不是“危险冲撞”。红色块、图像裁切、线框、箭头、轨迹纹理都应暗示从左到右或从远到近的运动。

实现方式:

- 使用斜切大色块、圆角 L 形框线、赛道弯角线。
- 重要标题可以轻微出框，但避免大面积裁切造成低龄儿童读不完整。
- section 之间可以硬切，但儿童学习/报名流程用更柔和的过渡。

### Brutal Clarity

颜色仍然克制，但比成人赛车品牌更明亮。黑、红、白是识别骨架，蓝、黄、绿作为儿童友好的功能色，灰色用于工程图纸和信息标注。

实现方式:

- 单屏最多一个主色动作，辅助色只服务状态: 绿色成功、黄色奖励、蓝色知识。
- CTA 用红色、绿色或反相白色，但同屏主 CTA 只能一个。
- 使用大量留白或大片色场，卡片可更圆润，但不要堆叠成玩具货架。

### Grid as Engine

PDF 中基础网格贯穿横版页面、移动端、广告位和应用物料。网页也应先定义基础网格，再让内容、图形和动效都吸附到它。

实现方式:

- 桌面端使用 12 栏或 24 栏网格。
- 关键 section 叠加 8px 或 12px base grid。
- 装饰点阵与背景纹理必须与网格对齐。

### Type as Spectacle

标题不是说明文字，而是视觉主角。短句、超粗、超宽和密集排布会形成赛事海报感；儿童场景下要优先可读，不要为了造型牺牲识别。

实现方式:

- Hero 标题桌面 72px 到 150px，移动端 40px 到 64px。
- 标题行高 0.9 到 1.05，字距适度收紧，中文不要过度压缩。
- 正文行宽控制在 6 到 12 个英文词的感觉，中文约 16 到 26 字。
- 儿童任务说明每段不超过 2 行，复杂规则拆成步骤卡。

### Technical Glamour

F1 的视觉不是纯粗糙，它同时有工程精密感和高级场景感。儿童网站可把这种精密感转译成“未来车库”“小工程师实验室”“亲子赛道中心”，在黑红冲击之外加入亮蓝、暖黄、清爽纸白和低饱和金属灰。

实现方式:

- 应用照片使用清晰孩子活动、玩具车、卡丁车、车库课堂、赛道模型，避免危险驾驶画面。
- 会员、课程、亲子活动可使用黄色徽章和蓝色知识标签，替代过于成人化的暗金奢华。
- 图像上叠加细网格、坐标、圈速、编号和徽章，而不是普通圆角卡片。

## 3. Color Tokens

从渲染页抽样得到的近似主色:

```css
:root {
  --f1-red: #ff1800;
  --night: #0d0d18;
  --paper: #f8f4f1;
  --white: #ffffff;
  --track-gray: #737379;
  --steel: #e3e3e4;
  --ink: #11121d;
  --kid-blue: #2f80ff;
  --boost-yellow: #ffd23f;
  --success-green: #22c55e;
  --soft-sky: #eaf4ff;
}
```

配色比例:

- 儿童英雄页: `--night` 55%, `--f1-red` 18%, `--white` 17%, `--kid-blue`/`--boost-yellow` 10%.
- 学习/规则页: `--paper` 70%, `--ink` 15%, `--kid-blue` 10%, `--f1-red` 5%.
- 工程系统页: `--soft-sky` 35%, `--paper` 35%, `--track-gray` 15%, `--f1-red` 10%, `--boost-yellow` 5%.
- 家长信任页: `--paper` 80%, `--ink` 12%, `--success-green` 5%, `--f1-red` 3%.

禁忌:

- 不使用紫色渐变、霓虹彩虹、过度低幼的糖果色堆叠。
- 不使用大量阴影和卡片堆叠。
- 红色用于速度和重点，不用于错误、危险或恐吓提示。
- 黑底不要长时间连续出现，避免低龄儿童感到压迫。

## 4. Typography

原 PDF 使用专属 F1 字体系统。网站不能直接复刻，可采用以下替代方向:

### Latin

- Display: `Baloo 2`, `Archivo Black`, `Fredoka`, `Anton`, `Oswald`
- UI: `Inter`, `Nunito Sans`, `Roboto Condensed`, `IBM Plex Sans Condensed`
- Technical mono: `IBM Plex Mono`, `Roboto Mono`, `JetBrains Mono`

### Chinese

- Display: `阿里巴巴普惠体 3.0 Heavy`, `思源黑体 Heavy`, `Noto Sans SC Black`
- UI: `Noto Sans SC`, `Source Han Sans SC`, `HarmonyOS Sans SC`, `得意黑`
- Technical mono: `JetBrains Mono` for numbers, `Noto Sans Mono CJK` when needed

Typography scale:

```css
--display-xl: clamp(3.5rem, 10vw, 10rem);
--display-lg: clamp(3rem, 8vw, 7.5rem);
--headline: clamp(2.25rem, 5vw, 5rem);
--section-title: clamp(1.5rem, 2.8vw, 3rem);
--body: 17px;
--caption: 12px;
```

Rules:

- 大标题短句优先，最多 2 到 4 行。
- 英文全大写只用于极短口号；中文用超粗短句替代，不强制全角视觉。
- 正文不要全大写，儿童说明不用斜体和过细字体。
- 数字、圈速、排名、时间使用 mono 或 condensed 字体，但旁边要有清楚单位。
- 5-8 岁核心按钮文字控制在 2 到 5 个字，如“开始跑”“看赛车”“去闯关”。

## 5. Layout System

### Base Grid

- Desktop: 24 columns, 24px gutter, max width none for hero, 1440px constrained content for reading.
- Tablet: 12 columns, 20px gutter.
- Mobile: 4 columns, 16px margin, no horizontal overflow.

### Page Rhythm

- Hero: full viewport or 80vh, giant type, one friendly visual anchor, slow-moving background.
- Mission band: 红色或蓝色通栏，使用大号但可读的宣言文字。
- Identity band: 黑色场域、白色线框、点阵纹理，并加入明亮安全色缓冲。
- Learning band: 纸白或浅蓝背景，承载知识卡、任务卡、车型小百科。
- Motion band: 轻量横向赛道视差，移动端改为纵向闯关。
- Parent band: 纸白背景，展示活动规则、安全说明、隐私保护、报名信息。
- Footer: 紧凑实用，让家长/老师快速找到信息。

### Containers

- 不做卡片套卡片。
- 内容区可以是 unframed layout、full-width band 或严格线框。
- 若需要儿童任务卡，半径 12 到 20px，边框 2px，阴影轻微；工程/赛事信息卡仍保持 0 到 6px。

## 6. Graphic Devices

### Track Stroke

用粗红线或白线模拟赛道弯角和速度感，但不要照抄官方 logo。儿童版本可把线条端点做得更圆，像玩具赛道或安全护栏。

CSS 思路:

```css
.track-stroke {
  border: 3px solid currentColor;
  border-left: 0;
  border-bottom-right-radius: 28px;
  transform: skewX(-10deg);
}
```

### Dot Matrix

用于背景深度、技术感和滚动视差。点阵应吸附到 grid，不要随机铺满；儿童页面中透明度要更低，避免像噪点或脏污。

```css
.matrix {
  background-image: radial-gradient(currentColor 1px, transparent 1px);
  background-size: 12px 12px;
  opacity: .18;
}
```

### Split Blocks

用黑白、红白、蓝白 50/50 硬切表现“发车、加速、转弯、冲线”。避免“血液、燃烧、冲突”这类过强意象。

### Circuit Icons

可为自有内容绘制抽象线路图，用作导航、章节编号、loading、地图或关卡路径，不要使用官方赛道资产。儿童版本的线路图要减少尖锐折线，多用圆角弯。

## 7. Parallax Design System

推荐核心模式: Kids Track Journey + Playful Technical Minimalism.

视差原则: 对 5-15 岁用户，视差要像“跟着小赛车前进”，不能像高速镜头乱冲。所有强运动都要可暂停、可降级，并尊重 `prefers-reduced-motion`。

### Layer Model

每个视差 section 保持 4 层以内，低龄页面优先 3 层:

1. Deep layer: 赛道背景、车库课堂、玩具车场景，低速移动，速度 0.15x。
2. Grid layer: 点阵、坐标线、知识框，速度 0.25x。
3. Track layer: 红色弯角线、方向箭头、关卡路径，速度 0.45x。
4. Content layer: 标题、任务、CTA、奖励徽章，速度 1x。

### Scroll Structure

- 第一屏竖向进入: 小赛车沿轨迹进入，标题和主按钮出现。
- 第二段轻横向滚动: 3 到 5 张“关卡”面板，每张讲一个活动、知识点或车型主题。
- 中段轻反向视差: 背景慢速，标题和徽章有节奏出现，避免高速闪烁。
- 学习说明段: 回到白底或浅蓝底，解释规则、安全、课程价值和家长须知。
- 终段冲线: 红色或蓝色全屏 CTA，进度条到 100%，给出奖励感而不是压迫感。

### Motion Rules

- 动效时长: hover/tap 150 到 220ms，section reveal 450 到 750ms。
- easing: `cubic-bezier(.16, 1, .3, 1)` 用于快速但柔和的刹停。
- 标题进入: clip-path reveal 或 translateX，不使用快速闪烁。
- 图片进入: scale 1.04 到 1.0，轻微横向 drift。
- 避免 autoplay 音效、频闪、快速缩放、持续抖动。
- 低性能和 `prefers-reduced-motion` 下关闭横向强视差，保留 fade/translate。

### Interaction Ideas

- Scroll progress as race progress: 顶部或底部粗线显示当前关卡。
- Section labels as track signs: 左上角小编号和章节名，用“第 1 站/第 2 站”表达。
- Hover/tap as pit telemetry: 出现知识卡、车型小事实、奖励徽章。
- CTA as start light: 3 到 5 个灯点依次亮起，点击后进入任务；提供跳过动画。

## 8. Components

### Nav

- 固定顶部或左上角，清晰、低密度、触控友好。
- 黑底页用白字加红色/黄色进度线。
- 白底页用黑字加细灰边框。
- 主导航项控制在 4 到 6 个，家长入口单独标识。

### Hero

- 必须有超大标题和单一友好图形动作。
- CTA 不超过 2 个，主按钮用动词: “开始闯关”“报名体验”“看赛车”。
- 背景可用视频/照片，但文字区域要有足够黑场或白场。
- 首屏不要让动画阻挡主按钮。

### Stat Strip

- 显示完成关卡、活动数、车型数、知识点、徽章数。
- 使用 condensed 或 mono 数字，并配清楚图标或标签。
- 每个指标有 1px 分割线或轻量圆角底，不用重阴影。

### Story Panel

- 用于横向滚动或移动端纵向 snap。
- 左侧巨大编号，右侧标题，底部短说明和奖励徽章。
- 背景可切换黑、红、纸白、浅蓝、工程灰。
- 每张面板只讲一个任务。

### Media Frame

- 图片用 8 到 16px 半径；青少年技术页可用直角或 4px 半径。
- 可叠加 L 形线框、点阵遮罩、角标。
- 图像裁切可以大胆，但儿童脸部、车辆主体和安全装备不要被裁掉。

### CTA Finish Line

- 红色、蓝色或黑色 full-bleed section。
- 巨大一句话，短按钮，底部像赛事字幕一样列出家长须知、隐私、安全和联系方式。
- 提供明确下一步，不制造倒计时压力。

### Parent Trust Block

- 放在报名、支付、活动详情之前。
- 内容包括年龄范围、活动时长、是否需家长陪同、安全措施、隐私说明、退款/取消规则。
- 视觉上比儿童任务区更安静: 纸白背景、清晰表格、绿色确认状态。

### Reward Badge

- 用于任务完成、知识学习、活动参与。
- 形状可以是圆角盾牌、号码牌、赛车贴纸。
- 不要诱导付费抽奖或随机奖励，儿童产品应避免赌博式反馈。

## 9. Children Safety, Accessibility And Performance

- 黑红白对比强，但红底白字要检查字号和字重，避免小字大面积红底。
- 所有主要触控目标至少 44x44px，5-8 岁核心按钮建议 56px 高以上。
- 视差默认不绑定所有元素，重点 section 才用。
- 移动端不要横向强制滚动，改成纵向 snap panels。
- 提供 `prefers-reduced-motion` fallback。
- 视频和大图必须懒加载，首屏只保留必要资源。
- CTA、链接和导航必须有明确 focus state。
- 不使用快速频闪、危险驾驶暗示、过度竞争文案、强倒计时和焦虑式转化。
- 表单必须短，儿童信息采集最小化；涉及报名、位置、联系方式时进入家长流程。
- 排行榜默认弱化真实个人信息，优先展示昵称、徽章和团队，不展示儿童敏感信息。
- 文字语气鼓励探索，不嘲讽失败；错误提示改成“再试一次”“换条路线”。

## 10. Website Starter Blueprint

```text
01 Hero: "开启小小赛道" / dark or bright field / friendly red track sweep
02 Start Mission: red or blue full screen / huge readable stacked type
03 Track Journey: 3-5 parallax panels / 车型、知识、活动、徽章
04 Kids Garage: paper or soft-sky background / grid-based learning cards
05 Track Map: interactive abstract circuit / rounded paths and stage markers
06 Stories: editorial white pages / short lines / children and parent voices
07 Parent Trust: safety, privacy, age range, activity rules, registration info
08 Finish CTA: red or blue full-bleed final action / reward badge / parent links
```

This system should feel fast, engineered, playful, safe, and premium. The key is balance: keep the racing DNA, but make every interaction readable, kind, controllable, and age-aware.
