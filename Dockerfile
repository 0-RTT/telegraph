FROM php:8.0-apache

# 安装必要的库
RUN apt-get update && \
    apt-get install -y libpng-dev libjpeg-dev libfreetype6-dev && \
    docker-php-ext-configure gd --with-freetype --with-jpeg && \
    docker-php-ext-install gd

# 启用Apache重写模块
RUN a2enmod rewrite

# 调整PHP配置
RUN echo "upload_max_filesize = 50M" >> $PHP_INI_DIR/conf.d/uploads.ini && \
    echo "post_max_size = 50M" >> $PHP_INI_DIR/conf.d/uploads.ini && \
    echo "max_execution_time = 600" >> $PHP_INI_DIR/conf.d/uploads.ini && \
    echo "memory_limit = 512M" >> $PHP_INI_DIR/conf.d/uploads.ini

# 复制你的PHP代码到容器内的Apache网站根目录下
COPY . /var/www/html/

# 设置工作目录
WORKDIR /var/www/html

EXPOSE 80
