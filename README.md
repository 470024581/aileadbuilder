# 🧠 AI Lead Builder

一个基于Next.js的AI驱动潜在客户外联工具，使用OpenAI技术生成个性化LinkedIn消息。

## ✨ 功能特性

- 🎯 **潜在客户管理** - 添加、编辑、删除潜在客户信息
- 🤖 **AI消息生成** - 使用OpenAI自动生成个性化LinkedIn消息
- 📊 **状态跟踪** - 管理消息状态（草稿/已批准/已发送）
- 💼 **数据存储** - 使用Supabase存储客户信息和消息
- 📱 **响应式设计** - 支持桌面和移动设备
- 🎨 **现代UI** - 使用shadcn/ui和Tailwind CSS

## 🛠️ 技术栈

- **前端框架**: Next.js 15 (App Router)
- **UI组件**: shadcn/ui + Tailwind CSS
- **数据库**: Supabase (PostgreSQL)
- **AI服务**: OpenAI GPT-3.5/4
- **表单处理**: react-hook-form + zod
- **图标**: Lucide React
- **语言**: TypeScript

## 📦 安装和设置

### 1. 克隆项目

```bash
git clone <your-repo-url>
cd aileadbuilder-1
npm install
```

### 2. 环境变量配置

创建 `.env.local` 文件：

```bash
# Supabase配置
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# OpenAI配置
OPENAI_API_KEY=your-openai-api-key

# 应用配置
NEXT_PUBLIC_APP_NAME="AI Lead Builder"
NEXT_PUBLIC_APP_DESCRIPTION="AI-powered outreach workflow tool"
```

### 3. 数据库设置

1. 在Supabase中创建新项目
2. 在SQL编辑器中运行 `database.sql` 文件中的脚本
3. 确保RLS策略已正确设置

### 4. 运行项目

```bash
npm run dev
```

访问 `http://localhost:3000` 查看应用。

## 📁 项目结构

```
src/
├── app/                    # App Router页面
│   ├── globals.css        # 全局样式
│   ├── layout.tsx         # 根布局
│   ├── page.tsx           # 主页面
│   ├── api/               # API路由
│   ├── leads/             # 潜在客户相关页面
│   └── messages/          # 消息管理页面
├── components/            # React组件
│   ├── ui/                # shadcn/ui组件
│   ├── Navigation.tsx     # 导航组件
│   └── ...                # 其他组件
├── lib/                   # 工具库
│   ├── supabase.ts        # Supabase客户端
│   ├── openai.ts          # OpenAI配置
│   ├── types.ts           # TypeScript类型
│   └── utils.ts           # 工具函数
└── hooks/                 # 自定义React Hooks
```

## 🚀 功能演示

### 1. 添加潜在客户
- 填写客户姓名、职位、公司信息
- 可选择添加LinkedIn个人资料URL
- 自动保存到Supabase数据库

### 2. 生成AI消息
- 选择潜在客户点击"生成消息"
- AI根据客户信息自动生成个性化消息
- 支持消息编辑和预览

### 3. 状态管理
- 草稿：新创建或生成的消息
- 已批准：审核通过准备发送的消息
- 已发送：已经发送给客户的消息

### 4. 数据导出
- 支持导出潜在客户列表为CSV格式
- 可批量处理客户信息

## 🔧 开发说明

### 添加新的UI组件

```bash
npx shadcn@latest add [component-name]
```

### 数据库迁移

在Supabase SQL编辑器中运行迁移脚本：

```sql
-- 添加新字段示例
ALTER TABLE leads ADD COLUMN phone TEXT;
```

### API接口

所有API接口位于 `src/app/api/` 目录：

- `GET/POST /api/leads` - 潜在客户CRUD操作
- `POST /api/generate-message` - 生成AI消息
- `GET/POST /api/messages` - 消息管理

## 🧪 测试

手动测试流程：

1. **添加潜在客户**
   - 访问 `/leads/new`
   - 填写表单并提交
   - 验证数据保存成功

2. **生成消息**
   - 在潜在客户列表中点击"生成消息"
   - 验证AI消息生成成功
   - 测试消息编辑功能

3. **状态管理**
   - 测试状态切换功能
   - 验证状态筛选工作正常

## 🚀 部署

### Vercel部署（推荐）

1. 将代码推送到GitHub
2. 在Vercel中导入项目
3. 配置环境变量
4. 部署应用

### 环境变量检查清单

- [ ] NEXT_PUBLIC_SUPABASE_URL
- [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY  
- [ ] OPENAI_API_KEY

## 🛡️ 安全注意事项

- OpenAI API密钥仅在服务端使用
- Supabase配置了行级安全性(RLS)
- 所有用户输入都经过验证和清理
- 生产环境中应配置更严格的RLS策略

## 📋 TODO / 改进方向

- [ ] 用户认证和权限管理
- [ ] 消息模板管理
- [ ] 批量消息生成
- [ ] 拖拽式状态管理
- [ ] 更多AI模型选择
- [ ] 消息发送集成
- [ ] 数据分析和报表
- [ ] 移动端应用

## 🤝 贡献

欢迎提交Issue和Pull Request来改进项目。

## 📄 许可证

MIT License

---

**注意**: 这是一个演示项目，用于展示Next.js、Supabase和OpenAI的集成应用。在生产环境中使用前，请确保进行充分的安全审查和测试。