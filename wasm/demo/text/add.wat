(module
  (import "console" "log" (func $log (param i32)))
  (func $add (export "add") (param $lhs i32) (param $rhs i32) (result i32)
    local.get $lhs
    local.get $rhs
    i32.add)
  (func (export "addPlus1") (param i32 i32) (result i32)
  local.get 0
  local.get 1
  call $add
  i32.const 1
  i32.add)
  (func (export "logIt") (param i32)
  local.get 0
  call $log)
)
