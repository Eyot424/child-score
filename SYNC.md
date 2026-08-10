# 多设备同步设置

数据存成 GitHub 仓库里的一个 json 文件，每次改动提交一次。
任何设备打开都是同一份，而且白得一份完整的修改历史 —— 每天的记录都是一个 commit，能回看能回滚。

**这个仓库是公开的，所以数据也是公开可读的，而且会永久留在 git 历史里。**
这是你确认过的选择，写在这里是为了以后不忘。想改成私密的话，把数据放到一个私有仓库即可，
页面照样可以公开托管，只要 token 有那个私有仓库的权限。

---

## 1 · 建一个仓库

去 GitHub 新建一个仓库（可以就用这个项目的仓库），把本地代码推上去：

```bash
git remote add origin https://github.com/你的用户名/child-score.git
git push -u origin master
```

---

## 2 · 建一个只能写这一个仓库的 token

打开 https://github.com/settings/personal-access-tokens/new （**Fine-grained tokens**，不是 classic）

| 项 | 填什么 |
|---|---|
| Token name | `徐瑾熙的星星` |
| Expiration | 按需要选，到期要重建 |
| Repository access | **Only select repositories** → 只勾 `child-score` 这一个 |
| Permissions → Repository permissions → **Contents** | **Read and write** |

其他权限一个都别给。这样这个 token 泄露了也只能动这一个仓库的文件，动不了你别的东西。

生成后**立刻复制**，页面只显示一次。

---

## 3 · 在应用里填进去

打开应用 → **设置 → 数据存在哪 → 同步到 GitHub**

| 字段 | 填什么 |
|---|---|
| GitHub 用户名 | 你的用户名 |
| 仓库名 | `child-score` |
| 分支 | `master` |
| 文件路径 | `data/stars.json` |
| Token | 刚才复制的那串 |

点「保存并连接」。顶部横幅变成 `🐙 已同步到 xxx/child-score` 就成了。

文件不存在时会自动创建，不用先手动建 `data/` 目录。

---

## 4 · 其他设备

**电脑**：直接双击 `index.html` 就行 —— GitHub API 允许从 `file://` 跨域调用，
不需要架服务器。每台电脑各填一次配置。

**手机**：用 GitHub Pages 的网址 **https://eyot424.github.io/child-score/**，
在设置里填同样的配置，加到主屏幕当 App 用。

> Pages 已经开好了（分支 `master`、目录 `/`）。
> 注意分支部署**只能选仓库根目录或 `/docs`**，不支持别的目录 ——
> index.html 放在根目录就是这个原因。

---

## 冲突怎么处理

两台设备同时开着，各自改各自的，不会互相覆盖：

| 情况 | 结果 |
|---|---|
| 手机录 8/01、电脑录 8/02 | 两天都保留 |
| 同一天两边都改 | 取时间戳新的那份 |
| 两边各买了东西 | 兑换流水按 id 取并集，都保留 |
| 提交时发现别人先提交了 | 自动拉回来合并，再提交一次 |

合并是可重入的 —— 反复合并同一份数据不会重复计账。

---

## 出问题时

| 横幅显示 | 原因 | 怎么办 |
|---|---|---|
| `token 无效` | token 填错、过期、或被撤销 | 重建 token，设置里重填 |
| `token 权限不够` | Contents 权限没给 write，或仓库没勾对 | 回第 2 步检查 |
| `连不上 GitHub` | 网络问题 | 改动已经存在本机了，网络好了点「立即重试」自动补传，数据不会丢 |
| `Not Found` | 用户名 / 仓库名 / 分支写错了 | 设置里核对 |

**token 存在浏览器 localStorage 里。** 共用电脑上用完记得点「断开」。

---

## 不想同步？

设置里点「断开」，或者干脆别配。页面会退回纯本地模式：
数据存浏览器 + 可选绑一个本地 .json 文件。同一个 html，两种模式自动切换。
