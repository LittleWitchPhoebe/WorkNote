# 使用官方 nginx 镜像作为基础镜像
FROM nginx:1.25-alpine

# 删除默认的 nginx 静态内容
RUN rm -rf /usr/share/nginx/html/*

# 将项目静态文件复制到 nginx 默认站点目录
COPY index.html style.css script.js /usr/share/nginx/html/

# 暴露 80 端口
EXPOSE 80

# nginx 镜像默认已包含 CMD 启动 nginx，无需额外指定
