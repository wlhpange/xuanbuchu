# ✨ 选不出

> 解决选择困难症的趣味随机选择器 —— 交给命运，别纠结了。

「今天吃什么」「今天看什么」「周末去哪玩」……把纠结的事交给命运，四种随机动画帮你做决定。

## 功能特性

- 🎡 **四种随机模式**：命运转盘 / 老虎机 / 翻牌 / 一键天选
- 🎲 **加权概率**：每个选项可调权重（1–10），实时预览概率分布
- 🕐 **历史降权**：近期抽中过的选项概率自动降低（0–30 天可调），不容易连着重复
- 👎 **不满意换一个**：连续排除最近的结果重新抽取（上限 5 个）
- 🍱 **多选模式**：一次抽 N 个不重复选项，三菜一汤、周末行程一次搞定
- 📂 **自定义类别**：自由增删改类别和选项，支持批量导入
- 📋 **历史记录**：按日期分组、按类别筛选、一键再选
- 🎨 **双主题**：毛玻璃霓虹 / 复古像素风，一键切换
- 💾 **数据本地化**：全部数据存在浏览器，不上传服务器，支持 JSON 导出/导入
- 📱 **PWA**：可添加到手机桌面，支持离线使用

## 随机模式

| 模式 | 效果 |
|------|------|
| 🎡 命运转盘 | 经典转盘旋转减速停下，仪式感最强 |
| 🎰 老虎机 | 三列滚动依次定格，最后揭晓答案 |
| 🃏 翻牌 | 三张牌盖着，凭手感选一张翻开 |
| ⚡ 一键天选 | 最快最直接，屏幕一闪答案出炉 |

## 快速开始

```bash
git clone git@github.com:wlhpange/xuanbuchu.git
cd xuanbuchu
npm install
npm run dev
```

打开 http://localhost:5173 即可使用。

## 构建与部署

```bash
npm run build    # 产物输出到 dist/
npm run preview  # 本地预览构建产物
```

`dist/` 为纯静态文件，可部署到任意静态托管（Vercel、Netlify、GitHub Pages 等）。

## 技术栈

| 类别 | 选型 |
|------|------|
| 框架 | React 19 + Vite |
| 路由 | React Router 7 |
| 状态管理 | Zustand（localStorage 持久化） |
| 样式 | Tailwind CSS 4 + CSS 变量主题系统 |
| 动画 | Framer Motion |
| PWA | vite-plugin-pwa |

## 项目结构

```
src/
├── main.jsx              # 入口
├── App.jsx               # 路由与主题挂载
├── index.css             # 主题变量与全局样式
├── store/useStore.js     # Zustand store：类别/历史/随机算法/导入导出
├── pages/
│   ├── Home.jsx          # 首页选择器（四种模式 + 结果展示）
│   ├── CategoryManage.jsx# 类别管理
│   ├── CategoryItems.jsx # 选项管理（权重/批量导入）
│   ├── History.jsx       # 历史记录
│   └── Settings.jsx      # 主题/导入导出/设置
├── components/Navbar.jsx # 底部导航
└── utils/id.js           # ID 生成
```

## 设计文档

产品设计与交互规则详见 [design.md](./design.md)，包括排除/降权算法、「不满意换一个」的优先级规则、主题系统方案等。

## 关于

个人作品项目，用 React + Vite 构建，数据不联网。欢迎 Issue 和 PR。
