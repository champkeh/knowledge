# WebSocket 学习

## 协议

- WebSocket 格式 [RFC6445](https://www.rfc-editor.org/rfc/rfc6455.html)
- WebSocket 压缩扩展 [RFC7692](https://www.rfc-editor.org/rfc/rfc7692.html)

## Wireshark 捕获过滤器: BPF语法

> https://biot.com/capstats/bpf.html

### Expression 过滤表达式

由多个原语(primitive)组成，原语可以进行简单的逻辑运算，比如与或非(&&/and、||/or、!/not)

原语(primitive)由一个**名称或数字**，以及描述它的多个限定词(qualifier)组成。

限定词(qualifier)有4种类型：

- type: 限定它所描述的**名称或数字**所指示的**类型**，这一类型的限定词有
  - host、port 分别它所限定的对象是主机和端口
  - net 表示它所限定的对象是一个子网
  - portrange 表示它所限定的对象是一个端口范围
- dir: 限定网络**出入方向**
  - src
  - dst
  - src or dst 默认
  - src and dst
- proto: 限定**协议类型**
  - ether/fddi/tr/wlan/ip/ip6/arp/rarp/decnet/tcp/udp/icmp/igmp/igrp/pim/ah/esp/vrrp
- 其他
  - gateway: 指定网关 IP 地址
  - broadcast: 广播报文
  - multicast: 多播报文
  - less, greater: 小于或者大于

### 示例

1. 指定主机
```
host www.baidu.com
```

2. 指定端口范围
```
portrange 6000-8000
```

3. 指定子网
```
net 192.168.0.0 mask 255.255.255.0
net 192.168.0.0/24
```

4. 指定端口范围与协议
```
src or dst portrange 5000-8000 && tcp or ip6
```

5. 指定网关
```
gateway 192.168.1.1
ether host 192.168.1.1 and not host 192.168.1.1
```

### 基于协议域过滤

![img.png](img.png)

1. 捕获所有 TCP 中的 RST 报文
```
tcp[13] & 4 == 4
```

2. 抓取 HTTP GET 报文
```
port 80 and tcp[((tcp[12:1] & 0xF0) >> 4 * 4):4] == 0x47455420
port 80 and tcp[((tcp[12:1] & 0xF0) * 4):4] == 0x47455420
port 80 and tcp[((tcp[12:1] & 0xF0) >> 2):4] == 0x47455420
```
> 对这个表达式的解释可以参考 https://security.stackexchange.com/questions/121011/wireshark-tcp-filter-tcptcp121-0xf0-24
