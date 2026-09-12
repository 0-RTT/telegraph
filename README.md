# Telegraph图床

基于 Cloudflare Worker 和 Telegram Bot API 的图床 / 视频床 / 文件床服务

## 功能特点

### 核心功能
- 🔐 可选的访客验证功能（Basic Auth）
- 🗜️ 可选的图片压缩功能（默认开启，支持前端切换）
- 📦 可选的文件大小限制（默认 20MB，可通过环境变量配置）
- 📁 支持图片、视频等常见媒体格式上传（白名单校验，防止存储型 XSS）
- 📤 支持多文件上传、拖拽上传和粘贴上传（Ctrl+V）
- 🔄 哈希校验避免重复上传
- 🚀 多文件并发上传（默认 4 路并发）

### 管理功能
- 📋 支持查看本地历史记录
- 🖼️ 图库管理界面，支持批量操作
- 🗑️ 支持批量删除文件（同步删除数据库记录和 CDN 缓存）
- ⏰ 显示文件上传时间
- 📋 支持多种格式复制链接（URL、BBCode、Markdown）

### 性能优化
- ⚡ Cloudflare Cache API 缓存支持
- 🎨 懒加载和骨架屏优化
- 🌅 Bing 每日壁纸背景（自动轮播）
- 📱 响应式设计，支持移动端
- 🔁 获取文件路径自动重试（最多 3 次，带退避）
- 🪶 首页零外部依赖（无 jQuery / Bootstrap / FontAwesome / toastr）

### 存储方式
- 📡 基于 Telegram Bot API 的文件存储
- 💾 使用 Cloudflare D1 数据库存储文件映射关系
- 🎯 通过 fileId 实现文件访问

## 更新日志

> **最近更新**: 2026-09-12

<details>
<summary>历史更新记录</summary>

### 2026-09-12
- 移除首页的 jQuery / Bootstrap / Fileinput / FontAwesome / toastr 外部依赖，改为原生实现，首屏体积从约 220 KB 降到约 12 KB
- 上传 key 增加随机后缀，修复同毫秒并发上传互相覆盖的问题
- 上传扩展名白名单校验，阻止 `.html` / `.js` 等文件上传
- 上传鉴权前置，未授权请求不再消耗 Telegram API 配额
- 删除接口校验 URL 归属，只允许删除本站域名下的文件
- 图片响应增加 `X-Content-Type-Options: nosniff`
- SVG 强制以附件形式下载，配合严格 CSP 防止存储型 XSS
- Telegram `getFile` 失败时带退避重试（200ms / 400ms）
- 路由归一化，`/upload/` 不再落到图片分支
- 图片缓存键去掉 query 参数
- JSON 响应加 `no-store`
- 修复管理页删除当前页全部内容后残留空页的问题
- 修复缓存列表顺序被永久修改的问题
- 修复上传成功提示被清除的问题
- 修复同一文件二次选择不触发上传的问题
- 拖拽高亮不再因光标进入子元素而闪烁
- 支持一次粘贴多个文件
- 顶层异常统一返回 JSON

### 2026-01-19
- 使用 Claude 优化了一下代码

### 2025-08-24
- 修复 cdn.bytedance.com 下线导致的页面加载异常的问题

### 2025-08-07
- 修复主页背景图片无法加载的问题

### 2024-12-18
- 更新管理界面样式
- 移除前端的文件类型和文件大小限制
- 通过环境变量控制上传文件的大小

### 2024-12-17
- 在前端新增一个压缩按钮，用于控制压缩功能，默认状态为开启。

### 2024-12-13
- 通过哈希校验来避免重复上传。
- 调整压缩率为 0.75，同时去除分辨率限制。
- 给删除接口 `/delete-images` 添加了认证检查。

### 2024-11-29
#### 管理页面
- 新增全选和复制功能
- 删除前进行二次确认
- 优化资源加载逻辑
- 禁用视频文件自动播放
#### 首页
- 修复粘贴上传时不显示移除按钮的问题

### 2024-11-21
- 优化上传体验，默认开启压缩，加快文件上传速度

### 2024-11-01
- 修复上传后无法加载的问题

### 2024-10-19
- 修复 webp 无法上传的 BUG
- 优化数据库结构

### 2024-09-29
- 优化缓存功能，采用 Cloudflare Cache API 缓存支持

### 2024-09-25
- 修复 GIF 文件上传的问题
- Telegraph 接口移到了 telegraph 分支，main 分支为 TG_BOT 接口，可以通过直接 fork 仓库部署到 pages

