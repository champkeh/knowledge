## Man手册导出html文件
```shell
cat /usr/share/man/man1/man.1 | groff -mandoc -Thtml > man.html
```

```shell
gunzip --to-stdout /usr/share/man/man1/man.1.gz | groff -mandoc -Thtml > man.html
```
> https://apple.stackexchange.com/questions/315272/can-man-pages-be-converted-to-html-and-or-pdf-format
