# Rollup 源码分析 (v0.3)


## Rollup基本数据结构

### Scope
js的作用域表示，内部包含一个 names 列表，并通过`parent`字段进行级联，组成一个作用域链。结构如下：
```text
{
    parent: Scope | null,
    depth: number,
    names: [string],
    isBlockScope: boolean
}
```

**关于Scope需要注意的是：**  
在向一个 Scope 添加 name 的时候，如果该作用域是一个块作用域，也就是说，该作用域的`isBlockScope`属性的值是`true`，那么，当添加的`name`是一个`FunctionDeclaration`，或者是一个通过`var`声明的`VariableDeclaration`的时候，由于变量提升的原因，不能将该 name 添加在该作用域，而是需要调用父作用域的添加逻辑。如果父作用域仍然是块作用域，则需要继续调用父作用域的添加逻辑。

同时，Scope 结构也会提供一个搜索函数`findDefiningScope`，用来查找某个 name 是在哪个作用域中定义的。(会从当前作用域开始，依次向父级作用域进行搜索)

### Module
表示**内部模块**(相对于后面的`ExternalModule`来说)的数据结构，在构造Module的实例时，会对该模块进行解析并分析该模块的imports/exports信息。同时提供了一个`define`方法，用来在该模块中查找对应name的定义节点；如果该name不是在该模块中定义的，则会继续向对应依赖中查找。

### ExternalModule
todo

### Bundle
是rollup进行构建的一个基本单位，调用`build`方法时，开始对入口模块进行解析，并分析入口模块中import的所有的name，然后从这些import的依赖中查找对应name的定义，并把定义这些name的ast节点保存到一个数组中。这样当所有这些被import的name对应的ast节点都搜集完毕之后，只需要将这些ast节点和入口模块中的节点组装成单个ast树，再根据这棵树就可以生成最后的bundle了，这样就把入口模块所有的依赖打包成单个文件了。


## 主要逻辑分析

### walk.js
`walk`函数用于遍历 ast 节点树，内部通过`visit`进行递归调用(深度优先)，通过两个全局标志变量`shouldSkip`和`shouldAbort`进行辅助，来决定是否跳过某些节点或退出整个遍历。

**这两个变量的置位时机：**  
- `shouldSkip`: 在开始遍历一个新节点之前会自动重置为`false`，可以在`enter`方法内部调用`this.skip()`将该变量置为`true`，这样就可以跳过该(子)节点树的遍历
- `shouldAbort`: 该变量只有在调用`walk`时才会重置为`false`，一旦在遍历过程中被设置为`true`，则只能中断本次遍历，没有办法进行恢复。

**注意：**
由于`estree`规范的存在，我们知道每种类型的节点的结构是固定的，也就是说，只要知道了一个节点的`type`，就可以知道该节点有哪些`properties`，因此我们可以把这个信息进行缓存来加速遍历性能，方法就是内部的`childKeys`容器，该容器的属性是节点类型，值就是该节点类型里面所有以对象类型的值所对应的属性组成的数组。
```
// childKeys 结构:
{
    type: [key: string]
}
```

比如，`FunctionExpression`节点的结构如下：
```
{
    type: 'FunctionExpression',
    id: Identifier | null,
    params: [ Pattern ],
    body: FunctionBody
}
```
那么，该类节点在`childKeys`容器中的信息就是：
```js
{
    FunctionExpression: ['id', 'params', 'body']
}
```

### analysis.js
`analysis`函数用于对 ast 进行分析，主要目的有2个(v0.3)：
- 处理代码的作用域，生成完整的作用域信息
- 找出语句都有哪些顶层依赖项，以及可能修改哪些标识符

下面说说是如何生成一个完整的作用域信息的：  
`analysis`函数会遍历顶层语句，给每条语句(顶层语句)对应的节点添加一些私有属性，如下：
```js
Object.defineProperties( statement, {
    _defines:          { value: {} },
    _modifies:         { value: {} },
    _dependsOn:        { value: {} },
    _included:         { value: false, writable: true },
    _module:           { value: module },
    _source:           { value: magicString.snip( statement.start, statement.end ) },
    _margin:           { value: [ 0, 0 ] },
    _leadingComments:  { value: [] },
    _trailingComment:  { value: null, writable: true },
});
```

