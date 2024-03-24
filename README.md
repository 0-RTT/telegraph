# 使用方法

⚠️需要网络能够访问telegraph

### docker
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

将文件上传到网站目录，访问域名即可！

[点击下载代码](https://mirror.ghproxy.com/github.com/0-RTT/telegraph/archive/refs/tags/v1.0.zip)

#### 使用自己的反代域名
修改api/api.php文件第54行为你的反代域名

###### nginx 配置
```
location /upload {
            add_header Access-Control-Allow-Origin *;
            add_header Access-Control-Allow-Methods 'GET, POST, OPTIONS';
            add_header Access-Control-Allow-Headers 'DNT,X-Mx-ReqToken,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Authorization';
            if ($request_method = 'OPTIONS') {
                return 204;}
            proxy_pass https://telegra.ph/upload;
}
location /file {
            proxy_pass https://telegra.ph/file;
}
```
## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=0-RTT/telegraph&type=Date)](https://star-history.com/#0-RTT/telegraph&Date)
