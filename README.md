# 平安公寓管理系统 - PC管理端

## 技术栈

- **框架**: Vue 3 + Vite
- **UI组件**: Element Plus
- **状态管理**: Pinia
- **路由**: Vue Router 4
- **HTTP客户端**: Axios
- **样式**: SCSS

## 快速开始

### 1. 安装依赖

```bash
cd pingan-ams-admin-web
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

访问: http://localhost:3000

### 3. 构建生产版本

```bash
npm run build
```

## 项目结构

```
src/
├── api/              # API接口
├── components/       # 公共组件
├── router/           # 路由配置
├── stores/           # Pinia状态管理
├── styles/           # 全局样式
├── utils/            # 工具函数
└── views/            # 页面视图
    ├── login/        # 登录页
    ├── dashboard/    # 首页
    ├── building/     # 楼栋管理
    ├── room/         # 房间管理
    ├── contract/     # 合同管理
    ├── bill/         # 账单管理
    ├── workorder/    # 工单管理
    └── user/         # 用户管理
```

## 功能模块

1. **登录** - 微信授权登录（开发阶段可用任意授权码）
2. **首页** - 数据统计概览、快捷操作
3. **楼栋管理** - 楼栋增删改查
4. **房间管理** - 房间增删改查、状态筛选
5. **合同管理** - 合同创建、终止、查询
6. **账单管理** - 账单创建、收款、取消
7. **工单管理** - 工单列表、分配、处理
8. **用户管理** - 待开发

## 开发说明

- API 代理已配置，开发时自动转发到后端 `http://localhost:8080`
- 使用 Element Plus 组件库，已配置中文语言包
- 路由守卫已配置，未登录自动跳转到登录页
- Token 存储在 localStorage，自动携带到请求头