`_leadingComments`和`_trailingComment`比较好理解，就是当前语句的前导注释和尾随注释，其中，尾随注释只能有1个，比如下面这样的：
```js
const a = b; // this is a trailing comment

function foo() {
    console.log(42);
} /* this is also a trailing comment */
```
前导注释可以有多个，比如这样：
```js
// this is a leading comment
// and this is another leading comment
/* me too */
const a = b;
```

注释处理完了，就开始处理`margin`，这个概念类似于`CSS`中盒子之间的`margin`，就是语句之间的一个空白。但是这里有意思的是，这个属性是一个二元组，也就是上面看到的`[0, 0]`，这个二元组的第一个分量保存该语句与前一条语句的`margin`值，第二个分量保存该语句与后一条语句的`margin`值。可以理解成`CSS`中的`margin-top`和`margin-bottom`。

接下来，就开始对每一条语句(顶层语句)进行一个深度遍历(采用`walk`函数)，该过程的目的是为了解析出完整的作用域链。

其中，`FunctionExpression/FunctionDeclaration/ArrowFunctionExpression`会生成一个函数作用域

> 这里有一个点需要注意：  
> 如果该节点是一个`FunctionExpression`，并且该函数表达式有一个name，那么这个 name 也会被添加到这个函数新创建的作用域里面，与参数名没有区别。这就相当于是这个新创建的作用域定义了该函数对象，有点类似于先鸡后蛋还是先蛋后鸡的味道。
> ```js
> const foo = function bar(a, b) {};
> ```
> 上面这个函数表达式所创建的作用域里面，包含3个name的定义：`['a', 'b', 'bar']`

`BlockStatement`创建一个块作用域，`CatchClause`也创建一个块作用域，但它比`BlockStatement`创建的作用域多了一个参数，也就是`catch(e)`里面的`e`。

所有这些新创建的作用域都会保存在对应的节点上面(私有属性`_scope`)。

而那些声明语句，比如`VariableDeclaration/FunctionDeclaration/ClassDeclaration`，则把它们对应的 name 添加到它们所在的那个作用域里面。
如果这个作用域是顶层作用域，则该 name 也会被保存到对应的顶层语句上面(私有属性`_defines`)，表示该 name 是由该语句定义的。

到此为止，对顶层语句的第一遍遍历就结束了，我们的结果就是解析出了完整的作用域信息，并保存在对应的节点上面。

下面开始进行第二遍遍历。

第二遍遍历的目的是什么呢？
我们在上面也已经说了，是 **找出语句都有哪些顶层依赖项，以及可能修改哪些依赖项**，那如何理解这句话呢？

在对节点进行深度遍历的时候，如果遇到`import`语句，则跳过该语句；如果该节点上面有我们之前(第一遍遍历时)绑定的作用域信息(`_scope`属性)，则把该作用域提取出来，然后依次调用`checkForReads`和`checkForWrites`这两个函数。

那我们就来分析下这两个函数是干嘛的。
先说`checkForReads`，代码如下：
```js
function checkForReads ( node, parent ) {
    if ( node.type === 'Identifier' ) {
        // disregard the `bar` in `foo.bar` - these appear as Identifier nodes
        if ( parent.type === 'MemberExpression' && node !== parent.object ) {
            return;
        }

        // disregard the `bar` in { bar: foo }
        if ( parent.type === 'Property' && node !== parent.value ) {
            return;
        }

        const definingScope = scope.findDefiningScope( node.name );

        if ( ( !definingScope || definingScope.depth === 0 ) && !statement._defines[ node.name ] ) {
            statement._dependsOn[ node.name ] = true;
        }
    }
}
```
这个函数的作用就是，如果一个标识符的定义是在顶层或全局作用域中，但是并不是由当前的顶层语句所定义的，就表示这个标识符是一个该顶层语句的依赖项，则将该标识符保存在对应顶层语句所在节点的`_dependsOn`属性中。

举个例子：
```js
const a = 1;

function foo() {
    console.log(a);
}
```
上面这段代码中有2条顶层语句，分别是`VariableDeclaration`和`FunctionDeclaration`。其中，标识符`a`是由第一条语句定义的，并且定义在顶层作用域(`depth`属性为0)中。

在对第二条语句(`FunctionDeclaration`)进行深度遍历时，会出现出现3个标识符符合`checkForReads`的条件检查：`foo`、`console`和`a`。而`foo`是由该顶层语句本身定义的，会出现在`statement._defines`中，所以只剩下`console`和`a`这两个标识符。也就是说，我们的第二条顶层语句依赖于这两个标识符，所以会把这两个标识符保存到这个顶层语句的`_dependsOn`属性中，以便后续使用。

