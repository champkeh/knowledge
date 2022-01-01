# learn-bundler
学习前端打包工具

### `package.json`文件各个字段的说明

- `main`：该字段的文件会被作为CJS模块，通过`require`加载
- `module`：该字段的文件会被作为ES模块，通过`import`加载
- `browser`：该字段的文件会被作为UMD模块，适用于所有环境

### 基本概念

1. [Import Map](basic/import-map.md)

### Rollup
- [Rollup 源码分析(v0.1/v0.3)](rollup-v0.3.md)
- [Rollup 源码分析(v2.42.3)](rollup-v2.42.3.md)
