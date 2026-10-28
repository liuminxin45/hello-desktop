# 09 EXE、DLL、LIB、PDB：构建产物怎样连起来

工作台准备接入一个原生分析模块。供应方给了头文件、两个 `.lib`、一个 DLL 和 PDB。哪些需要编译时使用，哪些必须跟随产品安装？这取决于产物承担的角色，不能只看扩展名猜测。

## 链接发生一次，加载还会再发生

头文件告诉编译器有哪些声明。目标文件保存编译后的代码与符号。链接器把目标文件与库组合，解决所需符号，生成 EXE 或 DLL 等产物。

`.lib` 常见两种角色：静态库容纳可被链接进最终模块的代码；导入库帮助调用方记录对某个 DLL 导出的引用。链接了导入库，不等于已经把对应 DLL 的实现装进 EXE。

| 产物 | 主要使用时机 | 典型接收者 |
| --- | --- | --- |
| `.h` | 编译调用方 | SDK 使用者 |
| 静态 `.lib` | 链接时取入代码 | 调用方构建系统 |
| 导入 `.lib` | 链接时建立 DLL 导入关系 | 隐式链接调用方 |
| 原生 `.dll` | 进程加载或运行时加载 | 产品运行环境 |
| `.pdb` | 调试与符号解析 | 开发、支持与符号归档 |

加载时动态链接通常在进程或模块装入时解析导入；显式加载则由代码请求加载模块、取得导出地址再调用。同一个 DLL 可以被不同调用方用不同方式接入。

## “找不到模块”可能不是顶层 DLL 不在

`workbench_native.dll` 还可能依赖另一个库。顶层文件存在，间接依赖缺失，加载仍会失败。错误也可能来自架构不符、导出不匹配或初始化失败。

在 Visual Studio 开发者终端中，可先观察：

```powershell
dumpbin /headers workbench_native.dll
dumpbin /exports workbench_native.dll
dumpbin /dependents workbench_native.dll
```

Dependencies 提供图形化依赖与导出视图。它适合帮助解释静态导入，不保证发现应用运行时按条件拼出的所有加载路径。Windows API set 名称也不是让你去网上下载同名文件的指令。

再用 Process Monitor 过滤目标进程的相关加载、文件访问与时间范围，查看实际尝试的位置。某次 `NAME NOT FOUND` 可能只是搜索过程的一步，必须结合之后是否成功和最终错误判断。

## 路径与架构同样属于契约

用绝对路径加载顶层 DLL 能减少歧义，但不意味着间接依赖一定只从同一目录解析。Windows 的加载策略还涉及应用类型、API set、已加载模块、系统目录和显式搜索选项。产品应选择受控目录与适当的加载 API，不能靠永久修改全机 PATH 修补包装缺陷。

本书原生实验先限定 Windows x64，以缩小 ABI 与工具链组合。它不以“能在 x64 Windows 上运行”推导 x86、ARM64 调用都已支持。

加载成功后仍可能调用错误：导出地址存在，但声明不一致、对象已释放或回调晚到，都可能让进程损坏。第 10 章专门处理这个边界。

## 初始化别塞进 DllMain

`DllMain` 在加载器约束下执行，复杂锁、加载其他模块或等待线程都可能引入严重问题。把业务初始化放在显式 API 中，失败能返回给调用方，日志也更容易归属。

卸载前必须保证没有线程执行库内代码、没有未来回调，也没有继续使用的库内对象。把模块句柄关闭不等于安全取消其中的一切活动。

## 动手：建立三份证据

按[原生实验说明](../../examples/README.md)构建字节求和库。在不改系统目录的独立练习目录里，比较导出表、Dependencies 依赖视图和实际调用。

再做一个缺失间接依赖的受控练习；如果实验库没有额外依赖，就先画出假设，不声称已制造该故障。记录错误码、架构、文件位置与加载证据，避免用“重装运行库后好了”结束调查。

## 检查理解

**链接器已经通过，为什么部署后还缺 DLL？** 导入库解决的是构建时符号关系，运行时实现及其依赖仍需存在并可正确加载。

**Dependencies 没显示某模块，能证明程序不会加载它吗？** 不能。运行时加载、插件和条件路径可能不在静态导入关系里，需要结合执行证据。

下一章把导出函数的内存与调用规则写成契约。

参考：[链接到 DLL](https://learn.microsoft.com/en-us/cpp/build/linking-an-executable-to-a-dll)、[DLL 搜索顺序](https://learn.microsoft.com/en-us/windows/win32/dlls/dynamic-link-library-search-order)、[Dependencies](https://github.com/lucasg/Dependencies)、[DLL 最佳实践](https://learn.microsoft.com/en-us/windows/win32/dlls/dynamic-link-library-best-practices)。

[上一章](08-learn-ui-frameworks.md) · [返回目录](../index.md) · [下一章：API 与 ABI](10-api-c-abi.md)
