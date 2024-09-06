# 介绍

基于Cloudflare Workers和Pages的Telegraph图床。

# 功能

- 支持访客验证。
- 支持图片审查。
- 支持多文件上传。
- 支持查看历史记录。
- 支持批量管理后台文件。
- 支持在图床界面粘贴上传。
- 支持上传大于5MB的图片。
- 支持选择图片后会自动上传。
- 支持压缩功能，默认选择图片后自动压缩。
- 支持在管理界面显示图片上传时间，并按上传时间排序。
- 支持修改后台路径为 /admin，可在代码的第二行进行调整。
- 支持JPEG、JPG、PNG、GIF和MP4格式，GIF和MP4的大小需≤5MB。
- 默认仅代理数据库中的图片链接，访问通过其他TG图床上传的链接返回404。
- 支持URL、BBCode和Markdown格式，点击对应按钮可自动复制相应格式的链接。
- 对于需要自定义用户界面的用户，您可以自行修改代码。在修改时希望您能**保留项目的开源地址**。

# 部署教程

## 变量和指令说明
### 变量
必填项目：

| 变量名          | 说明                                                                 |
|-----------------|----------------------------------------------------------------------|
| `DOMAIN`        | Workers 或 Pages的自定义域名。                                                |
| `USERNAME`      | 用于身份验证的用户名。                                         |
| `PASSWORD`      | 用于身份验证的密码。                                       |
| `ADMIN_PATH`    | 管理页面的路径。                                               |

绑定D1数据库的时候使用：

| 变量名          | 说明                                                                 |
|-----------------|----------------------------------------------------------------------|
| `DATABASE`      | 数据库变量，用于绑定数据库。                                         |

选填：

| 变量名          | 说明                                                                 |
|-----------------|----------------------------------------------------------------------|
| `ENABLE_AUTH`   | 设置为 `true` 时启用访客验证，为空或者不设置代表关闭访客验证，此时只有访问管理页需要验证账号密码。  |
| `NSFW_THRESHOLD`| 图片审查的强度，范围为 0 到 1，越接近 1 越审查宽松。                                     |
| `NSFW_API_URL`  | 图片审查 API 的 URL，填写后将启用该功能。示例 API: `https://api.jiasu.in/nsfw` |

### 指令
数据库初始化指令

```sql
CREATE TABLE media (
    key TEXT PRIMARY KEY,
    timestamp INTEGER NOT NULL,
    url TEXT NOT NULL
);
```

## Pages部署教程：
1、
![image](https://kycloud3.koyoo.cn/20240829ab8e7202408291110085598.png)
2、
![image](https://kycloud3.koyoo.cn/20240829dde8f202408291110076344.png)
3、
![image](https://kycloud3.koyoo.cn/2024082999a92202408291110079488.png)
4、
![image](http://kycloud3.koyoo.cn/2024082913106202408291111045980.png)
5、
![image](http://kycloud3.koyoo.cn/20240829426e2202408291111415611.png)
6、
![image](http://kycloud3.koyoo.cn/202408290028f20240829111205448.png)
7、
![image](http://kycloud3.koyoo.cn/20240906d561b202409061706196490.png)
8、
![image](http://kycloud3.koyoo.cn/202409064f8b3202409061708222685.png)
9、
![image](http://kycloud3.koyoo.cn/2024090635c19202409061709225960.png)
10、
![image](http://kycloud3.koyoo.cn/20240906e636520240906171027282.png)
11、
![image](http://kycloud3.koyoo.cn/20240906f0dfe202409061711092668.png)
12、
![image](http://kycloud3.koyoo.cn/2024090667330202409061711516838.png)
13、
![image](http://kycloud3.koyoo.cn/20240906f173a202409061713007969.png)
14、
![image](http://kycloud3.koyoo.cn/20240906ed143202409061715165350.png)
15、
![image](http://kycloud3.koyoo.cn/202409068f76a202409061718122696.png)
16、
![image](http://kycloud3.koyoo.cn/20240906b79a6202409061719043430.png)
17、
![image](http://kycloud3.koyoo.cn/20240906188f8202409061720032928.png)
18、
![image](http://kycloud3.koyoo.cn/202409066761e202409061721281588.png)
19、
![image](http://kycloud3.koyoo.cn/2024090677f2320240906172317323.png)
20、
![image](http://kycloud3.koyoo.cn/202409065c29920240906172451915.png)


## Worker部署教程：
1、
![image](https://kycloud3.koyoo.cn/20240829ab8e7202408291110085598.png)
2、
![image](https://kycloud3.koyoo.cn/20240829dde8f202408291110076344.png)
3、
![image](https://kycloud3.koyoo.cn/2024082999a92202408291110079488.png)
4、
![image](http://kycloud3.koyoo.cn/2024082913106202408291111045980.png)
5、
![image](http://kycloud3.koyoo.cn/20240829426e2202408291111415611.png)
6、
![image](http://kycloud3.koyoo.cn/202408290028f20240829111205448.png)
7、
![image](http://kycloud3.koyoo.cn/202408295c74a202408291112222566.png)
8、
![image](http://kycloud3.koyoo.cn/20240829b4a21202408291118209822.png)
9、
![image](http://kycloud3.koyoo.cn/20240829d5fe4202408291113048235.png)
10、
![image](http://kycloud3.koyoo.cn/20240829f9ecc202408291113197734.png)
11、
![image](http://kycloud3.koyoo.cn/2024082997a84202408291113394516.png)
12、
![image](http://kycloud3.koyoo.cn/202408294223e202408291114234528.png)
13、
![image](http://kycloud3.koyoo.cn/202408294def5202408291113564340.png)
14、
![image](http://kycloud3.koyoo.cn/20240829ee47f202408291114436925.png)
15、
![image](http://kycloud3.koyoo.cn/202409068a32a202409061653566339.png)
16、
![image](http://kycloud3.koyoo.cn/20240829acccf202408291119324308.png)
17、
![image](http://kycloud3.koyoo.cn/202408299f1cf202408291115372291.png)
18、
![image](http://kycloud3.koyoo.cn/2024082995808202408291115555979.png)
19、
![image](http://kycloud3.koyoo.cn/20240829a4d5f202408291117024227.png)
