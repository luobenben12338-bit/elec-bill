# 电费小账本 Electricity Ledger

一个纯前端的电费记账工具，记录电表余额和充值，自动结算用电量和电费开销。单文件 HTML，无需后端，部署到 GitHub Pages 即可在手机和电脑上使用。支持可选的云端同步，通过 GitHub 仓库实现多设备数据共享。

## 功能

- **记一笔**：同时记录电表余额和本次充值，一条记录包含完整信息
- **自动结算**：根据相邻两条记录的余额差和充值金额，自动计算区间用电量、日均用电、电费开销
- **用电统计**：按天/周/月/年自由选择区间，查看日均用电、日均电费、月均电费
- **余额走势图**：可视化余额变化趋势，充值节点以绿色标记
- **账单汇总**：按月或按年回顾电费开销，支持前后翻阅
- **记录管理**：支持搜索、编辑、删除记录，分页浏览
- **云端同步**（可选）：通过 GitHub 仓库存储数据，多设备共享，按记录 ID 合并避免冲突
- **移动端适配**：针对手机屏幕优化布局、字号和触摸交互
- **数据导入导出**：随时备份为 JSON 文件，支持从备份恢复
- **离线可用**：未连接云端时数据存在浏览器本地，联网后自动同步

## 快速开始

1. Fork 或下载本仓库
2. 进入仓库 Settings → Pages
3. Source 选择 `Deploy from a branch`，分支选 `main`，文件夹选 `/ (root)`
4. 保存后等待 1-2 分钟，访问 `https://你的用户名.github.io/仓库名/` 即可使用

无需安装任何依赖，整个应用是一个单文件 `index.html`。

## 云端同步配置

默认情况下，数据只存在浏览器本地（localStorage）。如果需要在多台设备之间共享数据，或希望在手机上访问时数据不丢失，可以开启云端同步。

云端同步通过 GitHub 仓库的 Contents API 实现：数据存为仓库里的 `data.json` 文件，访问令牌就是你的"密码"。首次配置完成后，每次记账会自动同步，无需手动操作。

### 第 1 步：创建数据仓库

建议创建一个**私有仓库**专门存数据，这样数据文件不会被公开访问：

1. GitHub 右上角 `+` → New repository
2. 仓库名随意（如 `elec-data`），**勾选 Private**
3. **勾选 Add a README file**（这一步很重要，会创建初始分支，否则同步会报 404 错误）
4. Create repository

如果你不想新建仓库，也可以直接用 Pages 所在的公开仓库存数据，但 `data.json` 会被公开访问（有令牌才能修改，但任何人都能查看内容）。

### 第 2 步：生成访问令牌

令牌是访问数据的"密码"，需要设置为**细粒度（Fine-grained）令牌**，仅授权目标仓库的内容读写：

1. 打开 https://github.com/settings/tokens?type=beta
2. 点击 Generate new token → Fine-grained
3. **Repository access**：选择 Only select repositories，勾选第 1 步创建的数据仓库
4. **Permissions** → Repository permissions → 找到 `Contents` → 改为 `Read and write`
5. 其他权限全部保持 No access
6. Expiration 建议设为 90 天或更长
7. Generate token，复制令牌（只显示一次）

### 第 3 步：在应用中连接

1. 打开应用页面，点击底部的「云端」按钮
2. 填写以下信息：
   - GitHub 用户名：你的 GitHub 用户名
   - 仓库名：第 1 步创建的仓库名（如 `elec-data`）
   - 分支：默认 `main`（如果仓库默认分支是 `master`，请改为 `master`）
   - 数据文件路径：默认 `data.json`
   - 访问令牌：第 2 步生成的令牌
3. 点击「连接云端」

连接成功后，底部状态会显示绿色「已同步」。之后每次记账会自动推送到云端，在其他设备打开页面时会自动拉取最新数据。

## 数据与隐私

- **本地存储**：数据始终存在浏览器 localStorage 中，即使不开启云端也能正常使用
- **云端存储**：开启后数据以 JSON 文件形式存在 GitHub 仓库，传输使用 HTTPS 加密
- **令牌安全**：令牌存在浏览器 localStorage，建议使用细粒度令牌并仅授权目标仓库的 Contents 权限，设置合理的过期时间
- **多设备同步**：按记录 ID 合并，不会因同步覆盖丢失记录；冲突时自动拉取最新版本重新合并后推送
- **退出云端**：点击「云端」→「退出云端」即可断开连接，本地数据保留不受影响

## 本地开发

整个项目是单文件 `index.html`，包含所有 HTML、CSS 和 JavaScript，没有构建步骤和外部依赖。

```bash
# 克隆仓库
git clone https://github.com/你的用户名/你的仓库名.git

# 本地预览
cd 你的仓库名
python3 -m http.server 8000
# 浏览器访问 http://localhost:8000
```

修改 `index.html` 后刷新浏览器即可看到效果。部署到 GitHub Pages 只需推送代码到 `main` 分支。

## 技术说明

- 纯 HTML/CSS/JavaScript，无框架、无构建工具、无外部依赖
- 数据存储：localStorage（本地）+ GitHub Contents API（云端）
- 图表使用纯 CSS/HTML 绘制，无图表库依赖
- 移动端适配通过 CSS Media Queries 和 touch-action 属性实现
- 云端同步使用防抖推送（1.2 秒延迟）避免频繁请求，冲突时自动重试
- PWA 离线支持：通过 manifest.json + Service Worker 实现，可添加到手机主屏幕，离线可查看历史数据

## PWA 安装

部署后用手机浏览器打开应用，页面底部会显示「📱 安装应用」按钮，点击即可添加到手机主屏幕。安装后以全屏模式运行，体验接近原生应用，离线也能查看历史数据和本地记账。

iOS 用户点击按钮后会提示操作步骤（Safari 分享 → 添加到主屏幕）。已安装的用户不会重复看到安装按钮。

## License

MIT
