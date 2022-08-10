// const regexp = /^(\d+)*$/
const regexp = /^((?=(?<num>\d+))\k<num>)*$/
const str = "0123456789012345678901234567890123456a"

console.log(regexp.test(str))

const test = /reg(ular expressions?|ex(p|es)?)/
