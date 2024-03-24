# 使用方法

⚠️需要网络能够访问telegraph

## docker
```docker run -p 8080:80 -d --restart=always baipiaoo/telegraph```

##### nginx 反代配置
```
    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
```    
## 服务器
安装nginx+php

将文件上传到网站目录，访问域名即可！

[点击下载代码](https://mirror.ghproxy.com/github.com/0-RTT/telegraph/archive/refs/tags/v1.0.zip)

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=0-RTT/telegraph&type=Date)](https://star-history.com/#0-RTT/telegraph&Date)
