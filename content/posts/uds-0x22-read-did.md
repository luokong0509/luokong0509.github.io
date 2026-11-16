+++
title = "UDS 0x22：按 DID 读数据，以及它为什么会返回 0x33"
date = 2026-11-05
categories = ["诊断与测试"]
minutes = 8
summary = "从 22 F1 90 到 62 F1 90 加 17 个字节，中间要过会话、安全访问和 ISO-TP 三道关。"
draft = false
+++
## 服务的形状

`0x22 ReadDataByIdentifier` 的请求极简：服务号 + 一个或多个两字节 DID。

```
22 F1 90
```

肯定响应把服务号加 0x40，后面跟数据和 DID：

```
62 F1 90 57 4D 58 31 36 35 41 52 32 33 34 35 36 37 38 39
```

`62` = 0x22 + 0x40，`F1 90` 是 VIN 的 DID，后面 17 个字节是 ASCII。VIN 固定 17 位，所以这个响应一定是多帧。

## ISO-TP 先把长报文切开

17 字节数据 + 3 字节头 = 20 字节，超过 8 字节的经典 CAN 载荷，必须分段：

| 帧 | 内容 | 含义 |
| --- | --- | --- |
| 首帧 FF | 10 14 62 F1 90 57 4D 58 | 总长 0x14 = 20 字节 |
| 流控 FC | 30 00 00 | 允许连续发，间隔 0 |
| 连续帧 CF | 21 31 36 35 ... | 带序号，从 0x21 开始 |

看到 `0x10` 开头不要当成服务号，它是 ISO-TP 的首帧。这是抓包时最常见的误读。

## 三种典型否定响应

| NRC | 含义 | 常见触发 |
| --- | --- | --- |
| 0x13 | 长度或格式错误 | DID 只发了一个字节 |
| 0x22 | 条件不满足 | 未进入扩展会话就刷写相关 DID |
| 0x31 | 请求超出范围 | DID 不支持，或 ECU 没配置这个数据 |
| 0x33 | 安全访问被拒 | 没做 0x27 解锁就读受保护数据 |

`0x33` 几乎总是流程问题：先用 `10 03` 进扩展会话，再 `27 01` 取种子、`27 02` 回密钥，然后才读。跳过 0x27 直接读，ECU 会老老实实回 `7F 22 33`。

## 时序参数别忽略

P2 通常 50 ms，P2* 是收到 `7F xx 78`（响应挂起）后的延长窗口，常见 5000 ms。读大块数据（如标定区）时，ECU 会先回 pending，再等几十毫秒才给正式响应。上位机把超时写死 100 ms，就会把正常的挂起当成失败。

```python
from udsoncan.client import Client
from udsoncan.connections import PythonIsoTpConnection
from isotp import with_isotp

with with_isotp("can0") as tp:
    conn = PythonIsoTpConnection(tp)
    with Client(conn, request_timeout=5) as client:
        resp = client.read_data_by_identifier([0xF190])
        vin = resp.service_data.values[0xF190].decode("ascii")
        print(vin)
```

## 抓包排查的四步

1. 看请求有没有发出去（0x7E0 方向）；
2. 看有没有回 `7F` 和 NRC，NRC 本身就是答案的一半；
3. 多帧响应看流控有没有发，连续帧序号有没有断；
4. 都正常但数据不对，回去查 DID 定义，别怀疑 ECU。
