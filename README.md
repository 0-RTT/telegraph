# 介绍
基于 Cloudflare Worker 和 Pages 的图床，轻松实现无服务器部署！

# 更新日志
## 2024年11月1日
- 修复上传后无法加载的问题

## 2024年10月19日
- 修复webp无法上传的BUG。
- 优化数据库结构。需要对已有数据进行迁移，[点击查看教程](https://github.com/0-RTT/telegraph/releases/tag/v2.0)。

## 2024年9月29日
- 优化缓存功能，采用 Cloudflare 提供的 cache.put() 和 cache.match() 方法进行处理。

## 2024年9月25日
- 修复GIF文件上传的问题，感谢 [nodeseek](https://www.nodeseek.com/) 用户 [ @Libs](https://www.nodeseek.com/space/7214#/general) 提供的思路。
- Telegraph接口移到了telegraph分支，main分支为TG_BOT接口，可以通过直接fork仓库部署到pages。

## 2024年9月23日
- 修复链接失效的问题，支持视频文件上传。

## 2024年9月14日
- Telegraph接口上传的文件有**时效性**，建议使用TG_BOT上传。

## 2024年9月13日
- 支持通过TG_BOT上传到频道。

## 2024年9月12日
- 已修复，可正常上传到telegraph。

## 2024年9月6日
> ~~2024年9月6日起 telegra.ph 禁止了上传媒体文件，此项目终结。~~

# 功能

- 支持访客验证。
- 支持粘贴上传。
- 支持多文件上传。
- 支持查看历史记录。
- 支持图片视频文件上传。
- 支持批量管理后台文件。
- 支持修改后台路径，默认为 /admin。
- 支持在管理界面显示图片上传时间，并按上传时间排序。
- 默认仅代理数据库中的图片链接，在后台删除后链接无法访问。
- 支持URL、BBCode和Markdown格式，点击对应按钮可自动复制相应格式的链接。
- 对于需要自定义用户界面的用户，您可以自行修改代码。在修改时希望您能**保留项目的开源地址**。

# 部署教程
### 变量说明

#### 必填项目：

| 变量名         | 说明                                                                 |
|----------------|----------------------------------------------------------------------|
| `DOMAIN`       | Workers 或 Pages 的自定义域名。                                     |
| `USERNAME`     | 用于身份验证的用户名。                                               |
| `PASSWORD`     | 用于身份验证的密码。                                                 |
| `ADMIN_PATH`   | 管理页面的路径，不需要/。   示例：admin                                                  |
| `TG_BOT_TOKEN` | 通过 @BotFather 获取的 Telegram 机器人令牌。                        |
| `TG_CHAT_ID`   | 填账号的ID机器人就发给你，填频道或者群组的，机器人就发到频道或者群组，最终的文件链接是一样的。 |

⚠️注意:如果填频道的```TG_CHAT_ID```，需要把TG_BOT添加到频道，并且设置为管理员！

使用机器人@VersaToolsBot获取ID，将你和机器人或者频道的消息转发给机器人即可！

在绑定数据库的时候使用
| 变量名    | 说明                                      |
|-----------|-------------------------------------------|
| `DATABASE`| 数据库变量，用于绑定数据库。              |

#### 选填：

| 变量名        | 说明                                      |
|---------------|-------------------------------------------|
| `ENABLE_AUTH` | 设置为 `true` 时启用访客验证，为空或者不设置代表关闭访客验证。 |

### 数据库初始化指令
```
CREATE TABLE media (
    url TEXT PRIMARY KEY,
    fileId TEXT NOT NULL
);
```
### 填写示例：
![image](https://kycloud3.koyoo.cn/202411013c03f202411010959426186.png)

[Pages部署教程](https://github.com/0-RTT/telegraph?tab=readme-ov-file#pages%E9%83%A8%E7%BD%B2%E6%95%99%E7%A8%8B)

[Worker部署教程](https://github.com/0-RTT/telegraph?tab=readme-ov-file#worker%E9%83%A8%E7%BD%B2%E6%95%99%E7%A8%8B)

[nodeseek用户@sdo888编写的教程](https://www.nodeseek.com/post-196832-1)


## Pages部署教程：

#### 1、初始化数据库
![image](https://kycloud3.koyoo.cn/20241007ae0fa202410070917194587.png)  


###### ⚠️⚠️⚠️填入[初始化指令](https://github.com/0-RTT/telegraph#%E6%95%B0%E6%8D%AE%E5%BA%93%E5%88%9D%E5%A7%8B%E5%8C%96%E6%8C%87%E4%BB%A4)

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



## Worker部署教程：
#### 1、初始化数据库
![image](https://kycloud3.koyoo.cn/20241007ae0fa202410070917194587.png)  

###### ⚠️⚠️⚠️填入[初始化指令](https://github.com/0-RTT/telegraph#%E6%95%B0%E6%8D%AE%E5%BA%93%E5%88%9D%E5%A7%8B%E5%8C%96%E6%8C%87%E4%BB%A4)

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
