# Telegraph 图床

基于 Cloudflare Workers 和 Pages 的图床服务。

## 功能特点

- 一键复制链接
- 本地上传历史记录
- 可选的访客验证功能
- 单文件最大支持 20MB
- 支持多文件上传和粘贴上传
- 支持批量操作和显示上传时间
- 图片自动压缩（GIF和视频除外）
- Cloudflare Cache API 缓存支持
- 基于 Telegram Bot API 的文件存储
- 支持多种链接格式（URL、BBCode、Markdown）
- 支持常见的图片和视频格式（jpg、png、gif、mp4）

## 更新日志

> **最近更新**: 2024-12-4
> - 修复粘贴上传时，重复上传图片的问题

<details>
<summary>历史更新记录</summary>

### 2024-12-4
- 修复粘贴上传时，重复上传图片的问题

### 2024-11-29
#### 管理页面
- 新增全选和复制功能
- 删除前进行二次确认
- 优化资源加载逻辑
- 禁用视频文件自动播放
#### 首页
- 修复粘贴上传时不显示移除按钮的问题

### 2024-11-21日
- 优化上传体验，默认开启压缩，加快文件上传速度
  - 如需关闭，请将代码的238行修改为```enableCompression: false```

### 2024-11-01
- 修复上传后无法加载的问题

