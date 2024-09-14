# 介绍

基于Cloudflare Workers和Pages的图床程序。

# 日志
20240914 Telegraph接口上传的文件有**时效性**，建议使用TG_BOT上传

20240913 支持通过TG_BOT上传到频道

20240912 已修复，可正常上传到telegraph

~~2024年9月6号起telegra.ph禁止了上传媒体文件，此项目终结。~~

# 部署教程
TG_BOT的部署参考telegraph的，需要额外获取```TG_BOT_TOKEN```和```TG_CHAT_ID```这两个变量,可参考[README.md](https://github.com/0-RTT/telegraph/blob/main/TG_BOT/README.md)。

[Pages部署教程](https://github.com/0-RTT/telegraph?tab=readme-ov-file#pages%E9%83%A8%E7%BD%B2%E6%95%99%E7%A8%8B)

[Worker部署教程](https://github.com/0-RTT/telegraph?tab=readme-ov-file#worker%E9%83%A8%E7%BD%B2%E6%95%99%E7%A8%8B)


## Pages部署教程：

#### 1、初始化数据库
![image](https://kycloud3.koyoo.cn/20240829ab8e7202408291110085598.png)  

 
![image](https://kycloud3.koyoo.cn/20240829dde8f202408291110076344.png)  

###### ⚠️⚠️⚠️TG_BOT和Telegraph的初始化指令不一样，注意不要弄错。

![image](https://kycloud3.koyoo.cn/2024082999a92202408291110079488.png)  

 
![image](http://kycloud3.koyoo.cn/2024082913106202408291111045980.png)  

 
![image](http://kycloud3.koyoo.cn/20240829426e2202408291111415611.png)  


![image](http://kycloud3.koyoo.cn/202408290028f20240829111205448.png)  

#### 2、下载对应文件夹下的_worker.js，打包成zip部署到pages

![image](http://kycloud3.koyoo.cn/20240906d561b202409061706196490.png)  


![image](http://kycloud3.koyoo.cn/2024090635c19202409061709225960.png)  

 
![image](http://kycloud3.koyoo.cn/20240906e636520240906171027282.png)  

#### 3、设置变量

![image](http://kycloud3.koyoo.cn/20240906f0dfe202409061711092668.png)  


![image](http://kycloud3.koyoo.cn/2024090667330202409061711516838.png)  


![image](http://kycloud3.koyoo.cn/20240906f173a202409061713007969.png)  

 
![image](http://kycloud3.koyoo.cn/20240906ed143202409061715165350.png)  

#### 4、设置自定义域名，不设置则使用pages默认域名
![image](http://kycloud3.koyoo.cn/202409068f76a202409061718122696.png)  


![image](http://kycloud3.koyoo.cn/20240906b79a6202409061719043430.png)  


![image](http://kycloud3.koyoo.cn/20240906188f8202409061720032928.png)  

#### 5、重新部署生效刚刚配置的自定义域名和变量

![image](http://kycloud3.koyoo.cn/202409066761e202409061721281588.png)  

 
![image](http://kycloud3.koyoo.cn/2024090677f2320240906172317323.png)  

 
![image](http://kycloud3.koyoo.cn/202409065c29920240906172451915.png)  



## Worker部署教程：
#### 1、初始化数据库
![image](https://kycloud3.koyoo.cn/20240829ab8e7202408291110085598.png)

![image](https://kycloud3.koyoo.cn/20240829dde8f202408291110076344.png)

##### ⚠️⚠️⚠️TG_BOT和Telegraph的初始化指令不一样，注意不要弄错。

![image](https://kycloud3.koyoo.cn/2024082999a92202408291110079488.png)

![image](http://kycloud3.koyoo.cn/2024082913106202408291111045980.png)

![image](http://kycloud3.koyoo.cn/20240829426e2202408291111415611.png)

![image](http://kycloud3.koyoo.cn/202408290028f20240829111205448.png)

#### 2、创建worker
![image](http://kycloud3.koyoo.cn/202408295c74a202408291112222566.png)

![image](http://kycloud3.koyoo.cn/20240829b4a21202408291118209822.png)

#### 3、设置自定义域名
![image](http://kycloud3.koyoo.cn/20240829d5fe4202408291113048235.png)

![image](http://kycloud3.koyoo.cn/20240829f9ecc202408291113197734.png)

![image](http://kycloud3.koyoo.cn/2024082997a84202408291113394516.png)

![image](http://kycloud3.koyoo.cn/202408294223e202408291114234528.png)

![image](http://kycloud3.koyoo.cn/202408294def5202408291113564340.png)

#### 4、设置变量
![image](http://kycloud3.koyoo.cn/20240829ee47f202408291114436925.png)

![image](http://kycloud3.koyoo.cn/202409068a32a202409061653566339.png)

![image](http://kycloud3.koyoo.cn/20240829acccf202408291119324308.png)

#### 5、将_worker.js中的代码复制粘贴到编辑器中
![image](http://kycloud3.koyoo.cn/202408299f1cf202408291115372291.png)

![image](http://kycloud3.koyoo.cn/2024082995808202408291115555979.png)

#### 6、点击部署即可
![image](http://kycloud3.koyoo.cn/20240829a4d5f202408291117024227.png)