### 2024-09-23
- 修复链接失效的问题，支持视频文件上传

### 2024-09-14
- Telegraph 接口上传的文件有**时效性**，建议使用 TG_BOT 上传

### 2024-09-13
- 支持通过 TG_BOT 上传到频道

### 2024-09-06
> ~~2024 年 9 月 6 日起 telegra.ph 禁止了上传媒体文件，此项目终结。~~

</details>

## 部署

> ⚠️ 虽然项目使用了 Worker 的缓存 API，但仍建议配置好 **边缘 TTL** 并开启 **访客验证**，防止被刷导致扣费。

### 环境变量

在 Cloudflare Workers 中配置以下变量:

| 变量名 | 说明 | 必填 | 示例 |
|--------|------|------|------|
| DOMAIN | 自定义域名 | 是 | example.workers.dev |
| DATABASE | D1 数据库绑定变量名称 | 是 | DATABASE |
| TG_BOT_TOKEN | Telegram Bot Token | 是 | 123456789:ABCdefGHIjklMNOpqrsTUVwxyz |
| TG_CHAT_ID | Telegram 频道/群组 ID | 是 | -100xxxxxxxxxx |
| USERNAME | 管理员用户名 | 是 | admin |
| PASSWORD | 管理员密码 | 是 | password123 |
| ADMIN_PATH | 管理后台路径 | 是 | admin |
| ENABLE_AUTH | 访客验证（`true` 开启，不设置或 `false` 关闭） | 否 | false |
| MAX_SIZE_MB | 单文件最大支持大小（单位：MB，默认 20） | 否 | 20 |

### 绑定说明

- **D1 数据库**：绑定变量名需与 `DATABASE` 环境变量一致

### 数据库结构

需要一张 `media` 表，含两列:

```sql
CREATE TABLE media (
    url TEXT PRIMARY KEY,
    fileId TEXT NOT NULL
);
```

如果已有旧表只有 `url` 一列，执行:

```sql
ALTER TABLE media ADD COLUMN fileId TEXT;
```

### 部署流程

1. 创建 Telegram Bot，保存 Bot Token
2. 创建 Telegram 频道或群组，将 Bot 设为管理员，获取 Chat ID
3. 创建 D1 数据库（建议选择 `亚太地区` 以获得更好速度），并建好 `media` 表
4. 创建 Worker，绑定上述 D1 数据库
5. 配置环境变量
6. 将 `_worker.js` 代码粘贴到 Worker 编辑器中并部署
7. 为 Worker 绑定自定义域名
8. （推荐）为自定义域名配置 Cache Rules，边缘 TTL 设置为 30 天或按需调整

### 上传格式说明

支持的扩展名（服务端白名单，非白名单文件将被拒绝）：

- **图片**：`jpg` `jpeg` `png` `gif` `webp` `bmp` `svg`
- **视频**：`mp4` `avi` `mov` `webm`

> SVG 会以附件形式返回，避免在浏览器中直接执行其中的脚本。
>
> GIF 上传时会改名为 `.jpeg` 并以 `image/jpeg` 类型发送到 Telegram，URL 仍以 `.gif` 结尾（这是为了解决 Telegram 对 GIF 的处理限制，属预期行为）。

### 压缩说明

- 前端压缩默认开启，可点击主页右上角按钮切换
- 压缩仅对图片生效（GIF 除外），压缩后统一转为 JPEG
- 压缩后文件名扩展名会自动改为 `.jpg`，保证内容、文件名和 MIME 一致
- 如不希望压缩影响画质（如透明 PNG 会丢失透明通道），可在首页关闭压缩

### 已知限制

- **视频不支持拖动进度条**：Telegram API 不返回 Range 数据，Worker 无法代理 Range 请求，因此视频只能从头播放。
- **删除只删 D1 记录和 CDN 缓存**：Telegram 端的文件依然存在（Bot 无删除权限），但不会再从本站访问到。
- **首次访问有延迟**：每个 URL 在 CDN 冷启动时需要两次 Telegram API 调用（`getFile` + 下载文件），大约多 0.5~1 秒。命中 CDN 后恢复正常速度。
- **受 Telegram 文件大小限制**：Bot API 下载文件上限为 20MB，请勿将 `MAX_SIZE_MB` 设置超过此值。

## 开源协议

MIT License

## 💰赞助商

- [NodeSupport](https://github.com/NodeSeekDev/NodeSupport)
- [![yxvm_support.png](https://kycloud3.koyoo.cn/20250411e0a01202504111413152588.png)](https://yxvm.com/)
