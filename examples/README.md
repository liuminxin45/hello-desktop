# 实验与运行条件

这里提供三个独立实验：目录统计、C ABI、SQLite 事务。它们支持正文中的局部机制学习，不是包含 UI、插件宿主、安装器和自动更新的完整工作台。

主线中的 WPF、Qt、Electron、安装和 dump 操作另有手动练习。除[验证记录](../editorial/validation.md)列出的项目外，不标记为已运行。

## 环境

| 实验 | 需要什么 | 本次实际验证 |
| --- | --- | --- |
| 文档检查与 SQLite | Node.js 24.19.x，使用内置 `node:sqlite` | Node 24.19.0、SQLite 3.53.3 |
| 托管扫描器与 CLI | .NET 10 SDK，只有 Runtime 不够 | SDK 10.0.403，Windows x64 |
| 原生库与 probe | CMake 3.20+，C11 编译器；Windows 示例命令使用 VS 2022 C++ 工具链 | CMake 3.23.1、MSVC 19.44.35222、Windows SDK 10.0.26100.0 |

仓库 `global.json` 允许 .NET 10 的稳定 SDK 按 `latestFeature` 策略向前选择，实际版本仍应记录。GitHub 工作流会另行记录 runner 的版本，不假定其与本机完全相同。

不需要 npm 第三方包、NuGet 第三方包、模型 API 或账号凭据。SDK、CMake、编译器仍需预先安装；不把它们混入源码提交。

## 课程与 SQL 检查

从仓库根目录执行：

```powershell
npm test
```

它检查章节与导航、本地链接、代码围栏及文本格式，然后执行 SQLite 实验。也可分别执行：

```powershell
npm run docs:check
node examples/sqlite/transactions.mjs
npm run check:links
```

外链检查需要联网，仅验证可访问性，不证明技术结论正确。在 Windows 上，Node HTTP 失败时会用系统 PowerShell HTTP 再核实，以适应已有系统网络配置；不会修改代理或其他网络设置。SQLite 实验在 `.cache/sqlite` 下使用独立数据库，结束后关闭连接并删除该次实验的数据库文件；不接触现有用户数据库。

实验覆盖参数绑定、事务回滚、写入冲突和迁移。它没有模拟断电、文件系统故障或实际安装升级。

## 托管扫描器

```powershell
dotnet run --project examples/managed/Workbench.Checks -c Release
dotnet run --project examples/managed/Workbench.Cli -c Release -- scan docs
```

扫描使用同步文件系统 API，返回完整统计或报错；跳过重解析点，根目录本身若是重解析点则拒绝。目录在过程中发生变化会影响结果，不提供文件系统快照或恶意目录隔离保证。

CLI 用 Ctrl+C 发出协作取消。检查点之间正在进行的系统操作未必立即停止，因此没有固定取消延迟保证。WPF 调用时应另行安排调度、进度与关闭；CLI 不证明 UI 生命周期安全。

检查程序在新建的命名临时目录里使用固定小文件，验证空目录、嵌套与中文路径、无效输入、预取消和扫描后文件可独占打开。递归清理前核对临时目录的绝对位置和命名前缀。

## 原生 C ABI

安装 Visual Studio 2022 的 C++ 桌面构建工具及 Windows SDK 后执行：

```powershell
cmake -S examples/native -B .cache/native -A x64
cmake --build .cache/native --config Release
ctest --test-dir .cache/native -C Release --output-on-failure
dotnet run --project examples/managed/Workbench.Cli -c Release -- native .cache/native/Release/workbench_native.dll
```

示例路径以 CMake 的 Visual Studio 多配置生成器为条件。其他生成器的路径与架构参数可能不同；本书没有验证所有组合。

原生 probe 包含五项检查：版本、三字节求和、零长度、非零长度空输入、空输出。托管调用方进一步检查版本、258 的预期结果与空输入。完整接口约束见[头文件](native/workbench.h)。

加载库会执行原生代码，`native` 命令只用于自己构建且信任的教学库，不是通用安全插件加载器。Windows x64 之外的架构和 ABI 组合需要另行验证。

## 可选故障采集

`workbench_probe.exe --crash` 会主动产生一个 Windows 教学异常，只能在可丢弃的教学环境使用。[第 18 章](../docs/chapters/18-minidump-symbols.md)说明如何用 ProcDump 启动它、采集并用 WinDbg 调查。

正常检查与 CI 都不会传入 `--crash`，不会修改 WER 注册表，也不会故意崩溃正常业务进程。采集练习需要独立记录工具版本、二进制、符号与结果。

## 产物不等于安装器

GitHub Actions 归档的是框架依赖的教学 CLI、原生实验与符号。运行 CLI 仍需兼容的 .NET 10 Runtime；若要本地构建则需要 SDK。这些材料没有产品签名、正式安装器或更新服务。

阅读[验证记录](../editorial/validation.md)确认哪些环节实际执行过，再按[毕业项目](../docs/capstone.md)扩展成自己的可交付客户端。
