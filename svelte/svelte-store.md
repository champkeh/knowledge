# Svelte 中组件间状态共享及 Store 源码分析

## 背景介绍
Svelte 中的 Store 是作为一种跨组件共享状态的机制，具有 `Reactivity` 特性，可类比于 Vue 中的`Vuex`和 React 中的`Redux`。

核心就是**发布订阅模式**

## 初步实现
```js
// subscribe.js
const subscribes = []
let value
export function subscribe(fn) {
    subscribes.push(fn)
    fn(value)
    
    return function unsubscribe() {
        subscribes.splice(subscribes.indexOf(fn), -1)
    }
}
export function update(fn) {
    set(fn(value))
}
export function set(newValue) {
    value = newValue
    
    subscribes.forEach(fn => {
        fn(value)
    })
}
```

以上就是一个最简单的发布订阅模式的实现。

我们通过`subscribe`函数注册订阅者，将订阅者保存在内部的`subscribes`数组中，并使用`value`的当前值同步调用该订阅者，然后返回一个取消订阅的函数，当该函数被调用时，将注册的函数移除，后续`value`的修改不再通知该订阅者。

我们通过`update`和`set`函数来更新`value`的值，值被更新之后，通过通知所有的订阅者。


```sveltehtml
<script>
    import {onMount} from 'svelte'
    import {subscribe, set} from './subscribe.js'
    
    let value
    onMount(() => {
        subscribe(v => {
            value = v
        })
    })
</script>
<h1>value: {value}</h1>
<input on:input={(e) => set(e.target.value)} />
```


