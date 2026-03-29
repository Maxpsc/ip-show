# IP Show Chrome 插件设计

## 1. 概述

**项目名称：** IP Show
**项目类型：** Chrome 浏览器插件
**核心功能：** 通过多个境内外测试节点检测用户当前公网 IP，展示境内外 IP 对比及详细信息
**目标用户：** 需要快速确认自身公网 IP 归属地（境内/境外）的用户

## 2. 功能规格

### 2.1 核心功能

| 功能 | 描述 | 优先级 |
|------|------|--------|
| 一键测 IP | 点击插件图标，立即通过 8 个测试点检测本机公网 IP | P0 |
| 境内外分组展示 | 境内 4 点 vs 境外 4 点对比显示结果 | P0 |
| 简洁/详情切换 | 默认卡片视图，点击【展开】查看详细信息 | P1 |
| 节点延迟显示 | 显示每个测试节点的响应时间 | P1 |

### 2.2 测试节点配置

**境内节点（4 个）：**
- 北京 (BJ) - `http://ip-api.com/json/?fields=status,country,countryCode,region,regionName,city,isp,org,as,query`
- 上海 (SH) - 同上
- 广州 (GZ) - 同上
- 深圳 (SZ) - 同上

**境外节点（4 个）：**
- 美国 (US) - 同上
- 日本 (JP) - 同上
- 香港 (HK) - 同上
- 新加坡 (SG) - 同上

### 2.3 UI 交互

**弹出窗口尺寸：** 宽度 420px，高度自适应（最大 600px）

**默认视图（简洁卡片）：**
```
┌─────────────────────────────┐
│  🌐 IP Show          [展开▼] │
├─────────────────────────────┤
│  国内节点                    │
│  ┌─────┬─────┬─────┬─────┐ │
│  │北京 │上海 │广州 │深圳 │ │
│  │IP   │IP   │IP   │IP   │ │
│  │归属 │归属 │归属 │归属 │ │
│  └─────┴─────┴─────┴─────┘ │
│                             │
│  海外节点                    │
│  ┌─────┬─────┬─────┬─────┐ │
│  │美国 │日本 │香港 │新加坡│ │
│  │IP   │IP   │IP   │IP   │ │
│  │归属 │归属 │归属 │归属 │ │
│  └─────┴─────┴─────┴─────┘ │
│                             │
│  [重新测试]                  │
└─────────────────────────────┘
```

**展开视图（详情面板）：**
- 在默认视图基础上，展开每个节点更多信息
- 额外显示：ISP、ASN、时区、查询延迟(ms)

### 2.4 数据结构

```typescript
interface IpResult {
  status: 'success' | 'fail';
  country: string;
  countryCode: string;
  regionName: string;
  city: string;
  isp: string;
  org: string;
  as: string;       // ASN
  query: string;    // IP 地址
  latency?: number; // 延迟(ms)
}

interface NodeResult {
  node: string;        // 节点名称
  location: string;    // 位置
  result: IpResult | null;
  error?: string;
}
```

## 3. 技术方案

### 3.1 技术栈

| 技术 | 选型 | 说明 |
|------|------|------|
| 包管理 | pnpm | 快速、节省空间 |
| 前端框架 | React 18 | 组件化开发 |
| 类型系统 | TypeScript | 类型安全 |
| 构建工具 | Vite | 适合插件开发，冷启动快 |
| 样式 | Tailwind CSS | 快速样式开发 |
| 测试 | Vitest + Playwright | 单元测试 + E2E |
| Chrome API | @crxjs/vite-plugin | Chrome 插件开发支持 |

### 3.2 项目结构

```
ip-show/
├── src/
│   ├── content/           // Content Script（如需）
│   ├── background/        // Background Service Worker
│   ├── popup/             // 弹出窗口
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── components/        # 共享组件
│   │   ├── IpCard.tsx     # IP 卡片
│   │   ├── NodeGrid.tsx   # 节点网格
│   │   └── ExpandButton.tsx
│   ├── hooks/             # 自定义 Hooks
│   │   └── useIpCheck.ts  # IP 检测逻辑
│   ├── services/          # 服务层
│   │   └── ipApi.ts       # IP API 调用
│   ├── types/             # 类型定义
│   │   └── index.ts
│   └── utils/             # 工具函数
│       └── index.ts
├── public/
│   └── icons/             # 插件图标
├── tests/                 # 测试文件
│   ├── unit/
│   └── e2e/
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── manifest.json           # Chrome 插件配置
```

### 3.3 IP 检测流程

1. 用户点击插件图标，弹出窗口打开
2. 同时发起 8 个并行请求到 ip-api.com（带 country 字段筛选）
3. 收集响应结果，计算延迟
4. 按境内/境外分组展示
5. 失败节点显示错误状态

### 3.4 API 调用

使用 `ip-api.com` 的批量查询接口：
- 文档：https://ip-api.com/docs/api:json
- 限制：45 请求/分钟（对插件场景足够）
- 支持指定国家筛选

### 3.5 测试策略

**单元测试：**
- `useIpCheck` hook 逻辑测试
- IP API 调用测试（mock）
- 组件渲染测试

**E2E 测试：**
- 插件安装测试
- 弹窗打开测试
- IP 检测功能测试
- 展开/收起切换测试

## 4. 非功能需求

- **性能**：首次加载 < 2s，刷新检测 < 1s
- **错误处理**：网络失败时显示友好提示，支持重试
- **兼容性**：支持 Chrome 88+

## 5. Out of Scope

- 不支持 IE/Edge/Firefox（仅 Chrome）
- 不支持后台定时检测
- 不支持历史记录存储
