export default function print() {
    import('./foo').then(({default: foo}) => {
        console.log(foo)
    })
}
