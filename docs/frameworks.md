# 各框架怎样学

这里是与[第 08 章](chapters/08-learn-ui-frameworks.md)配套的选学指南，提供学习任务和核对入口，不是已经完成的框架评测；不预设性能、包体积或开发效率排名。各路线的实际运行状态见[验证记录](../editorial/validation.md)。

## 先把语言、框架和系统机制分开

C#、C++、JavaScript/TypeScript 是语言路线；WPF、WinForms、WinUI、Qt、Electron 各自提供不同的 UI 和应用能力。Windows 的进程、权限、文件和交付机制仍然需要理解，但框架会改变调用方式与部分边界。

主案例采用 C# / .NET / WPF 解释界面机制。WPF 官方说明它运行在 Windows 上；本教程用它承载 Windows 主线，不据此推断跨平台能力。Microsoft 当前的新 Windows 应用入口推荐 WinUI，因此 WinUI 需要进入比较范围；主案例选 WPF 是教学取舍，不等同于微软的选型推荐。

来源：[WPF 概览](https://learn.microsoft.com/en-us/dotnet/desktop/wpf/overview/)、[Windows 应用开发入口](https://learn.microsoft.com/en-us/windows/apps/)。具体 API、版本要求和部署组合在编写示例时重新核对。

## 每套框架都走同一个小闭环

1. 从官方最小示例开始，固定环境，理解程序入口、窗口创建和退出。
2. 做出“任务列表 + 开始/取消 + 错误反馈”，跟踪状态怎样传到界面。
3. 加入后台工作，验证取消、异常和关闭期间的线程或进程边界。
4. 接入一个系统能力和一个数据能力，例如文件对话框与 SQLite。
5. 在干净环境打包运行，记录运行时、原生依赖和失败诊断方式。
6. 对一次需求变化作出修改，解释生命周期、资源归属和测试边界。

先完成一个小闭环，再按问题阅读布局、绘制、对象系统和扩展机制。控件列表和 API 索引用于查阅，不承担学习主线。

## 路线 A：C# / .NET / WPF

- 前置：C# 类型与接口、异常、委托/事件、泛型、异步基础；认识托管内存与系统资源的差别。
- 顺序：Application/Window → XAML 与布局 → 绑定与命令 → ViewModel 与状态 → Dispatcher 与异步 → 模板/资源 → 原生互操作 → 发布。
- 重点实验：取消期间关闭窗口、绑定错误、订阅造成的生命周期问题、DPI 与键盘操作、P/Invoke 所有权。
- 交付判断：业务逻辑能脱离窗口验证；后台任务有明确退出路径；安装环境中的运行时条件清楚。
- 官方入口：[WPF 文档](https://learn.microsoft.com/en-us/dotnet/desktop/wpf/)、[.NET 原生互操作](https://learn.microsoft.com/en-us/dotnet/standard/native-interop/)。

## 路线 B：C++ / Qt

- 前置：C++ 生命周期、RAII、指针与引用、构建和链接；先选 Widgets 或 Quick/QML，不同时铺开两条控件体系。
- 顺序：最小应用 → QObject 与对象归属 → 信号槽 → 布局或 QML → Model/View → 事件循环与线程归属 → 原生模块 → Windows 部署。
- 重点实验：对象创建/销毁所在的线程、排队回调、任务退出、资源打包、插件和间接 DLL 依赖。
- 交付判断：解释 QObject 的归属、线程和回调生命周期；部署机器可加载所需依赖；对所用模块核对许可与分发条件。
- 官方入口：[Qt 文档](https://doc.qt.io/qt-6/)、[QObject 与线程](https://doc.qt.io/qt-6/threads-qobject.html)、[Windows 部署](https://doc.qt.io/qt-6/windows-deployment.html)。

Qt 的对象线程归属与事件循环有自己的约束，不能把“槽函数”和“自动在后台运行”画等号。

## 路线 C：TypeScript / Electron

- 前置：JavaScript/TypeScript、HTML/CSS、异步与事件循环、Node.js 基础；先理解边界，再选择前端 UI 库。
- 顺序：应用启动与 BrowserWindow → main/renderer/preload → IPC 契约 → 状态与取消 → 本地能力与权限 → 原生依赖 → 打包更新与诊断。
- 重点实验：renderer 退出、任务阻塞主进程、窗口关闭但后台工作存活、不可信内容调用本地接口、原生模块版本/架构不匹配。
- 交付判断：明确谁拥有文件、任务和凭据；IPC 接口范围可审查；安装后的进程、原生依赖和更新路径可解释。
- 官方入口：[进程模型](https://www.electronjs.org/docs/latest/tutorial/process-model)、[IPC](https://www.electronjs.org/docs/latest/tutorial/ipc)、[安全](https://www.electronjs.org/docs/latest/tutorial/security)、[分发](https://www.electronjs.org/docs/latest/tutorial/application-distribution)。

Electron 使用多进程架构；不能用单一 UI 线程图代替它的完整运行关系。原生 C ABI 不能假定从 renderer 直接调用，需要明确适配层及其进程边界。

## 路线 D：C# 或 C++ / WinUI 与 Windows App SDK

- 前置：一门对应语言、Windows 应用生命周期的基础；C++ 路线另补 C++/WinRT。
- 顺序：官方最小项目 → XAML/控件 → 状态与调度 → Windows 能力互操作 → 包身份与运行时依赖 → 打包与非打包部署条件。
- 重点实验：标准用户部署、干净机器的依赖、窗口与系统能力交互、不同部署方案的差别。
- 交付判断：能说清项目用到的能力、目标系统条件和实际部署方式；不把 WinUI、Windows App SDK 与 MSIX 当作同一个东西。
- 官方入口：[Windows App SDK](https://learn.microsoft.com/en-us/windows/apps/windows-app-sdk/)、[WinUI](https://learn.microsoft.com/en-us/windows/apps/winui/)。

## 路线 E：WinForms / MFC 与既有系统维护

- WinForms：从事件与控件开始，重点补 UI 状态分离、跨线程更新、原生互操作、DPI 和旧系统部署约束。
- MFC：补 Win32 消息与资源、消息映射、对象生命周期、文档/视图、编译链接和 CRT 边界，再做局部重构。
- 共同任务：先建立构建与诊断基线，抽离一条可测试业务路径；是否迁移以及迁移到哪里，由维护成本、系统约束和验证结果决定。
- 官方入口：[WinForms](https://learn.microsoft.com/en-us/dotnet/desktop/winforms/)、[MFC](https://learn.microsoft.com/en-us/cpp/mfc/mfc-desktop-applications)。

## 按需比较的其他路线

Avalonia、Tauri、直接 Win32/Direct2D 等留在框架专题，不加入所有人的必修表。有明确项目需求后，再用同一个任务比较运行条件、系统集成、团队能力、部署、诊断和长期维护成本。

## 比较框架时交什么材料

| 维度 | 需要回答的问题 |
| --- | --- |
| 产品与团队 | 目标平台、交互复杂度、既有资产和团队语言能力是什么？ |
| 运行关系 | 线程、进程、状态和资源由谁拥有？ |
| 系统集成 | SDK、COM、设备或 Shell 能力如何接入？ |
| 用户体验 | 输入、DPI、可访问性、启动与响应是否满足要求？ |
| 诊断 | 崩溃和卡死能否采集到可用证据？ |
| 交付 | 安装包、运行时、签名、升级和依赖许可是什么条件？ |
| 验证 | 比较用了什么版本、数据和机器？哪些结论仅适用于该实验？ |

不以“新/旧”“原生/非原生”单个标签代替选择依据。先把一条路线做到能交付，再迁移一个功能，通常比重复学习各框架的入门控件更能暴露理解缺口。
