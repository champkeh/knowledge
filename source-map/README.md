# Source Map

## 是什么

> A source map provides a way of mapping code within a compressed file back to it’s original position in a source file.

是一个`json`对象，用于建立生产代码和源码之间的映射关系，方便对生产代码进行调试。

常用于`JavaScript`语言中，这种语言的特点是运行的代码和源码之间不是编译的过程，而是`minify + bundle`的过程(压缩及合并)，最终的代码仍然是`JavaScript`，只不过变得人类不可读了。想要调试，必须和源码之间建立关系。

## 可以做什么

## 如何生成及使用

## 映射原理
可以参考规范

## 参考
- [Source Map Revision 3 Proposal](https://docs.google.com/document/d/1U1RGAehQwRypUTovF1KRlpiOFze0b-_2gc6fAH0KY0k/edit#heading=h.1ce2c87bpj24)
- [Introduction to JavaScript Source Maps](https://www.html5rocks.com/en/tutorials/developertools/sourcemaps/)
- [JavaScript Source Map 详解](https://www.ruanyifeng.com/blog/2013/01/javascript_source_map.html)
- [Source Maps from top to bottom](https://itnext.io/source-maps-from-top-to-bottom-597bbc07436)
- [Anatomy of source maps](https://www.bugsnag.com/blog/source-maps)
- [mozilla 的参考实现](https://github.com/mozilla/source-map)
- [Compiling to JavaScript, and Debugging with Source Maps](https://hacks.mozilla.org/2013/05/compiling-to-javascript-and-debugging-with-source-maps/)
