FROM php:8.0-apache

# ��װ��Ҫ�Ŀ�
RUN apt-get update && \
    apt-get install -y libpng-dev libjpeg-dev libfreetype6-dev && \
    docker-php-ext-configure gd --with-freetype --with-jpeg && \
    docker-php-ext-install gd

# ����Apache��дģ��
RUN a2enmod rewrite

# ����PHP����
RUN echo "upload_max_filesize = 50M" >> $PHP_INI_DIR/conf.d/uploads.ini && \
    echo "post_max_size = 50M" >> $PHP_INI_DIR/conf.d/uploads.ini && \
    echo "max_execution_time = 600" >> $PHP_INI_DIR/conf.d/uploads.ini && \
    echo "memory_limit = 512M" >> $PHP_INI_DIR/conf.d/uploads.ini

# �������PHP���뵽�����ڵ�Apache��վ��Ŀ¼��
COPY . /var/www/html/

# ���ù���Ŀ¼
WORKDIR /var/www/html

EXPOSE 80
