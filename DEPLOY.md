# FireSwan 运营后台 · 部署指南

## 第一步：Supabase 建表

1. 打开 [supabase.com](https://supabase.com) → 进入你的项目
2. 左侧菜单 → **SQL Editor** → 点 **New query**
3. 把 `supabase-schema.sql` 文件里的内容全部粘贴进去 → 点 **Run**
4. 完成后左侧 **Table Editor** 里应该能看到 `products`、`daily_orders`、`daily_prices` 三张表

## 第二步：获取 Supabase 密钥

在 Supabase 项目里：
- 左侧 → **Project Settings** → **API**
- 复制以下两个值备用：
  - **Project URL** → 对应 `NEXT_PUBLIC_SUPABASE_URL`
  - **anon / public key** → 对应 `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - **service_role key**（往下翻） → 对应 `SUPABASE_SERVICE_ROLE_KEY`

## 第三步：推送到 GitHub

```bash
cd fireswan
git init
git add .
git commit -m "init"
# 在 GitHub 新建一个私有仓库，然后：
git remote add origin https://github.com/你的用户名/fireswan.git
git push -u origin main
```

## 第四步：Vercel 部署

1. 打开 [vercel.com](https://vercel.com) → **Add New Project**
2. 选择刚刚推送的 GitHub 仓库 → **Import**
3. Framework 自动识别为 Next.js，不用改
4. 展开 **Environment Variables**，添加以下四个：

| 变量名 | 值 |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | 你的 Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 你的 anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | 你的 service_role key |
| `UPLOAD_PASSWORD` | 你设定的上传密码（自己定，记住就行）|

5. 点 **Deploy** → 等待约 1 分钟
6. 部署完成后 Vercel 会给你一个 `.vercel.app` 域名，所有人都可以用这个链接访问

## 第五步：导入历史数据

打开网站 → 订单分析页 → 输入密码验证 → 上传之前的 xlsx 文件

---

## 日常使用

- **看数据**：任何人打开链接都能看，不需要密码
- **上传新订单**：点上传区，输入密码，选择文件
- **修改商品名称**：商品档案页，输入密码后直接编辑
- **清除订单数据**：商品档案页右上角"清除订单数据"按钮（内部名称会保留）
