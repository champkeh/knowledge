# WebAssembly 技术研究

## 启动服务
```shell
node server.js
```

## 文本格式与二进制格式的相关转换

> 参考https://developer.mozilla.org/en-US/docs/WebAssembly/Text_format_to_wasm

工具: [wabt](https://github.com/webassembly/wabt)

wat => wasm
```shell
wat2wasm module.wat -o module.wasm
```

wasm => wat
```shell
wasm2wat module.wasm -o module.wat
```

## 查看wasm文件的字节结构

### 使用wat2wasm

```shell
wat2wasm module.wat -v
```

输出:
```
0000000: 0061 736d      ; WASM_BINARY_MAGIC
0000004: 0100 0000      ; WASM_BINARY_VERSION
```

### 使用hexdump

```shell
hexdump -C module.wasm
```

输出:
```
00000000  00 61 73 6d 01 00 00 00      |.asm....|
00000008
```

## 使用varuint7编码数字127

unsigned LEB-128 编码

原码：
1111111

扩展：
1111111

0111 1111

7F

## 使用 varuint32 编码数字 128

原码：
1000 0000

扩展：
0000001 0000000

填充：
00000001 10000000

0x0180
