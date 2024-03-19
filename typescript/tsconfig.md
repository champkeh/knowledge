# TSConfig 解读

> 查看项目的最终配置:
> ```shell
> tsc --showConfig
> ```
> 查看模块解析路径:
> ```shell
> tsc --traceResolution
> ```


```
/
├── src/
│   ├── converter.ts
│   └── units.ts
├── test/
```
```
/
├── extends
├── files
├── include
├── exclude
├── references
├── compilerOptions
│   ├── converter.ts
│   ├── converter.ts
```

## extends
基于基础配置进行扩展
从v5开始支持数组，即多个基础配置的组合

## Language and Environment

### 1. target 编译目标
设置编译后的代码的运行环境，高版本的语法特性会被语法降级。

类型: string

可选值有(不区分大小写)：
```
ES3
ES5
ES6(ES2015)
ES2016
ES2017
ES2018
ES2019
ES2020
ES2021
ES2022
ESNext
```

### 2. lib
用于设置要引入的内置类型声明文件，默认值会受`target`的影响，比如如果你的`target`设置为`ES6`或更新的版本，那么`lib`会自动包含`Map`的类型声明文件。

类型: string[]

可选值有(不区分大小写)：
```
ES5
ES2015(ES6)
ES2016(ES7)
ES2017
ES2018
ES2019
ES2020
ES2021
ES2022
ESNext
DOM
WebWorker
ScriptHost
```
以上是整个版本的所有内容，比如`ES2021`是包含2021这个版本新增的所有特性，也可以单独包含某一个特性，比如`ES2021.String`。
具体可以查看ts的源码中`lib`目录。

> 为了防止在升级TypeScript版本过程中出现的DOM版本变动，可以使用`@typescript/lib-dom`替换typescript内置的`lib.dom.d.ts`，具体可以查看[Supporting lib from node_modules](https://devblogs.microsoft.com/typescript/announcing-typescript-4-5-beta/#supporting-lib-from-node_modules)

### 3. noLib
忽略`lib`配置，即不包含任何内置的lib，你需要自己定义每一个用到的类型声明。

类型: boolean

### 4. useDefineForClassFields
由于新标准中类字段的运行时语义与TypeScript之前版本所实现的运行时语义不同，所以这个字段用于过渡期使用。

> 新标准用`Object.defineProperty`方法声明类字段。

类型: boolean

`ES2022`及之后的版本默认值为`true`，及采用新标准。

### 5. moduleDetection


## Modules
模块导入及解析相关的配置。
> 调试模块导入路径分析可以使用 `tsc --traceResolution`命令

### 1. baseUrl
通常是一个相对路径(相对于`tsconfig.json`)，用于指定一个目录，该目录会作为**非相对路径**模块导入时的根目录(优先级高于`node_modules`目录的查找)。

类型: string

举个例子，
```ts
import {sayHello} from 'hello/world'
```
上面的`import`会优先查找 **项目下** 的`hello`目录下的`world`模块，然后再去查找`node_modules`目录下的`hello/world`模块。

> 注意，如果使用`paths`配置的话，`baseUrl`不是必须的。

### 2. paths
类似于其他构建工具中的`alias`，用来映射`import`语句中的路径别名，功能覆盖`baseUrl`。

类型: Object

对象中每一条配置都对应一条映射，`key`对应`import`中的别名/模式，`value`是一个数组(具有 fallback 机制)，数组中指定一个相对路径，如果设置了`baseUrl`就相对于`baseUrl`，没有设置`baseUrl`的话就相对于`tsconfig.json`。

> 注意，`tsc`并不会在输出产物中修改这个别名路径，也就是说`tsc`的输出产物需要运行时支持路径别名。通常配合`rollup`或者`webpack`中的`alias`使用。

> 相对路径导入和非相对路径导入的区别可以查看[这里](https://www.typescriptlang.org/docs/handbook/module-resolution.html#relative-vs-non-relative-module-imports)，相对路径导入适合用于导入自己的依赖，这些依赖的位置关系在运行时和编译时是一样的；非相对路径导入适合导入外部依赖，基于`baseUrl`或者`paths`进行解析。

关于模块解析策略：Node 和 Classic
这两种策略对于相对路径导入和非相对路径导入都是不同的，具体会查找哪些文件，可以参考[这里](https://www.typescriptlang.org/docs/handbook/module-resolution.html#module-resolution-strategies)

### 3. rootDirs
建立一个虚拟目录，这个虚拟目录内部的文件可以相对于这个虚拟的根目录进行相对路径导入。