到此，我们就已经清楚了这个`checkForReads`函数的目的了，就是用来搜集顶层语句所依赖的标识符，并把这些依赖保存到`_dependsOn`属性中。取一个时髦的名词就叫**依赖搜集**。

下面分析`checkForWrites`函数：
```js
function checkForWrites ( node ) {
    function addNode ( node, disallowImportReassignments ) {
        while ( node.type === 'MemberExpression' ) {
            node = node.object;
        }

        // disallow assignments/updates to imported bindings and namespaces
        if ( disallowImportReassignments && has( module.imports, node.name ) && !scope.contains( node.name ) ) {
            const err = new Error( `Illegal reassignment to import '${node.name}'` );
            err.file = module.path;
            err.loc = getLocation( module.code.toString(), node.start );
            throw err;
        }

        if ( node.type !== 'Identifier' ) {
            return;
        }

        statement._modifies[ node.name ] = true;
    }

    if ( node.type === 'AssignmentExpression' ) {
        addNode( node.left, true );
    }

    else if ( node.type === 'UpdateExpression' ) {
        addNode( node.argument, true );
    }

    else if ( node.type === 'CallExpression' ) {
        node.arguments.forEach( arg => addNode( arg, false ) );
    }

    // TODO UpdateExpressions, method calls?
}
```
可以看到，当遇到`AssignmentExpression`、`UpdateExpression`以及`CallExpression`节点时，都会调用`addNote`函数，我们就来分析下这个`addNote`函数的代码。

首先，如果传递进来的节点参数是一个成员访问表达式，则将该参数替换成该表达式的最左边的那个标识符。然后根据第二个开关参数来决定是否进行严格的代码审查(也就是不允许对`import`的标识符进行赋值和更新)，然后只过滤出标识符节点，这样就找到了所有可能会被修改的标识符。把这些标识符保存到对应顶层语句所在节点的`_modifies`属性中。

这就是`checkForWrites`函数的目的，我们总结一下：
- `checkForReads` 搜集各个顶层语句所依赖的标识符，并保存在这些语句所在节点的`_dependsOn`属性中。
- `checkForWrites` 搜集各个顶层语句可能会修改的标识符，并保存在这些语句所在节点的`_modifies`属性中。

> 注意：这两类标识符并不是互斥的，比如下面这段代码：
> ```js
> const a = 1;
> 
> function foo() {
>   console.log(a);
>   a = 2;
>   console.log(a);
> }
> ```
> 第二条语句依赖标识符`a`，但同时也会修改该标识符。因此，标识符`a`会同时出现在该语句的`_dependsOn`属性和`_modifies`属性中。

### Module 的构造
`Module`构造函数有3个参数，分别是`path`、`code`和`bundle`，分别表示该模块的路径、代码以及所在的bundle。
这个`code`会被封装到一个`MagicString`实例中，方便后续对代码进行修改以及 sourcemap 的生成。


在构造`Module`实例时，会使用`acorn`去解析该模块的代码，生成 ast 并保存在该`Module`实例上面。由于注释信息并不会包含在 ast 节点上，所以通过`onComment`钩子将这些注释信息存储在实例的`comments`容器中。

然后调用模块内部的`this.analysis()`方法对代码进行分析，在这个方法内部，首先对 ast 的顶层语句进行遍历，提取出该模块的`import/export`信息，分别保存在`Module`实例的`imports`和`exports`容器里面。

其中，`imports`保存该模块**导入**的所有标识符，以`localName`为 key，下面的结构为 value：
```json5
{
  source: '',
  name: '',     // name 对应该标识符在它本身模块内的名字
  localName: '' // localName 对应该标识符在本模块内的名字
}
```

这里，需要对3种不同的`import`语句进行说明一下，它们的`localName`和`name`稍有不同：

1. `import foo from './foo';`
   
   对应**ImportDefaultSpecifier**，这里，`localName`为`foo`，`name`为`default`。
   
2. `import * as baz from './baz';`
   
   对应**ImportNamespaceSpecifier**，这里，`localName`为`baz`，`name`为`*`。

3. `import { bar as f } from './bar';`
   
   对应**ImportSpecifier**，这里，`localName`为`f`，`name`为`bar`。

`exports`保存该模块**导出**的所有标识符，`export`有2种：

1. `export default function foo () {}`

   对应**ExportDefaultDeclaration**

2. `export { foo, bar, baz }`

   对应**ExportNamedDeclaration**

