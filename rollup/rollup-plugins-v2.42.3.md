# Rollup 插件分析 (v2.42.3)

> 在此之前，你需要对`rollup`的插件有一个大概的了解。可以查看官方文档 [Plugin Development](https://rollupjs.org/guide/en/#plugin-development)

从`CommonJS`的构建配置可知，用到的插件如下：
```js
const nodePlugins = [
    alias(moduleAliases),
    resolve(),
    json(),
    conditionalFsEventsImport(),
    string({ include: '**/*.md' }),
    commonjs({ include: 'node_modules/**' }),
    typescript()
];
const plugins = [
    ...nodePlugins,
    addCliEntry(),
    esmDynamicImport(),
    !command.configTest && collectLicenses()
]
```

下面就一个个来进行分析：

## `alias(moduleAliases)`插件
相关代码如下：
```js
import alias from '@rollup/plugin-alias';

const moduleAliases = {
    resolve: ['.js', '.json', '.md'],
    entries: [
        { find: 'help.md', replacement: path.resolve('cli/help.md') },
        { find: 'package.json', replacement: path.resolve('package.json') },
        { find: 'acorn', replacement: path.resolve('node_modules/acorn/dist/acorn.mjs') }
    ]
};

const plugin = alias(moduleAliases)
```
该插件用于定义及替换别名，上面的配置定义了3个别名：`help.md`、`package.json`和`acorn`。
比如，在`cli/cli.ts`文件中就有下面这样的语句：
```ts
import help from 'help.md';
import { version } from 'package.json';
```


## `conditionalFsEventsImport`插件
