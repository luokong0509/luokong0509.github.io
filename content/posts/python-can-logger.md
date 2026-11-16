+++
title = "用 python-can 写一个能干活的报文记录器"
date = 2026-09-15
categories = ["工具与脚本"]
minutes = 6
summary = "不需要 CANoe 也能把总线数据完整录成 BLF，关键是别在接收循环里做慢操作。"
draft = false
+++
## 最小可用版本

```python
import can, time

bus = can.Bus(interface="vector", channel=0, bitrate=500000)
logger = can.Logger("run.blf")

t0 = time.time()
try:
    while time.time() - t0 < 30:
        msg = bus.recv(timeout=1.0)
        if msg is not None:
            logger.on_message_received(msg)
finally:
    logger.stop()
    bus.shutdown()
```

录出来的 `.blf` 可以直接拖进 CANoe / CANalyzer 回放，格式兼容，不需要额外转换。

## 别在接收循环里做慢操作

`recv` 返回的是一条消息，如果你在循环里打印、解析、写 CSV，高负载下必然丢帧。三层缓冲就够了：

- **接收线程**只做 `recv` 和入队；
- **处理线程**从队列取，做解码和统计；
- **落盘**交给 `can.io.BufferedSink`，它内部有缓冲，不会每条都 fsync。

```python
import can
from can.io import BufferedSink
sink = BufferedSink(can.Logger("run.blf"), buffer_size=1024)
```

## 时间戳要来自硬件

`msg.timestamp` 是驱动给的时间，精度取决于接口。Vector 与 PEAK 的硬件时间戳能到微秒级，socketcan 通常靠软件打戳。做多路同步或延迟分析时，必须在同一时钟基准上——用同一块硬件的多通道，或者做时钟同步，否则算出来的延迟全是噪声。

## 记录时顺手存三样东西

1. **DBC**：没有信号定义，BLF 只是一堆十六进制，过两周自己也看不懂；
2. **配置快照**：波特率、采样点、接口型号、固件版本；
3. **事件标记**：在关键操作处写注释帧。`can.Message(arbitration_id=0x1234, is_extended_id=False, data=[...])` 这类自定义帧，回放时就是时间轴上的锚点。

## 什么时候该换工具

单机、单通道、几十万帧以内，这个脚本足够。要分析服务时序、做残余总线仿真、跑自动化测试序列，还是得上 CANoe 或自建 HIL——脚本只负责把原始数据干净地留下来。
