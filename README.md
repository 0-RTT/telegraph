# nginx配置
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
# 修改api/api.php文件第54行为你的反代域名
