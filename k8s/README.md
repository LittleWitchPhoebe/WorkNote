# Kubernetes 部署说明

## 前置条件

- 已安装 [kubectl](https://kubernetes.io/docs/tasks/tools/)
- 已安装并启动 [minikube](https://minikube.sigs.k8s.io/docs/start/)
- 镜像已存在于阿里云 ACR：`crpi-tdt2zc9s3n24ef5b.cn-hangzhou.personal.cr.aliyuncs.com/test017/test:latest`

## 若镜像仓库为私有

在部署前创建拉取镜像用的 Secret（将 `<用户名>` 和 `<密码>` 替换为阿里云 ACR 凭证）：

```bash
kubectl create namespace worknote
kubectl create secret docker-registry aliyun-acr-secret \
  --namespace=worknote \
  --docker-server=crpi-tdt2zc9s3n24ef5b.cn-hangzhou.personal.cr.aliyuncs.com \
  --docker-username=<用户名> \
  --docker-password=<密码>
```

然后在 `deployment.yaml` 中取消 `imagePullSecrets` 的注释。

## 部署

```bash
kubectl apply -f namespace.yaml
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml
```

## 访问

- NodePort 方式：`minikube service worknote -n worknote --url` 获取 URL，或在浏览器访问 `http://$(minikube ip):30080`
- 或：`minikube tunnel` 后通过 LoadBalancer（若改用 LoadBalancer 类型）

## 常用命令

```bash
# 查看 Pod
kubectl get pods -n worknote

# 查看 Service
kubectl get svc -n worknote

# 查看日志
kubectl logs -n worknote -l app=worknote -f

# 删除部署
kubectl delete -f k8s/
```
