# 阅读目录

从[第 01 章](chapters/01-deliverable-client.md)开始，或按问题进入。24 章均已有首版正文，代码片段、独立实验和待读者执行的练习分别标注；正文完成不代表成品客户端已经实现。

[学习方法](learning-method.md) · [框架路线](frameworks.md) · [实验与运行条件](../examples/README.md) · [毕业项目](capstone.md) · [实际验证范围](../editorial/validation.md)

## 一、程序怎样在 Windows 上运行

- [01 从一个窗口到一个可交付的客户端](chapters/01-deliverable-client.md)
- [02 从源码到一次可重复的运行](chapters/02-build-and-run.md)
- [03 进程、线程、内存和句柄：程序到底占着什么](chapters/03-process-thread-resource.md)
- [04 窗口为什么会“未响应”](chapters/04-window-message-loop.md)

## 二、界面怎样可靠地响应用户

- [05 菜单栏不是一排按钮：命令、状态和输入](chapters/05-commands-and-input.md)
- [06 后台任务：异步、取消、超时和关闭](chapters/06-async-cancellation.md)
- [07 业务逻辑为什么不该都住在窗口里](chapters/07-state-and-testing.md)
- [08 怎样学会一套 UI 框架，并迁移到另一套](chapters/08-learn-ui-frameworks.md)

## 三、模块怎样交给别人使用

- [09 EXE、DLL、LIB、PDB：构建产物怎样连起来](chapters/09-dll-lib-dependencies.md)
- [10 API 和 C ABI：怎样把边界写成契约](chapters/10-api-c-abi.md)
- [11 SDK 怎样才能让别人独立接入](chapters/11-sdk-contract.md)
- [12 插件放在进程内，还是隔离到进程外](chapters/12-plugin-isolation.md)

## 四、程序怎样与数据和系统相处

- [13 配置该放文件还是注册表](chapters/13-files-registry.md)
- [14 SQL 与 SQLite：历史记录怎样可靠落盘](chapters/14-sqlite-transactions.md)
- [15 网络与 IPC：消息发出去之后呢](chapters/15-network-ipc.md)
- [16 标准用户、UAC 和安全边界](chapters/16-permissions-security.md)

## 五、出问题后怎样找到证据

- [17 客户说“打不开”：从环境与日志开始调查](chapters/17-logs-and-environment.md)
- [18 Minidump、PDB 和调用栈：从崩溃现场继续调查](chapters/18-minidump-symbols.md)
- [19 卡顿、死锁、泄漏和慢启动如何区分](chapters/19-performance-hangs.md)
- [20 看不到源码时：二进制检查与逆向辅助维护](chapters/20-binary-analysis.md)

## 六、怎样把版本交到用户手里

- [21 安装和卸载：产品怎样进入、离开用户电脑](chapters/21-install-uninstall.md)
- [22 CI：从源码到可追溯的安装包](chapters/22-ci-artifacts.md)
- [23 升级与兼容：新版本怎样不伤害旧用户](chapters/23-update-compatibility.md)
- [24 AI 时代怎样负责一次工程改动](chapters/24-ai-engineering.md)

目录由 `content/chapters.json` 和章节标题生成。编辑后运行 `npm run docs:index`；`npm test` 会检查目录是否一致。
