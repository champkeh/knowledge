# Import Map (导入映射表)

关于这个概念，官方是这样解释的：

> how to control the behavior of JavaScript imports.

直译过来就是，用来控制`JavaScript`中`import`的行为。

感觉很别扭，应该如何理解这句话呢？

我们知道，在`ES6`的模块规范里面，`import`是不能直接使用`bare specifiers`的，也就是说，下面这样的代码目前是不合法的(被保留的)：

```js
import moment from 'moment';
import { partition } from 'lodash';
```

`ES6`目前只能使用相对路径的`specifier`，比如：
```js
import moment from './moment.js';
import { partition } from '../lodash.js'
```

但是这样就很麻烦，并且也跟nodejs中的`specifier`不统一了，怎么解决这个问题呢？

于是，就出现了`import maps`这样的一个概念，我们可以给浏览器提供这样一个映射表，来告诉浏览器对应的`specifier`应该从哪个`URL`去加载，比如下面这样的一个`import maps`：
```html
<script type="importmap">
{
  "imports": {
    "moment": "/node_modules/moment/src/moment.js",
    "lodash": "/node_modules/lodash-es/lodash.js"
  }
}
</script>
```

这样的话，浏览器就知道如何去加载对应的模块了，因此，我们最开始写的代码就等效下面这样的：
```js
import moment from '/node_modules/moment/src/moment.js';
import { partition } from '/node_modules/lodash-es/lodash.js';
```

## 参考资料
- [https://wicg.github.io/import-maps/](https://wicg.github.io/import-maps/)
- [https://github.com/WICG/import-maps](https://github.com/WICG/import-maps)