这两种不同的导出，在`exports`中的结构也是不一样的。

**ExportDefaultDeclaration**，以`default`为 key，下面的结构为 value：
```json5
{
  node: Node,
  name: 'default', // default类型的导出，名字固定为default
  localName: id | 'default', // localName对应该标识符在本模块内的名字
  isDeclaration: boolean
}
```
`default`后面的内容是否是一个`Declaration`，会对结构有影响。

**ExportNamedDeclaration**，又分2小类，一种是带`specifier`的，一种是不带的。
比如，
```js
export var foo = 23;
```
这种是不带`specifier`的，`export`后面是一个普通的`Declaration`。这种类型的`export`在`exports`中的结构如下：
以`name`为 key，以下面的结构为 value：
如果后面的声明是一个变量声明，这个`name`就取第一个标识符的名字；否则就取对应声明的标识符。
```json5
{
  node: Node,
  localName: name,
  expression: declaration
}
```

还有一种带`specifier`的，比如下面这样：
```js
const foo = 1, bar = 2;
function baz() {}
export { foo, bar, baz }
```
`export`后面不再是一个声明，而是一个`specifier`数组。这种类型的`export`在`exports`中的结构如下：
以`exportedName`为 key，以下面的结构为 value：
```json5
{
  localName: '',
  exportedName: '',
}
```

`export`还有一个特别的方式，就是下面这样：
```js
export { foo } from './foo';
```
这种语句既有`export`，也有`import`。

分析到这，我们需要总结一下了。

在对模块代码的 ast 分析的第一步，就是提取出该模块所有的`import/export`信息，分别保存在实例的`imports`和`exports`容器中。其中，`imports`中以`localName`为 key，而`exports`中则以`exportedName`为 key。

到这里，我们已经把模块的`import/export`信息解析完毕了，接着就是调用工具函数`analysis`来处理该模块的作用域，以及解析顶层语句的依赖标识符和可能修改的标识符信息，如上面的`analysis.js`所分析的那样。

再然后，将该模块的顶层作用域中定义的`name`列表拷贝一份，存放在模块实例的`definedNames`属性中。

然后，再次对 ast 的顶层语句进行遍历，这次遍历的目的是为了整合我们前面通过`analysis`分析出的`_defines`和`_modifies`数据，将这些信息统一到实例的`definitions`和`modifications`容器中，用来表示整个模块的信息。也即整个模块定义的所有的标识符都保存在`definitions`中，整个模块对`modifications`中的标识符可能会有修改操作。

至此，我们的`Module`实例就构建完成啦。

### Module 中各个方法的分析

#### suggestName
该方法是填充模块的`suggestedNames`容器，容器里面每一个`name`都会有一个合法的标识符

#### expandAllStatements
从名字上看就是展开该模块的所有的语句，内部会调用`expandStatement`对顶层语句继续进行展开操作，中间会跳过一些`import/export`语句的处理。具体是如何展开语句的，要看`expandStatement`的实现。

#### expandStatement
对模块的顶层语句进行展开，具体步骤如下：

1. 先获取该顶层语句的依赖(`_dependsOn`属性)，遍历该依赖列表中的`name`，每一个`name`都会通过`this.define(name)`获取其定义，将其定义添加到数组中，如果该定义来自于别的模块，则将其从对应模块中抽取出来
2. 将该语句本身添加到数组中
3. 然后遍历该语句的定义列表(`_defines`属性)，检查该`name`是否被模块内的其他语句所修改，如果有的话，对所有的修改语句进行遍历，然后展开这些语句(递归调用`expandStatement`)。
4. 最后，返回这个数组。

`expandAllStatements`方法会对一个模块的顶层语句进行调整，按照先依赖，在本身，最后修改该语句的定义来重组顺序，该过程处理完毕之后，入口模块所依赖的其他模块的内容都会被抽取出来放在`this.statements`数组中，然后在调用`this.deconflict();`处理名字冲突就完成了`Bundle`的`build`处理。

#### define

### sequence 工具
`sequence`函数接收2个参数：`array`和`callback`，数组里面的每一项都会调用`callback`进行处理，通过`Promise`链的方式进行串行化处理，最后输出结果数组。比如下面的示例：
```js
const data = [1,2,3,4,5]
sequence(data, (item, index) => {
    return item + index;
}).then(result => {
    // 这里的 result 为 [1, 3, 5, 7, 9]，并且各个项的处理是按照他们的顺序依次处理的
})
```

### finalisers
todo
