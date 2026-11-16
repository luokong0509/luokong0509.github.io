+++
title = "WSL 安装与使用：在 Windows 里跑 Ubuntu"
date = 2026-11-13
categories = ["工具与脚本"]
minutes = 4
summary = "从 wsl --install 到关掉 GUI 转发：在 Windows 上装一个 Ubuntu 的全过程，附两个常见弹窗的解法。"
draft = false
+++
WSL 是 Windows 自带的 Linux 子系统，装完就能在同一个桌面里开 Ubuntu 终端，不用双系统，也不用另开虚拟机。

## 一、安装

以管理员身份打开 PowerShell，执行：

```powershell
wsl --install
```

装完检查发行版和版本：

```powershell
wsl -l -v
```

重启电脑。开机后 Ubuntu 会自动完成安装，随后提示创建默认用户：输入用户名，再输入两次密码。

{{< figure src="/images/wsl/file-20261113105505211.png" alt="wsl --install 的安装过程与创建默认用户提示" caption="wsl --install 的安装过程与创建默认用户提示" >}}

密码输完会问要不要共享匿名统计数据，按自己意愿选：`y` 同意，`n` 拒绝。

{{< figure src="/images/wsl/file-20261113105826621.png" alt="Ubuntu 首次配置：设置密码与统计共享选项" caption="Ubuntu 首次配置：设置密码与统计共享选项" >}}

## 二、使用：把 Windows 里的文件交给 Ubuntu

WSL 把 Windows 盘符挂在 `/mnt/` 下，D 盘就是 `/mnt/d`。复制一个安装包进去：

```bash
cp /mnt/d/work/Git-2.56.1-64-bit.exe .
```

两个细节：`cp` 后面必须有空格；末尾那个 `.` 表示“复制到当前目录”，漏了就会报错。复制完用 `ls` 确认。

Windows 的 exe 在 WSL 里可以直接跑，这是 WSL 的互操作能力：

```bash
./Obsidian-1.15.0.exe
```

{{< figure src="/images/wsl/2cd9864af6373a2cb9e148fd9bef71fe.png" alt="复制安装包、ls 确认，然后直接运行 Windows 的 exe" caption="复制安装包、ls 确认，然后直接运行 Windows 的 exe" >}}

两个终端习惯：WSL 终端里 `Ctrl+V` 无效，要用右键粘贴或 `Ctrl+Shift+V`；敲文件名不必拼全，按 `Tab` 就能补全。

## 三、常见问题

### 1. 输入密码时没有任何显示

正常现象。Linux 终端不回显密码，照常输入、回车即可，不要以为卡住了。

### 2. 一操作就弹远程桌面错误

会连续弹两个框：一个是「无法加载远程桌面服务 ActiveX 控件，请确保 rdclientax.dll 在路径中」，另一个是 RemoteApp 的「计算机无法连接到远程计算机」。

{{< figure src="/images/wsl/file-20261113110046437.png" alt="提示无法加载远程桌面服务 ActiveX 控件" caption="提示无法加载远程桌面服务 ActiveX 控件" >}}

{{< figure src="/images/wsl/file-20261113110048833.png" alt="RemoteApp 提示计算机无法连接到远程计算机" caption="RemoteApp 提示计算机无法连接到远程计算机" >}}

原因是 WSL 试图调用图形界面（GUI）转发。关掉它就行：

1. 在 `C:\Users\<用户名>\` 下新建文本文件，写入：

```ini
[wsl2]
guiApplications=false
```

2. 把文件名改成 `.wslconfig`。注意是配置文件的扩展名，不是 `.wslconfig.txt`；记事本另存时把“保存类型”改成“所有文件”，否则会变成 `.txt`。
3. 回到 PowerShell 执行，让配置生效：

```powershell
wsl --shutdown
```
