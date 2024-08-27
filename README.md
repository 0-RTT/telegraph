# 介绍

基于 Cloudflare Workers 的 Telegraph 图床，默认开启压缩功能，支持上传大于 5MB 的图片，并提供后台管理等功能。

# 功能

- 支持选择文件自动上传。
- 支持图床界面粘贴上传。
- 支持修改后台路径 `/admin`，可在代码的第二行进行修改。
- 支持图片管理（访问域名 `/admin`），图片支持懒加载。
- 选择图片后自动压缩，节省 Cloudflare 和 Telegraph 的存储，同时加快上传速度。
- 支持 JPEG、JPG、PNG、GIF、MP4 格式，GIF 和 MP4 的大小需 ≤ 5MB。
- 支持 URL、BBCode 和 Markdown 格式，点击对应按钮可自动复制相应格式的链接。

# 使用方法

将代码部署到 Cloudflare Worker，设置自定义域和环境变量（需要设置环境变量并绑定 KV 命名空间）。

具体步骤如下：

1. 点击 **Workers 和 Pages** -> **点击 KV** -> **创建命名空间**，填写命名空间名称（可随意命名） -> **添加**。
2. 点击 **Workers 和 Pages** -> **创建** -> **创建 Worker**（名称可随意命名） -> **部署** -> **编辑代码**。
3. 清除 Worker 原本的代码，然后复制粘贴 [worker.js](https://raw.githubusercontent.com/0-RTT/telegraph/main/worker.js) 中的代码到项目中。
4. 点击 **Workers 和 Pages** -> **点击刚刚创建的 Worker 名称** -> **设置** -> **触发器** -> **添加自定义域**，将代码第一行中的 `example.com` 修改为自定义域。
5. 点击 **Workers 和 Pages** -> **点击刚刚创建的 Worker 名称** -> **设置** -> **变量** -> **添加环境变量**。变量名称分别填 `USERNAME_ENV` 和 `PASSWORD_ENV`，对应的值分别为账号和密码。
6. 点击 **Workers 和 Pages** -> **点击刚刚创建的 Worker 名称** -> **设置** -> **变量** -> **KV 命名空间绑定** -> **编辑变量** -> 变量名称：`imgurl` -> 选择前面设置的 KV 命名空间即可。
