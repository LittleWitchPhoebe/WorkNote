# WorkNote 部署文档

本文档描述从代码推送到在本地 Minikube 访问的完整流水线。

## 架构概览

```
[本地] git push → [GitHub] → [阿里云 ACR 自动构建镜像] → [本地 Minikube 拉取并运行]
```

- **GitHub**：源码仓库 `https://github.com/LittleWitchPhoebe/WorkNote`
- **阿里云 ACR**：镜像仓库已关联上述 GitHub 仓库，可在控制台配置“代码变更时自动构建”
- **Minikube**：本地 Kubernetes，从 ACR 拉取镜像并部署

## 一、阿里云 ACR 配置（首次）

1. 登录 [阿里云容器镜像服务](https://cr.console.aliyun.com/)
2. 进入你的命名空间 / 仓库：`test017/test`
3. 在仓库中配置 **构建**：
   - 构建上下文路径：`app`（因为 Dockerfile 和 `index.html` 在 `app/` 下）
   - Dockerfile 路径：`Dockerfile`（相对于构建上下文）或 `app/Dockerfile`（相对于仓库根，依控制台选项而定）
   - 构建规则：建议“代码变更时自动构建”，分支可选 `main`
   - 镜像标签：可设为 `latest` 或 `$(git commit id)`
4. 若仓库为**私有**，记下访问凭证（控制台 → 访问凭证）：用于本地 Minikube 拉取镜像时认证

## 二、日常流程

### 1. 推送代码触发构建

```bash
git add .
git commit -m "your message"
git push origin main
```

阿里云会在检测到 GitHub 变更后按构建规则自动构建镜像并推送到当前仓库，标签为你所配置的（如 `latest`）。

### 2. 本地 Minikube 部署

确保 Minikube 已安装并启动：

```bash
minikube start
```

若镜像仓库为**私有**，先创建拉取密钥（替换为你的 ACR 用户名和密码）：

```bash
kubectl create namespace worknote
kubectl create secret docker-registry aliyun-acr-secret \
  --namespace=worknote \
  --docker-server=crpi-tdt2zc9s3n24ef5b.cn-hangzhou.personal.cr.aliyuncs.com \
  --docker-username=aliyun1422332421 \
  --docker-password=<你的ACR密码>
```

并在 `k8s/deployment.yaml` 中取消 `imagePullSecrets` 的注释。

部署应用：

```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
```

### 3. 访问应用

- 获取访问地址：
  ```bash
  minikube service worknote -n worknote --url
  ```
- 或直接使用 NodePort：在浏览器打开 `http://$(minikube ip):30080`（需先 `minikube ip` 查看 IP）

## 三、本地仅验证镜像（不经过 GitHub）

若想在本地先验证镜像能跑，再推 GitHub：

```bash
# 在项目根目录
docker build -t crpi-tdt2zc9s3n24ef5b.cn-hangzhou.personal.cr.aliyuncs.com/test017/test:latest ./app
docker run -p 8080:80 crpi-tdt2zc9s3n24ef5b.cn-hangzhou.personal.cr.aliyuncs.com/test017/test:latest
# 访问 http://localhost:8080
```

如需推送到 ACR：

```bash
docker login --username=aliyun1422332421 crpi-tdt2zc9s3n24ef5b.cn-hangzhou.personal.cr.aliyuncs.com
docker push crpi-tdt2zc9s3n24ef5b.cn-hangzhou.personal.cr.aliyuncs.com/test017/test:latest
```

## 四、故障排查

| 现象 | 可能原因 | 处理 |
|------|----------|------|
| Minikube 拉取镜像失败 | 未配置 imagePullSecrets 或凭证错误 | 按上文创建 secret，并确认 deployment 中 imagePullSecrets 已配置 |
| 阿里云未自动构建 | 未配置构建规则或分支不对 | 在 ACR 控制台检查“构建”规则与分支 |
| 构建失败 | 构建上下文或 Dockerfile 路径错误 | 构建上下文应为 `app`，Dockerfile 相对于上下文为 `Dockerfile` |
| 页面打不开 | Service 未暴露或 Minikube 未启动 | `kubectl get svc -n worknote`，用 `minikube service` 或 NodePort 访问 |

更详细的步骤说明见 **[部署指南-初学者版.md](./部署指南-初学者版.md)**。
