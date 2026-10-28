# 18 Minidump、PDB 和调用栈：从崩溃现场继续调查

日志停在“开始分析”，进程已经退出。重新运行没有复现。dump 将特定时刻的部分进程状态保存下来，让调查不完全依赖再次遇到同一时序。

本章先学采集与符号匹配，再读异常和线程栈。它不把调试器自动结论当成最终根因。

## dump 保存了什么

用户态 dump 可以包含线程、模块、异常上下文、部分或较完整的内存等内容，取决于采集方式和选项。文件较小通常意味着保留内容有限；“minidump”也不是固定只有调用栈的统一格式。

完整用户态 dump 提供更多调查机会，同时占用更大空间，并可能包含文档、令牌和其他内存数据。支持流程需要范围、传输与保留策略。

异常现场 dump 与普通时刻的现场快照不同。前者帮助还原异常上下文；后者可能更适合调查卡住，但不能凭空得到之前崩溃的指令。

## 先安排可靠采集

WER 的 LocalDumps 可按应用配置本地采集，默认并非为所有应用开启，配置需要相应权限，也存在与自定义崩溃报告等方案的适用边界。不要在教程脚本中修改全机策略来抓一个练习程序。

独立教学进程可以使用 ProcDump 启动并等待未处理异常。先按[原生实验说明](../../examples/README.md)构建 `workbench_probe.exe`，在仓库根目录操作：

```powershell
New-Item -ItemType Directory -Force .cache/dumps | Out-Null
procdump -ma -e -x .cache/dumps .cache/native/Release/workbench_probe.exe --crash
```

这是一条供读者执行的故障采集练习，会让教学进程主动抛出未处理异常。需要先安装并阅读 ProcDump 使用条件；不是已经执行成功的记录。`-ma` 选择完整用户态内容，`-e` 监视未处理异常，`-x` 启动目标。不要对正常业务进程套用故障参数。

原生实验用显式教学异常制造现场，不用随机破坏内存模拟真实 bug。采集成功后再进入分析；没有文件时先调查采集条件，而不是编造调试器输出。

## PDB 必须匹配那份二进制

PDB 帮助把地址对应到符号和源码位置。调试器依据二进制记录的符号身份匹配，并不是“同名 PDB 就能用”。保存每次交付的二进制、PDB、源码提交和构建清单，比事后重新编译更可靠。

Microsoft 公共符号提供系统模块的支持，不能代替自己的私有符号。优化构建可能有内联、变量不可用和调用位置变化，要把这些当作分析条件。

## 一次原生调查的顺序

在 WinDbg 打开实际 dump，设置你自己的符号位置。下面目录是占位路径，需替换：

```text
.symfix C:\Teaching\SymbolCache
.sympath+ C:\Teaching\ExactBuild\Symbols
.reload
lm
!analyze -v
.ecxr
k
~* k
```

先核对模块和符号，再看自动分析、异常上下文、故障线程与全部线程。`.ecxr` 要求存在可用异常上下文；普通挂起快照未必有。记录异常码、模块、访问方式、参数和相邻调用，提出下一步可验证假设。

访问异常可能在 `memcpy` 或系统模块暴露，真正错误却是更早传入的长度或已释放对象。栈上的模块是观察位置，不直接等于责任归属。堆破坏甚至可能让栈本身不完整。

托管和混合进程还需要匹配的运行时分析能力，例如 Visual Studio 或 SOS 相关工具。不能把原生 `k` 中缺少的托管信息当作没有托管调用。

## 检查理解

**客户只有一个小 dump，局部变量读不到，怎么办？** 先说明缺失范围，检查符号与优化影响，再决定需要更完整 dump、额外日志或复现。不要把无法读取解释成变量为空。

**`!analyze` 指向某 DLL，足以认定供应方缺陷吗？** 不足。需要核对调用参数、对象生命周期与破坏发生时机；它首先提供调查入口。

本章验收是实际材料的符号匹配记录、异常解释和可证伪假设。下一章处理没有崩溃、却不再响应的程序。

参考：[本地 dump 采集](https://learn.microsoft.com/en-us/windows/win32/wer/collecting-user-mode-dumps)、[ProcDump](https://learn.microsoft.com/en-us/sysinternals/downloads/procdump)、[调试器自动分析](https://learn.microsoft.com/en-us/windows-hardware/drivers/debugger/using-the--analyze-extension)。

[上一章](17-logs-and-environment.md) · [返回目录](../index.md) · [下一章：性能与卡死](19-performance-hangs.md)
