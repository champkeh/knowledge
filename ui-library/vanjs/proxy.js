function foo(name, ...args) {
    console.log(name, args)
}

const proxy = new Proxy(foo, {
    get(target, p) {
        return target.bind(undefined, p)
    }
})

const {div, p, span} = proxy
console.log(div, p, span)
div()
span()
p()
