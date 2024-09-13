# 介绍

基于Cloudflare Workers和Pages的图床程序。

# 更新记录

20240913支持通过TG_BOT上传到频道

20240912 已修复，可正常上传到telegraph

~~2024年9月6号起telegra.ph禁止了上传媒体文件，此项目终结。~~
# TG_BOT和Telegraph文件夹的区别

使用TG_BOT上传，请使用TG_BOT文件夹下的_worker.js。

使用telegraph接口上传，请使用Telegraph文件夹下的_worker.js。

# 部署教程
TG_BOT的部署参考telegraph的，需要额外获取```TG_BOT_TOKEN```和```TG_CHAT_ID```这两个变量,可参考[README.md](https://github.com/0-RTT/telegraph/blob/main/TG_BOT/README.md)。

[Pages部署教程](https://github.com/0-RTT/telegraph?tab=readme-ov-file#pages%E9%83%A8%E7%BD%B2%E6%95%99%E7%A8%8B)

[Worker部署教程](https://github.com/0-RTT/telegraph?tab=readme-ov-file#worker%E9%83%A8%E7%BD%B2%E6%95%99%E7%A8%8B)


## Pages部署教程：

1.  第一步这里也可以下载_worker.js文件，打包成zip上传到pages。
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
