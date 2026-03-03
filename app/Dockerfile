# 使用轻量级 nginx 镜像
FROM nginx:alpine

# 将静态页面复制到 nginx 默认站点目录
COPY index.html /usr/share/nginx/html/index.html

# 暴露 80 端口（nginx 默认）
EXPOSE 80

# 使用默认 CMD 启动 nginx（无需额外指定）
