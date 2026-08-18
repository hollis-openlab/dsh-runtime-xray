<div align="center">

# dsh-runtime-xray

**让 DeepSeek Harness 把当前运行状态讲清楚。**

[简体中文](README.md) · [English](README.en.md)

![版本](https://img.shields.io/badge/version-0.1.0-4d6bfe?style=flat-square)
![DSH](https://img.shields.io/badge/DeepSeek%20Harness-0.1.0--rc.7-4d6bfe?style=flat-square)
![Node.js](https://img.shields.io/badge/Node.js-%E2%89%A522.19-339933?style=flat-square&logo=node.js&logoColor=white)
![许可](https://img.shields.io/badge/license-MIT-blue?style=flat-square)

</div>

## 它解决什么问题

`dsh-runtime-xray` 是 DeepSeek Harness 的只读运行时检查插件。打开会话里的「透视」页面，可以查看当前真正生效的运行时底座、会话能力、模型输入和生命周期资源。

「轨迹」回答过去发生了什么；「透视」回答现在是什么状态。它不会修改配置、重载插件、执行命令或向模型增加工具。

透视页按一条清晰的运行链组织信息：运行时底座 → Skill / 工具 → 模型上下文。服务属于 Host 内部运行底座，不会被误认为模型输入。

## 主要能力

| 能力 | 你能看到什么 |
| --- | --- |
| 分层导航 | 概览、运行时底座、会话能力和模型输入按运行层级浏览 |
| 当前会话 | 这个会话实际可用的服务、Skill、工具、模型上下文和模型路由 |
| 整个应用 | 所有会话共享的插件、服务与生命周期资源 |
| 作用域继承 | 展示「整个应用 → 预设 → 当前会话」的覆盖顺序 |
| 模型输入 | 统计系统指令段、运行时上下文、变量，并按 Harness、工具、应用、部署、Plan、UI 分组 |
| 插件—服务网络 | 精确所有者关系用实线，来自明确 `ctx.provide` 标签的推断用虚线 |
| 生命周期资源 | 按服务注册、子插件挂载、定时器、监听器和其他资源聚合；展开后查看来源和深度 |
| 服务词典 | 原生 DSH 服务显示用户化名称和中英文作用气泡；未知服务保留原始 key 并使用安全兜底 |
| 证据等级 | 精确、推断、不可用；不会把猜测伪装成事实 |
| 故障隔离 | 一个检查域失败时，其他域仍然可用 |
| 重新读取 | 手动采集一次当前状态；页面关闭时不会后台轮询 |
| 下载诊断文件 | 下载当前画面的脱敏 JSON，不会重新采集 |
| 中英双语 | 跟随 DSH Web 的语言设置实时切换，无需重载插件 |

## 安装

```sh
dsh plugin --profile web add "github:hollis-openlab/dsh-runtime-xray#main"
dsh --profile web
```

重启 Web profile 后，在「对话」和「轨迹」旁边会出现「透视」。卸载时进入「设置 → 插件」，选择 `dsh-runtime-xray` 并移除，然后重启同一 profile。

## 使用

1. 打开一个会话，点击「透视」。
2. 选择「当前会话」，沿着运行时底座、会话能力和模型输入查看当前会话。
3. 打开「Skill」查看有效 Skill 目录；再打开「工具」查看模型可调用动作。
4. 打开「模型上下文」，按数据类型和来源分组检查模型输入。
5. 选择「整个应用」，检查插件—服务网络和聚合后的生命周期资源。
6. 需要确认热更新后的状态时，点击「重新读取」。
7. 需要提交问题证据时，点击「下载诊断文件」下载脱敏 JSON。

## 隐私与权限

插件只读取当前 DSH 进程公开提供的运行时信息，不会连接任何外部服务，也不需要自己的 API Key、环境变量或可写数据目录。

默认快照和诊断文件不会包含：

- 凭据和环境变量值；
- 提示词正文和运行时上下文正文；
- 变量值、审批载荷和工具结果；
- 可调用对象或任意插件配置；
- 原始会话和运行时实体标识。

导出标识会在单个文件内一致地匿名化，文件大小上限为 1 MiB。

## 兼容性

- DeepSeek Harness：`>=0.1.0-rc.7 <0.2.0`
- Node.js：`>=22.19.0` 或 `>=24`
- 已验证 DSH 源码版本：见 [兼容性说明](docs/COMPATIBILITY.md)

当 DSH 的公开接口没有提供服务归属、隔离域或完整提示词段声明时，透视会明确显示为不可用，不会读取私有字段或自行猜测。

## 配置

所有配置都可选，并在插件加载时校验：

```yaml
- name: '@deepseek-ai/dsh-runtime-xray'
  config:
    maxEntitiesPerDomain: 2000
    maxRelationships: 4000
    maxEffectDepth: 32
    deadlineMs: 750
```

## 常见问题

### 看不到「透视」

确认安装完成后重启的是同一个 Web profile。仓库根目录必须包含 `cordis.patch.yml`，安装记录中应出现 `@deepseek-ai/dsh-runtime-xray`。

### 某个域显示“不支持”

当前 DSH 组合没有公开对应的检查接口。这不代表该域为空，也不会影响其他域。

### 会话显示“冷会话”

该会话当前没有活跃 Agent。打开或新建一个实时会话后重新读取；「整个应用」仍然可以正常检查。

### 重新读取失败

页面会保留上一次成功快照并标记为过期。服务恢复后点击重试即可。

## 开发

```sh
pnpm install
pnpm run typecheck
pnpm test
pnpm run build
```

完整验证还包括 Node.js 22.19 / 24.19 兼容矩阵，以及在真实 DSH Web 中通过可见操作检查安装、语言切换、重新读取和导出。

## 安全与许可

项目采用 [MIT License](LICENSE)。安全问题请使用 GitHub 的私密漏洞报告；不要在公开 Issue 中提交凭据、提示词正文或其他敏感数据。详见 [SECURITY.md](SECURITY.md)。
