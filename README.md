⚠️需要网络能够访问telegraph

⚠️图片上传后无法删除

# 特点
图片储存在telegraph

支持上传大于5MB的图片

支持将图片链接保存在本地

# 使用方法
### docker
更新请删除容器重新拉取镜像

```docker pull baipiaoo/telegraph:latest```

```docker run -p 8080:80 -d --restart=always baipiaoo/telegraph```


###### nginx 反代配置
```
    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
```    
### 服务器
安装nginx+php

下载源码，将文件上传到网站目录，访问域名即可！

#### 使用自己的反代域名
修改api/api.php文件第54行为你的反代域名

```$domains = ['img.199881.xyz','img.188000.xyz','pic.dig77.com','pic.51.yt','img.selipoi.top','image.misdazzling.cn'];```

```$domains = ['改为你的反代域名'];```
###### nginx 配置
```
location /file {
            proxy_pass https://telegra.ph/file;
}
```
## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=0-RTT/telegraph&type=Date)](https://star-history.com/#0-RTT/telegraph&Date)
