# SciQurio 项目 Docker 部署指南

## 项目结构

- `/frontend`: 前端代码
- `/backend`: 后端代码（FastAPI）
- `/backend/scripts/db_init.py`: 数据库初始化脚本

## 快速部署

### 前提条件

确保已安装以下软件：

- Docker
- Docker Compose

### 部署步骤

1. 克隆项目代码:

```bash
git clone <repository-url>
cd sciqurio
```

2. 执行部署脚本:

```bash
# 赋予脚本执行权限
chmod +x deploy.sh

# 执行部署脚本
./deploy.sh
```

3. 按照提示自定义部署配置，包括：
   - 后端端口（默认：8000）
   - MongoDB 端口（默认：27017）
   - API URL（默认：http://localhost:8000）

4. 等待部署完成。部署成功后，可访问以下服务：
   - 前端界面：http://localhost:3000
   - 后端API：http://localhost:8000
   - MongoDB：localhost:27017

## 手动部署

如果需要手动部署，可以按照以下步骤操作：

1. 修改 `docker-compose.yml` 文件中的配置：
   - 端口映射
   - 数据库连接字符串
   - API URL

2. 构建并启动容器：

```bash
docker-compose build --build-arg API_URL=http://your-api-url:8000
docker-compose up -d
```

## 配置说明

### 前端配置

前端配置位于 `frontend/src/config.js`：

```javascript
export const API_URL = 'http://localhost:8000';
```

通过 Docker 构建参数 `API_URL` 可以在构建时自动替换此配置。

### 后端配置

后端使用环境变量进行配置：

- `MONGO_URI`: MongoDB 连接字符串（默认：mongodb://mongodb:27017）
- `MONGO_DB`: MongoDB 数据库名称（默认：sciqurio_db）
- `HOST`: 后端服务监听地址（默认：0.0.0.0）
- `PORT`: 后端服务端口（默认：8000）

## 故障排除

1. 如果数据库连接失败：
   - 检查 MongoDB 容器是否正常启动: `docker-compose ps`
   - 查看 MongoDB 日志: `docker-compose logs mongodb`

2. 如果后端无法启动：
   - 查看后端日志: `docker-compose logs backend`

3. 如果前端无法连接后端：
   - 确认 API_URL 配置是否正确
   - 检查后端服务是否正常运行

## 停止服务

停止并删除所有容器：

```bash
docker-compose down
```

如需同时删除数据库卷：

```bash
docker-compose down -v
```
