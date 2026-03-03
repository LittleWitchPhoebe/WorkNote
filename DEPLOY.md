# 待办事项列表 - 部署指南

本文档说明如何将本项目打包为 Docker 镜像，并在 Kubernetes 中创建 Pod 运行。

---

## 一、前置要求

- 已安装 [Docker](https://docs.docker.com/get-docker/)
- **若要用 Kubernetes**：除 `kubectl` 外，还需要一个**真实在运行的集群**（见下方「没有集群怎么办」）。只有 kubectl 没有集群时，Pod 无法调度。
- （若需推送到镜像仓库）已登录镜像仓库，如 Docker Hub 或私有 Registry

### 没有集群怎么办？

- **只想把应用跑起来**：不必用 K8s，用 Docker 即可（见下方「只用 Docker 运行」）。
- **想用 kubectl 练习或部署到 K8s**：需要先有一个集群，任选其一：
  - **minikube**：`brew install minikube && minikube start`，再 `kubectl` 即指向该集群。
  - **kind**：`brew install kind && kind create cluster`，同上。
  - **Docker Desktop**：在设置里打开 “Kubernetes”，等待本地集群就绪。
  - **Colima**：`colima start --with-kubernetes`，会同时提供 Docker 和本地 K8s。

**若报错 `dial tcp ... connect: connection refused` 或连到 `eks.amazonaws.com`**：说明当前 kubectl 连的是远程集群（如 EKS）且不可达。要改用本机 Colima 集群时，先切换上下文：
```bash
kubectl config get-contexts          # 看当前和可用 context
kubectl config use-context colima    # 切换到 Colima（名字可能是 colima 或 colima-admin@colima）
```
然后再执行 `kubectl apply -f k8s/...`。

---

## 二、只用 Docker 运行（不需要集群）

若没有 Kubernetes 集群，只打算用 Docker 跑应用：

```bash
# 在项目根目录
docker build -t todo-list:v1 .
docker run -d -p 8011:80 --name todo-list todo-list:v1
```

浏览器访问 **http://localhost:8011**。停止并删除容器：`docker stop todo-list && docker rm todo-list`。

---

## 三、构建 Docker 镜像（用于 K8s 或推送仓库时）

在项目根目录（与 `Dockerfile` 同级）执行：

```bash
# 构建镜像，-t 指定镜像名与标签
docker build -t todo-list:latest .
```

如需指定镜像仓库地址（便于推送到远程仓库并在 K8s 中拉取），例如：

```bash
# 示例：推送到 Docker Hub
docker build -t your-dockerhub-username/todo-list:latest .

# 示例：推送到私有仓库
docker build -t registry.example.com/your-namespace/todo-list:v1.0 .
```

构建完成后可本地验证（**必须先执行上面的 `docker build`，否则会报错 "pull access denied" 或 "repository does not exist"**）：

```bash
docker run -d -p 8080:80 --name todo-list-test todo-list:latest
# 浏览器访问 http://localhost:8080 查看页面

# 验证完毕后停止并删除容器
docker stop todo-list-test && docker rm todo-list-test
```

---

## 四、推送镜像到仓库（K8s 从仓库拉取时必做）

若 Kubernetes 节点需要从镜像仓库拉取镜像，请先推送。**实际仓库**可以是以下任意一种：

| 类型 | 示例 | 登录命令 | 镜像名格式 |
|------|------|----------|------------|
| **Docker Hub** | 默认公共仓库 | `docker login` | `用户名/todo-list:latest` |
| **GitHub Container Registry (ghcr.io)** | 与 GitHub 集成 | `docker login ghcr.io`（用户名为 GitHub 用户名，密码为 Personal Access Token） | `ghcr.io/你的用户名/todo-list:latest` |
| **Google Container Registry (GCR)** | 需 Google 云账号 | `gcloud auth configure-docker` | `gcr.io/项目ID/todo-list:latest` |
| **Google Artifact Registry** | 新版推荐 | `gcloud auth configure-docker 地区-docker.pkg.dev` | `地区-docker.pkg.dev/项目ID/仓库名/todo-list:latest` |
| **阿里云 ACR** | 国内常用 | `docker login registry.cn-hangzhou.aliyuncs.com` | `registry.cn-hangzhou.aliyuncs.com/命名空间/todo-list:latest` |
| **腾讯云 TCR** | 国内常用 | `docker login ccr.ccs.tencentyun.com` | `ccr.ccs.tencentyun.com/命名空间/todo-list:latest` |
| **华为云 SWR** | 国内常用 | `docker login swr.区域.myhuaweicloud.com` | `swr.区域.myhuaweicloud.com/组织/todo-list:latest` |
| **自建私有仓库** | Harbor、Registry 等 | `docker login registry.example.com` | `registry.example.com/项目或命名空间/todo-list:latest` |

通用步骤示例（把下面地址换成你选的仓库）：

```bash
# 1. 登录对应仓库（按上表选择）
docker login                          # Docker Hub
# docker login ghcr.io                 # GitHub
# docker login registry.cn-hangzhou.aliyuncs.com   # 阿里云

# 2. 构建时打上目标仓库的标签
docker build -t 你的镜像地址:标签 .
# 例如：docker build -t ghcr.io/你的用户名/todo-list:latest .

# 3. 推送
docker push 你的镜像地址:标签
```

#### 推送到 Docker Hub（国内有时比 ghcr.io 好拉）

```bash
docker login
docker tag todo-list:v1 你的DockerHub用户名/todo-list:v1
docker push 你的DockerHub用户名/todo-list:v1
```

然后把 `k8s/pod.yaml` 里 `image` 改为 `你的DockerHub用户名/todo-list:v1`，`imagePullPolicy` 改为 `IfNotPresent`。

#### 推送到阿里云 ACR（国内访问稳定）

1. 在 [阿里云容器镜像服务](https://cr.console.aliyun.com/) 创建命名空间和仓库（或使用默认）。
2. 在 ACR 控制台查看「镜像仓库」→ 对应仓库的「操作」→「推送」说明，会给出登录与推送命令，形如：

```bash
docker login --username=你的阿里云账号 registry.cn-hangzhou.aliyuncs.com
docker tag todo-list:v1 registry.cn-hangzhou.aliyuncs.com/你的命名空间/todo-list:v1
docker push registry.cn-hangzhou.aliyuncs.com/你的命名空间/todo-list:v1
```

3. 把 `k8s/pod.yaml` 里 `image` 改为上面 push 的地址，`imagePullPolicy` 改为 `IfNotPresent`。

若使用本地集群（如 minikube）且不推送镜像，可让 minikube 使用本机镜像，见下文「使用本地镜像（minikube）」部分。

### Colima 从 ghcr.io 拉不到镜像时

Colima 在国内访问 ghcr.io 常超时。可以二选一：

- **方案 A：用本地镜像（不推送到任何仓库）**  
  在 Colima 里构建镜像，Pod 用本地镜像，见下文「七、故障排查」里的「情况 B：本地 K8s 想用本机镜像」；或先执行 `docker context use colima`，再 `docker build -t todo-list:v1 .`，保持 `k8s/pod.yaml` 里 `image: todo-list:v1`、`imagePullPolicy: Never`。

- **方案 B：推送到其它仓库，再改 Pod 的 image**  
  把镜像推到 Docker Hub 或国内仓库（如阿里云 ACR），在 `k8s/pod.yaml` 里把 `containers[].image` 改成新地址，并设 `imagePullPolicy: IfNotPresent`。示例见下方「推送到 Docker Hub / 阿里云 ACR」。

---

## 五、在 Kubernetes 中创建 Pod 与 Service

### 5.1 修改镜像地址

编辑 `k8s/pod.yaml`，将 `image` 改为你实际使用的镜像名（与上面 build/push 的保持一致）：

```yaml
containers:
  - name: todo-list
    image: your-dockerhub-username/todo-list:latest   # 或你的私有仓库地址
    imagePullPolicy: IfNotPresent
```

- 若使用私有仓库，可能需要配置 `imagePullSecrets`（见下文）。
- 若仅在本地 K8s 使用本地镜像，可保持 `image: todo-list:latest` 并设置 `imagePullPolicy: Never`。

### 5.2 创建 Pod

```bash
kubectl apply -f k8s/pod.yaml
```

### 5.3 创建 Service（便于集群内访问及端口转发）

```bash
kubectl apply -f k8s/service.yaml
```

### 5.4 查看运行状态

```bash
# 查看 Pod 是否 Running
kubectl get pods -l app=todo-list

# 查看 Pod 详情与事件（若有异常可先看这里）
kubectl describe pod todo-list

# 查看 Service
kubectl get svc todo-list
```

---

## 六、访问应用

### 方式一：端口转发（适合本地调试）

```bash
kubectl port-forward service/todo-list 8080:80
```

然后在浏览器访问：**http://localhost:8080**

### 方式二：NodePort（集群内/同网段节点访问）

修改 `k8s/service.yaml` 中 `spec.type` 为 `NodePort`，再 apply：

```yaml
spec:
  type: NodePort
  selector:
    app: todo-list
  ports:
    - port: 80
      targetPort: 80
      nodePort: 30080   # 可选：指定节点端口，范围 30000–32767
```

然后通过「任意节点 IP + nodePort」访问，例如：`http://<节点IP>:30080`。

### 方式三：Ingress（生产环境常用）

若集群已安装 Ingress Controller，可再创建 Ingress 资源，将域名或路径转发到 `todo-list` Service 的 80 端口。

---

## 七、故障排查：ImagePullBackOff / Pending

若 `kubectl get pods` 显示 **ImagePullBackOff** 或 **Pending**，说明集群拉不到镜像。先看具体原因：

```bash
kubectl describe pod todo-list
```

在输出末尾 **Events** 里会看到拉取失败原因（如 `unauthorized`、`not found`、`no basic auth credentials` 等）。

**若看到 `dial tcp ... 443: i/o timeout`**：说明集群所在网络访问不到该镜像仓库（例如国内访问 ghcr.io 超时）。应改用**本地镜像**（见下方「情况 B」），或把镜像推到国内仓库（阿里云 ACR 等）再改 Pod 的 `image`。

### 情况 A：镜像在 ghcr.io 且为私有（或需登录才能拉取）

集群需要凭据才能从 ghcr.io 拉取。在**要部署的命名空间**里创建拉取密钥（把 `littlewitchphoebe` 和 PAT 换成你的）：

```bash
# 创建命名空间（若还没有）
kubectl create namespace default   # 或用你的 namespace

# 用 GitHub 用户名 + PAT（需 read:packages 权限）创建 secret
kubectl create secret docker-registry ghcr-secret \
  --docker-server=ghcr.io \
  --docker-username=littlewitchphoebe \
  --docker-password=你的GitHub_PAT \
  --docker-email=你的邮箱@example.com
```

在 `k8s/pod.yaml` 里为 Pod 加上 `imagePullSecrets`（与上面 secret 名一致）：

```yaml
spec:
  imagePullSecrets:
    - name: ghcr-secret
  containers:
    - name: todo-list
      image: ghcr.io/littlewitchphoebe/todo-list:v1
      # ...
```

然后重新创建 Pod：

```bash
kubectl delete pod todo-list
kubectl apply -f k8s/pod.yaml
```

### 情况 B：本地 K8s（Docker Desktop / Colima / minikube）想用本机镜像

若不想从外网拉取，可让集群使用本机已构建好的镜像：

1. **把镜像“放进”集群**（任选其一）：
   - **Docker Desktop / Colima**：镜像已在本地时，部分环境会直接使用本机镜像；若仍拉取失败，可改用下面 minikube 方式或先推送到可拉取的仓库。
   - **minikube**：`eval $(minikube docker-env)` 后在本机执行 `docker build -t todo-list:v1 .`，镜像会进 minikube。
   - **kind**：`kind load docker-image todo-list:v1 --name 你的集群名`

2. **修改 `k8s/pod.yaml`**，使用本地镜像且不拉取：

```yaml
spec:
  containers:
    - name: todo-list
      image: todo-list:v1
      imagePullPolicy: Never
```

3. 再执行：`kubectl delete pod todo-list && kubectl apply -f k8s/pod.yaml`

---

## 八、使用本地镜像（minikube）

若使用 minikube 且不推送镜像，可让 minikube 使用本机刚构建的镜像：

```bash
# 在 minikube 所在环境构建，使镜像进入 minikube 的 Docker 环境
eval $(minikube docker-env)
docker build -t todo-list:latest .
```

`k8s/pod.yaml` 中保持：

```yaml
image: todo-list:latest
imagePullPolicy: Never
```

然后按第四节创建 Pod 和 Service，再通过 `kubectl port-forward` 访问。

---

## 九、使用私有镜像仓库

若镜像在私有仓库，需在创建 Pod 的命名空间下先创建拉取密钥，再在 Pod 中引用：

```bash
# 创建 docker-registry 类型的 Secret
kubectl create secret docker-registry regcred \
  --docker-server=registry.example.com \
  --docker-username=your-username \
  --docker-password=your-password \
  --docker-email=your-email@example.com
```

在 `k8s/pod.yaml` 的 `spec` 下增加 `imagePullSecrets`：

```yaml
spec:
  imagePullSecrets:
    - name: regcred
  containers:
    - name: todo-list
      image: registry.example.com/your-namespace/todo-list:latest
      # ...
```

然后 `kubectl apply -f k8s/pod.yaml` 即可。

---

## 十、常用运维命令

| 操作           | 命令 |
|----------------|------|
| 查看 Pod 状态  | `kubectl get pods -l app=todo-list` |
| 查看 Pod 日志  | `kubectl logs todo-list` |
| 删除 Pod       | `kubectl delete -f k8s/pod.yaml` |
| 删除 Service   | `kubectl delete -f k8s/service.yaml` |
| 删除全部资源   | `kubectl delete -f k8s/` |

---

## 十一、目录与文件说明

```
todo-list/
├── Dockerfile          # Docker 镜像构建文件
├── .dockerignore       # 构建时忽略的文件
├── index.html
├── style.css
├── script.js
├── k8s/
│   ├── pod.yaml        # Kubernetes Pod 定义
│   └── service.yaml    # Kubernetes Service 定义
└── DEPLOY.md           # 本部署指南
```

按上述步骤即可完成从「代码打包 → Docker 镜像 → K8s Pod 运行」的完整流程。
