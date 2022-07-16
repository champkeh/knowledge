## Virtual DOM:

There's some benefits of having a virtual DOM layer. The most important one is:

1. Decouples rendering logic from the actual DOM - makes it straightforward to reuse
it in non-browser environments, e.g. rendering to a string (SSR), rendering to
canvas/WebGL, or native mobile rendering.

Another important aspect about virtual DOM

2. Provides the ability to programmatically construct, inspect, clone and create
derivative structures using the full power of JavaScript.

Now, this ability is important because there will eventually be certain cases in
UI programming, where the template syntax will be somewhat limiting, and you just
need to have the full flexibility of a proper programming language to express the
underlying logic.
Now, such cases are in fact, pretty rare in day-to-day UI development. It happens
more often when you are authoring a library, or authoring a UI component suite
that you intend to ship to be used by third party developers.

## Render function: 
in Vue 2 API:
```
render(h) {
    return h('div', {
        attrs: {
            id: 'foo'
        },
        on: {
            click: this.onClick
        }
    }, 'hello')
}
```

in Vue 3 API:
- Flat props structure
- Globally imported `h` helper
```
import { h } from 'vue'

render() {
    return h('div', {
        id: 'foo',
        onClick: this.onClick
    }, 'hello')
}
```
