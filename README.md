# 介绍

基于Cloudflare Workers和Pages的Telegraph/TG_BOT图床。

# 更新记录

20240913支持通过TG_BOT上传到频道

20240912 已修复，可正常上传到telegraph

~~2024年9月6号起telegra.ph禁止了上传媒体文件，此项目终结。~~

# 部署教程
TG_BOT的部署参考telegraph的，只是需要获取```TG_BOT_TOKEN```和```TG_CHAT_ID```这两个变量,可参考[README.md](https://github.com/0-RTT/telegraph/blob/main/TG_BOT/README.md)

[Pages部署教程](https://github.com/0-RTT/telegraph?tab=readme-ov-file#pages%E9%83%A8%E7%BD%B2%E6%95%99%E7%A8%8B)

[Worker部署教程](https://github.com/0-RTT/telegraph?tab=readme-ov-file#worker%E9%83%A8%E7%BD%B2%E6%95%99%E7%A8%8B)

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
1.  
![image](http://kycloud3.koyoo.cn/202409066a94720240906174103298.png)  

2.  
![image](https://kycloud3.koyoo.cn/20240829ab8e7202408291110085598.png)  

3.  
![image](https://kycloud3.koyoo.cn/20240829dde8f202408291110076344.png)  

4.  
![image](https://kycloud3.koyoo.cn/2024082999a92202408291110079488.png)  

5.  
![image](http://kycloud3.koyoo.cn/2024082913106202408291111045980.png)  

6.  
![image](http://kycloud3.koyoo.cn/20240829426e2202408291111415611.png)  

7.  
![image](http://kycloud3.koyoo.cn/202408290028f20240829111205448.png)  

8.  
![image](http://kycloud3.koyoo.cn/20240906d561b202409061706196490.png)  

9.  
![image](http://kycloud3.koyoo.cn/202409064f8b3202409061708222685.png)  

10.  
![image](http://kycloud3.koyoo.cn/2024090635c19202409061709225960.png)  

11.  
![image](http://kycloud3.koyoo.cn/20240906e636520240906171027282.png)  

12.  
![image](http://kycloud3.koyoo.cn/20240906f0dfe202409061711092668.png)  

13.  
![image](http://kycloud3.koyoo.cn/2024090667330202409061711516838.png)  

14.  
![image](http://kycloud3.koyoo.cn/20240906f173a202409061713007969.png)  

15.  
![image](http://kycloud3.koyoo.cn/20240906ed143202409061715165350.png)  

16.  
![image](http://kycloud3.koyoo.cn/202409068f76a202409061718122696.png)  

17.  
![image](http://kycloud3.koyoo.cn/20240906b79a6202409061719043430.png)  

18.  
![image](http://kycloud3.koyoo.cn/20240906188f8202409061720032928.png)  

19.  
![image](http://kycloud3.koyoo.cn/202409066761e202409061721281588.png)  

20.  
![image](http://kycloud3.koyoo.cn/2024090677f2320240906172317323.png)  

21.  
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
