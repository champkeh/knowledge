(module
  (func $1 (import "imports" "imported_func") (param i32))
  (func (export "exported_func")
    i32.const 42
    call $1)
)