### 2024-10-19
- 修复webp无法上传的BUG
- 优化数据库结构，[查看迁移教程](https://github.com/0-RTT/telegraph/releases/tag/v2.0)

### 2024-09-29
- 优化缓存功能，采用 Cloudflare Cache API 缓存支持

### 2024-09-25
- 修复GIF文件上传的问题，感谢 [nodeseek](https://www.nodeseek.com/) 用户 [@Libs](https://www.nodeseek.com/space/7214#/general) 提供的思路
- Telegraph接口移到了telegraph分支，main分支为TG_BOT接口，可以通过直接fork仓库部署到pages

### 2024-09-23
- 修复链接失效的问题，支持视频文件上传

### 2024-09-14
- Telegraph接口上传的文件有**时效性**，建议使用TG_BOT上传

### 2024-09-13
- 支持通过TG_BOT上传到频道

### 2024-09-12
- 已修复，可正常上传到telegraph

### 2024-09-06
> ~~2024年9月6日起 telegra.ph 禁止了上传媒体文件，此项目终结。~~

</details>

## 部署步骤

### 1. 环境变量说明
需要在 Cloudflare Workers 中配置以下环境变量:

| 变量名 | 说明 | 必填 | 示例 |
|--------|------|------|------|
| DOMAIN | 自定义域名 | 是 | example.workers.dev |
| DATABASE | D1 数据库绑定变量名称 | 是 | DATABASE |
| TG_BOT_TOKEN | Telegram Bot Token | 是 | 123456789:ABCdefGHIjklMNOpqrsTUVwxyz |
| TG_CHAT_ID | Telegram 频道/群组 ID | 是 | -100xxxxxxxxxx |
| USERNAME | 管理员用户名 | 是 | admin |
| PASSWORD | 管理员密码 | 是 | password123 |
| ADMIN_PATH | 管理后台路径 | 是 | admin |
| ENABLE_AUTH | 访客验证（设置为 true 开启，不设置或设置为 false 则关闭） | 否 | false |

### 2. 创建 Telegram Bot
1. 在 Telegram 中找到 [@BotFather](https://t.me/BotFather)
2. 发送 `/newbot` 命令创建新机器人
3. 按照提示设置机器人名和用户名
4. 保存获得的 Bot Token (格式为`123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)
   - 这个 Token 将用作环境变量 `TG_BOT_TOKEN`

### 3. 创建 Telegram 频道或群组
1. 创建一个新的频道或群组
2. 将你的 Bot 添加为管理员
3. 获取频道/群组 ID：
   - 发送频道内的任意消息给 [@getidsbot](https://t.me/getidsbot)
   - 在 Origin chat 下找到对应的 ID (格式为 `-100xxxxxxxxxx`)
   - 这个 ID 将用作环境变量 `TG_CHAT_ID`

### 4. 创建 D1 数据库
1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 进入 `Workers & Pages` → `D1 SQL 数据库`
3. 点击 `创建` 创建数据库
   - 数据库名称可自定义，例如`images`
   - 建议选择数据库位置为 `亚太地区`，可以获得更好的访问速度
4. 创建数据表:
   - 点击数据库名称进入详情页
   - 选择 `控制台` 标签
   - 执行下 SQL 语句:
```sql
CREATE TABLE media (
    url TEXT PRIMARY KEY,
    fileId TEXT NOT NULL
);
```

### 5. 创建 Worker
1. 进入 `Workers & Pages`
2. 点击 `创建`
3. 选择 `创建 Worker`
4. 为 Worker 设置一个名称
5. 点击 `部署` 创建 Worker
6. 点击继续处理项目

### 6. 配置环境变量
1. 在 Worker 的 `设置` → `变量和机密` 中
2. 点击 `添加` 添加变量
3. 点击 `部署`

### 7. 绑定数据库
1. 在 Worker 设置页面找到 `设置` → `绑定`
2. 点击 `添加`
3. 选择 `D1数据库`
4. 设置变量名为 `DATABASE`
5. 选择之前创建的数据库
6. 点击 `部署`

### 8. 绑定域名
1. 在 Worker 的 `设置` → `域和路由`
2. 点击 `添加` → `自定义域`
3. 输入你在Cloudflare绑定的域名
4. 点击 `添加域`
5. 等待域名生效

### 9. 部署代码
1. 进入 Worker 的编辑页面
2. 将 `_worker.js` 的完整代码复制粘贴到编辑器中
3. 点击 `部署`

## 部署步骤参考：

> ⚠️ 以下图片里的仅供参考，Cloudflare 面板可能会更新，具体操作请以上方文字教程为准。

> 💡另外可以参考 nodeseek用户@sdo888的[图文教程](https://www.nodeseek.com/post-196832-1)

### Worker 部署示例

#### 1、初始化数据库
![image](https://kycloud3.koyoo.cn/20241007ae0fa202410070917194587.png)  

![image](https://kycloud3.koyoo.cn/202410074b824202410070851275140.png)  
 
![image](https://kycloud3.koyoo.cn/20241007917fa202410070852019143.png)  
 
![image](https://kycloud3.koyoo.cn/20240829426e2202408291111415611.png)  

![image](https://kycloud3.koyoo.cn/202408290028f20240829111205448.png)  

#### 2、创建worker
![image](https://kycloud3.koyoo.cn/202408295c74a202408291112222566.png)

![image](https://kycloud3.koyoo.cn/20240829b4a21202408291118209822.png)

#### 3、设置自定义域名
![image](https://kycloud3.koyoo.cn/20240829d5fe4202408291113048235.png)

![image](https://kycloud3.koyoo.cn/20240829f9ecc202408291113197734.png)

![image](https://kycloud3.koyoo.cn/2024082997a84202408291113394516.png)

![image](https://kycloud3.koyoo.cn/202408294223e202408291114234528.png)

![image](https://kycloud3.koyoo.cn/202408294def5202408291113564340.png)

#### 4、设置变量
![image](https://kycloud3.koyoo.cn/2024092389dc0202409232021524424.png) 

#### 5、将_worker.js中的代码复制粘贴到编辑器中
![image](https://kycloud3.koyoo.cn/202408299f1cf202408291115372291.png)

![image](https://kycloud3.koyoo.cn/2024082995808202408291115555979.png)

#### 6、点击部署即可
![image](https://kycloud3.koyoo.cn/20240829a4d5f202408291117024227.png)

## Pages部署教程：

#### 1、初始化数据库
![image](https://kycloud3.koyoo.cn/20241007ae0fa202410070917194587.png)  

![image](https://kycloud3.koyoo.cn/202410074b824202410070851275140.png)  
 
![image](https://kycloud3.koyoo.cn/20241007917fa202410070852019143.png)  
 
![image](https://kycloud3.koyoo.cn/20240829426e2202408291111415611.png)  

![image](https://kycloud3.koyoo.cn/202408290028f20240829111205448.png)  

#### 2、部署到pages

![image](https://kycloud3.koyoo.cn/20241007f786a202410070857578208.png)

- 2.1 下载_worker.js，打包成zip上传到pages

![image](https://kycloud3.koyoo.cn/2024100790232202410070900405992.png)

- 2.2 通过fork本仓库部署到pages
![image](https://kycloud3.koyoo.cn/20241007d7bf6202410070902287155.png)
![image](https://kycloud3.koyoo.cn/20241007a4b2f202410070902288891.png)

#### 3、设置变量
![image](https://kycloud3.koyoo.cn/2024092389dc0202409232021524424.png) 

#### 4、设置自定义域名。
![image](https://kycloud3.koyoo.cn/202409068f76a202409061718122696.png)  

![image](https://kycloud3.koyoo.cn/20240906b79a6202409061719043430.png)  

![image](https://kycloud3.koyoo.cn/20240906188f8202409061720032928.png)  

#### 5、重新部署生效刚刚配置的自定义域名和变量

![image](https://kycloud3.koyoo.cn/202409066761e202409061721281588.png)  

![image](https://kycloud3.koyoo.cn/2024090677f2320240906172317323.png)  

![image](https://kycloud3.koyoo.cn/202409065c29920240906172451915.png)  

## 开源协议

MIT License

## 鸣谢

- [Cloudflare](https://www.cloudflare.com/)
- [Telegram](https://telegram.org/)
