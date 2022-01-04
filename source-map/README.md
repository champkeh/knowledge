# Source Map

## 是什么

> A source map provides a way of mapping code within a compressed file back to it’s original position in a source file.

有了`Source map`，就可以回答下面这样的问题：
> Given the line/col location in this generated code, in which file and at what line/col did it originate?
> 
> 给定此生成代码中的行/列位置，它在哪个文件中以及在哪个行/列中生成？

是一个`json`对象，用于建立生产代码和源码之间的位置映射关系，方便对生产代码进行调试。

常用于`JavaScript`语言中，这种语言的特点是运行的代码和源码之间不是编译的过程，而是`minify + bundle`的过程(压缩及合并)，最终的代码仍然是`JavaScript`，只不过变得人类不可读了。想要调试，必须和源码之间建立关系。

## 可以做什么

## 如何生成及使用

## 映射原理

```json
{
  "version": 3,
  "sources": [
    "base/lib/es-utils.js",
    "node_modules/stackframe/stackframe.js",
    "base/client.js",
    "base/plugins/throttle.js",
    "browser/plugins/device.js",
    "browser/plugins/inline-script-content.js"
  ],
  "names": [
    "schema",
    "apiKey",
    "defaultValue",
    "message",
    "validate"
  ],
  "mappings": "CAAA,SAAAA,GAAA,GAAA,iBAAAC,SAAA,…",
  "sourceRoot": "/path/to/static/assets",
  "sourcesContent": [
    "(function(f){if(typeof exports===\"object\"&&typeof…",
    "/*\n * Leaves breadcrumbs when the user interacts…"
  ],
  "file": "bugsnag.min.js"
}
```
大部分字段都很容易理解，唯独`mappings`这个需要特别解释一下：  
`mappings`字符串里面以逗号和分号分隔的都是`base64`编码的`VLQ`值，这个值用于从输出文件的每一个位置指向源文件的对应位置。

简单来说就是，`mappings`是一个指针列表，这个指针就是从生成文件中的每一行中每一个段指向`sources`和`names`中的项。行以分号分隔，段以逗号分隔。段是一个相当模糊的术语，其实它指的是在一行里面任何可以映射回源的部分，可以是标识符，可以是运算符，也可以是函数调用等等。

```
"mappings": {
  "0": [
   ^
   └── the line number of the output file

    "231 => source.js 5:64 foo"
      ^        ^       ^    ^
      │        │       │    └── the symbol name from the source file
      │        │       │
      │        │       └── the line:column position in the source file
      │        │
      │        └── the name of the source file
      │
      └── the column number of the output file

  ]
}
```

## 参考
- [Source Map Revision 3 Proposal](https://docs.google.com/document/d/1U1RGAehQwRypUTovF1KRlpiOFze0b-_2gc6fAH0KY0k/edit#heading=h.1ce2c87bpj24)
- [Introduction to JavaScript Source Maps](https://www.html5rocks.com/en/tutorials/developertools/sourcemaps/)
- [JavaScript Source Map 详解](https://www.ruanyifeng.com/blog/2013/01/javascript_source_map.html)
- [Source Maps from top to bottom](https://itnext.io/source-maps-from-top-to-bottom-597bbc07436)
- [Anatomy of source maps](https://www.bugsnag.com/blog/source-maps)
- [mozilla 的参考实现](https://github.com/mozilla/source-map)
- [Compiling to JavaScript, and Debugging with Source Maps](https://hacks.mozilla.org/2013/05/compiling-to-javascript-and-debugging-with-source-maps/)
