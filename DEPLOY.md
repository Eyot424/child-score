# 部署到外网

用 Cloudflare Pages。免费额度：静态托管无限流量、Functions 10 万次请求/天、KV 10 万次读 + 1000 次写/天。
这个应用一天用不到 50 次请求，永远跑在免费额度里。

**账号注册和登录必须你自己来**，下面每一步都是你在自己的电脑上跑。

---

## 前置

需要 Node.js（`node -v` 能出版本号就行）。没有的话去 https://nodejs.org 装 LTS 版。

---

## 1 · 注册并登录 Cloudflare

先去 https://dash.cloudflare.com/sign-up 注册一个账号（免费，不用绑卡）。

然后在项目目录里登录，会自动打开浏览器让你授权：

```bash
npx wrangler login
```

---

## 2 · 创建 KV 命名空间

数据就存在这里。

```bash
npx wrangler kv namespace create STARS
```

输出里会有一行 `id = "xxxxxxxxxxxx"`，**把这个 id 复制到 `wrangler.toml` 里**，替换掉 `PUT_YOUR_KV_NAMESPACE_ID_HERE`。

---

## 3 · 创建 Pages 项目

```bash
npx wrangler pages project create jinxi-stars --production-branch master
```

---

## 4 · 设置家庭密码

这是唯一保护数据的东西——网址是公开的，**没有这个密码谁也读不到、改不了数据**。
挑一个别人猜不到的，不要用生日。

```bash
npx wrangler pages secret put FAMILY_PASS --project-name jinxi-stars
```

回车后粘贴密码。屏幕上不会显示，正常。

---

## 5 · 部署

```bash
npx wrangler pages deploy
```

跑完会给你一个网址，形如 `https://jinxi-stars.pages.dev`。

**手机电脑都打开这个网址，第一次会让你输家庭密码，输一次就记住了。**
之后任何一台设备上的改动，其他设备刷新就能看到。

---

## 以后改了代码怎么重新发布

```bash
npx wrangler pages deploy
```

就这一条。

---

## 数据安全

| | |
|---|---|
| 网址 | 公开，谁都能打开 |
| 数据 | **必须有家庭密码才能读写**，密码在服务端比对，且用定长比较防止靠响应时间猜 |
| 传输 | 全程 https |
| 存储位置 | Cloudflare KV，你自己的账号下 |
| 本地备份 | 设置页可以再绑一个本地 .json 文件，云端之外的第二份 |

**改密码**：重跑第 4 步，然后每台设备上点「设置 → 换密码 / 退出」重新输一次。

---

## 出问题时

| 现象 | 原因 | 怎么办 |
|---|---|---|
| 横幅显示「密码不对」 | 密码输错，或第 4 步没做 | 重跑第 4 步，重新部署 |
| 「服务端还没绑定 KV 命名空间 STARS」 | `wrangler.toml` 里的 id 没换 | 回第 2 步 |
| 「服务端还没设置 FAMILY_PASS」 | 第 4 步没做或项目名写错 | 重跑第 4 步 |
| 横幅显示「云端连不上」 | 网络问题 | 改动已经存在本机了，网络恢复后点「立即重试」会自动补传，数据不会丢 |

---

## 不想用云端？

直接双击 `public/index.html` 打开就行。这时候页面自动进入纯本地模式（不会去连 `/api`），
数据存在浏览器里 + 可选的本地 .json 文件。两种模式用的是同一个文件，不用改代码。
