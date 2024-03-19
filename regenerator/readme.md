## ES6 Generator是如何工作的


https://x-team.com/blog/generators-work/


## regenerator 包是干嘛的
这个包是 facebook 工程师开发的，用于将ES6中的生成器函数(generator/yield)语法转换成ES5代码，作为 babel 的 transform 插件进行使用。

转换后的 ES5 代码不能直接运行，需要引入一个运行时，这个运行时起初也是包含在`regenerator`内部，即`regenerator/runtime`，后面移到了单独的`regenerator-runtime`包中。

> 关于为什么需要运行时？下面是我的猜想：
> 
> 语法降级(比如ES6转ES5)通常都需要大量代码(ES5)实现相同的逻辑(ES6)，每遇到一个ES6的高级特性，都需要大量重复的代码来支持降级，最终会导致生成的ES5代码体积膨胀。
> 我们可以把每一个语法特性的降级处理进行封装，而所有这些封装放在一起就形成了运行时(runtime)，这样生成的ES5代码就会很小，并且不会随着ES6特性的多少出现体积膨胀。
> 唯一的缺点就是执行ES5代码之前，需要先执行运行时代码。
> 
> 而`regenerator`包的运行时会挂在一个全局变量`regeneratorRuntime`上面。


https://www.promisejs.org/generators/

---

## 参考资料

- https://x-team.com/blog/generators-work/
- https://www.promisejs.org/generators/
