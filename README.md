# Vehicle Card Collection + Math Learning

面向 4-9 岁儿童的车辆卡牌收集与数字学习网页游戏 MVP。

当前版本是单页静态 Web App，不包含多用户体系、账号系统、预约流程或二级页面。所有场景都在当前页面内切换完成。

## 本地运行

这是一个纯静态项目，直接打开 `index.html` 即可，也可以用本地静态服务运行：

```bash
python3 -m http.server 4173
```

然后访问：

```text
http://localhost:4173/
```

## MVP 功能

- 首页：游戏标题、开始探索、我的车库、家长说明入口。
- 探索地图：城市、赛车场、工地、机场、车库 5 个区域入口。
- 找车任务：点击指定车辆，完成 `Find 3 race cars`。
- 数字学习：完成找车后回答 10 以内加法题。
- 我的车库：展示已收集车辆卡片和未解锁剪影。
- 车辆详情：弹窗展示车辆图片、英文名、中文名、分类、用途、小知识、稀有度。

## 第一版车辆卡

- Audi A4 / 奥迪 A4
- Ferrari 458 / 法拉利 458
- Red Bull RB7 / 红牛 RB7
- Excavator / 挖掘机
- Ducati V4 / 杜卡迪 V4
- Boeing 777 / 波音 777
- Mercedes G63 / 奔驰 G63
- Beetle / 大众甲壳虫
- BYD Bus / 比亚迪公交车
- Willys MB / 军用吉普
- Ferrari F40 / 法拉利 F40
- Truck Crane / 汽车起重机

## 学习机制

- 数数：找到指定数量的车辆。
- 加法：`3 + 2 = 5`。
- 分类识别：City Cars、Sports Cars、Race Cars、Construction Vehicles 等。
- 温和反馈：错误时使用 `Try again` 和 `Let’s count together` 语气，不惩罚。
- 奖励反馈：答对后获得星星，并解锁新车辆卡。
