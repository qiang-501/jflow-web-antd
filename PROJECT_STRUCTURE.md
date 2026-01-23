# 项目结构优化说明

本项目已经过重构，采用了更清晰和可维护的文件夹结构。

## 新的项目结构

```
src/app/
├── core/                          # 核心模块 (单例服务、拦截器、守卫)
│   ├── interceptors/              # HTTP拦截器
│   │   ├── fake-backend.interceptor.ts
│   │   └── index.ts
│   ├── services/                  # 核心服务
│   │   ├── translation.service.ts
│   │   └── index.ts
│   ├── guards/                    # 路由守卫
│   └── index.ts
│
├── store/                         # NgRx状态管理 (统一管理)
│   ├── actions/                   # 所有actions
│   │   ├── workflow.actions.ts
│   │   ├── valve.actions.ts
│   │   ├── menu.actions.ts
│   │   └── index.ts
│   ├── reducers/                  # 所有reducers
│   │   ├── workflow.reducer.ts
│   │   ├── valve.reducer.ts
│   │   ├── menu.reducer.ts
│   │   └── index.ts
│   ├── selectors/                 # 所有selectors
│   │   ├── workflow.selectors.ts
│   │   ├── valve.selectors.ts
│   │   ├── menu.selectors.ts
│   │   └── index.ts
│   ├── effects/                   # 所有effects
│   │   ├── workflow.effects.ts
│   │   ├── valve.effects.ts
│   │   ├── menu.effects.ts
│   │   └── index.ts
│   └── index.ts                   # Store总出口
│
├── shared/                        # 共享模块 (可复用组件、指令、管道)
│   ├── components/                # 共享组件
│   ├── directives/                # 共享指令
│   ├── pipes/                     # 共享管道
│   └── index.ts
│
├── features/                      # 功能模块 (懒加载特性)
│   ├── dashboard/                 # 仪表板功能
│   ├── workflow/                  # 工作流功能
│   └── system/                    # 系统设置功能
│
├── layout/                        # 布局组件
│   ├── shell/                     # 应用外壳
│   └── sidenav/                   # 侧边导航
│
├── models/                        # 数据模型和接口
│   ├── menu.model.ts
│   ├── valves.ts
│   └── work-flow.ts
│
├── app.component.*                # 根组件
├── app.config.ts                  # 应用配置
├── app.reducer.ts                 # 根Reducer配置
├── app.routes.ts                  # 路由配置
└── icons-provider.ts              # 图标配置
```

## 主要改进

### 1. **统一的状态管理结构 (store/)**

- **之前**: Actions、Reducers、Selectors、Effects分散在多个位置
  - `app/effects/`
  - `app/services/effects/`
  - `app/services/reducers/`
  - `app/services/selectors/`
- **现在**: 所有状态管理代码集中在 `store/` 文件夹
  - 更清晰的组织结构
  - 统一的导入路径
  - 每个功能的 actions、reducers、selectors、effects 分离
  - 使用 barrel exports (index.ts) 简化导入

### 2. **Core模块分离**

- **核心服务** (`core/services/`):
  - TranslationService - 国际化服务
  - 其他单例服务
- **拦截器** (`core/interceptors/`):
  - FakeBackendInterceptor - 模拟后端拦截器
- **守卫** (`core/guards/`):
  - 路由守卫 (待添加)

### 3. **Features模块结构**

准备将页面组件迁移到features文件夹，支持懒加载：

- `features/dashboard/` - 仪表板
- `features/workflow/` - 工作流管理
- `features/system/` - 系统设置

### 4. **布局组件分离**

- `layout/shell/` - 应用主框架
- `layout/sidenav/` - 侧边导航栏

### 5. **Shared模块**

为可复用的组件、指令和管道预留位置：

- `shared/components/` - 共享组件
- `shared/directives/` - 共享指令
- `shared/pipes/` - 共享管道

## 迁移指南

### 更新导入路径

**旧导入路径:**

```typescript
// 旧的state管理导入
import { ValveEffects } from "./services/effects/valve.effects";
import { MenuEffects } from "./services/effects/menu.effects";
import { menuReducer } from "./services/reducers/menu.reducer";

// 旧的服务导入
import { TranslationService } from "./app/services/translation/translationService";
import { FakeBackendInterceptor } from "./app/fakes/fake-backend";
```

**新导入路径:**

```typescript
// 新的state管理导入
import { ValveEffects, MenuEffects, WorkFlowEffects } from "./store";
import { MenuActions, ValveActions } from "./store";
import { selectAllMenus, selectAllValves } from "./store";

// 新的服务导入
import { TranslationService } from "./app/core/services";
import { FakeBackendInterceptor } from "./app/core/interceptors";
```

### 使用新的Action Creators

**旧方式:**

```typescript
// 旧的action定义
{ type: 'LoadValves', payload: data }
{ type: 'MenusLoadedSuccess', payload: menus }
```

**新方式:**

```typescript
// 使用action creators
import { ValveActions, MenuActions } from "./store";

ValveActions.loadValves();
MenuActions.menusLoadedSuccess({ payload: menus });
```

## 配置更新

### tsconfig.json

- 更新 `moduleResolution` 为 `"bundler"`
- 添加 `rootDir` 配置

### package.json

- Angular 21.1.1
- TypeScript 5.9.3
- 所有依赖已更新到最新版本

## 下一步计划

1. **迁移页面组件**
   - 将 `pages/main/dashboard` → `features/dashboard`
   - 将 `pages/main/workflow` → `features/workflow`
   - 将 `pages/main/system` → `features/system`
   - 将 `pages/core/shell` → `layout/shell`
   - 将 `pages/core/sidenav` → `layout/sidenav`

2. **添加路径别名**
   - 在 tsconfig.json 中配置 path mapping
   - 使用 `@core/*`, `@shared/*`, `@features/*`, `@store/*`

3. **创建共享组件库**
   - 识别可复用组件
   - 移动到 shared/components

4. **优化懒加载**
   - 为每个feature创建独立的路由模块
   - 实现按需加载

## 文件清理建议

以下旧文件夹可以在迁移完成后删除：

- `app/effects/` (已迁移到 store/effects/)
- `app/services/effects/` (已迁移到 store/effects/)
- `app/services/reducers/` (已迁移到 store/reducers/)
- `app/services/selectors/` (已迁移到 store/selectors/)
- `app/services/translation/` (已迁移到 core/services/)
- `app/fakes/` (已迁移到 core/interceptors/)

## 优点

1. **更好的可维护性**: 清晰的文件夹结构让代码更易理解和维护
2. **模块化**: 功能模块分离，支持懒加载
3. **一致性**: 统一的导入路径和命名约定
4. **可扩展性**: 易于添加新功能和模块
5. **团队协作**: 清晰的结构让多人协作更顺畅

## 最佳实践

1. **遵循单一职责原则**: 每个文件/模块只负责一个功能
2. **使用Barrel Exports**: 通过 index.ts 简化导入
3. **保持文件夹扁平化**: 避免过深的嵌套
4. **命名约定**:
   - Actions: `*.actions.ts`
   - Reducers: `*.reducer.ts`
   - Selectors: `*.selectors.ts`
   - Effects: `*.effects.ts`
   - Services: `*.service.ts`
5. **功能分组**: 相关功能放在同一个feature文件夹下
