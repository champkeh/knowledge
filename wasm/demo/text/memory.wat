(module
  (import "console" "log" (func $log (param i32)))
  (import "js" "mem" (memory 1))
  (data (i32.const 0) "abc喜欢你abc")
  (func (export "writeHi")
    i32.const 0
    call $log)
)
