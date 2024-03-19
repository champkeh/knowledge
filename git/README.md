# git

## 相关工具
- [LearnGitBranch 在线沙盒工具](https://learngitbranching.js.org/?NODEMO)

## 基础知识
文件的几个重要状态：
1. 未跟踪(??)
2. 已跟踪
    - 已修改(modified/unstaged)(红色)
    - 已暂存(staged)(绿色)
    - 已提交(committed)

## git status -s
查看当前文件状态

## git commit --amend
修正最后一次commit信息(包括追加changes和修改message)

> 如果该 `commit` 已经 `push` 到远程的话，再次 `push` 时需要添加 `-f` 选项，因为 `amend` 会修改历史。


## git reset HEAD `file`
取消暂存暂存区中的文件
比如想把已经暂存的文件分2次提交

> 没有 `--hard` 选项的 `reset` 命令并不危险

## git restore --staged `file`
同上，取消暂存文件

> 关于这两个命令的区别，可以查看 https://stackoverflow.com/questions/58003030/what-is-the-git-restore-command-and-what-is-the-difference-between-git-restor

## git add -i
进入交互式模式，也可以选择暂存/取消暂存文件

## git remote show `origin`
查看远程仓库的详细信息

这个命令列出了当你：
- 执行 `git pull` 时，哪些分支会自动合并；
- 执行 `git push` 时，会自动推送到哪一个远程分支；
- 哪些远程分支不在你的本地；
- 哪些远程分支已经被移除了。

```text
* remote origin
  Fetch URL: git@github.com:champkeh/learn-git.git
  Push  URL: git@github.com:champkeh/learn-git.git
  HEAD branch: master
  Remote branch:
    master tracked
  Local branch configured for 'git pull':
    master merges with remote master
  Local ref configured for 'git push':
    master pushes to master (up to date)

```

## git tag -a v1.0 -m 'my version 1.0'
打标签

## git co -b v2 v2.0
切换到特定标签

## 删除分支
`git branch -d <分支名>` 删除已合并的分支  
`git branch -D <分支名>` 强制删除(未合并的分支)

## 删除远程分支
`git push origin --delete <分支名>`

## 合并不同分支的两种方式：`merge` 与 `rebase`

`git rebase <target brach> <branch>`  
将 `branch` 分支上的 `commit` 在 `target branch` 分支上进行"重放"，并将 `branch` 分支指向最新的 `commit`.
如果产生冲突，解决冲突后执行 `git rebase --continue` 继续 `rebase`.

## 切换到指定的commit
`git checkout <hash>`


## 引用提交对象

### 通过 `sha-1` 哈希值进行引用

```text
git show 44f40fcaadd4a82a576ad2cc593134d561bbd66e
git show 44f40f
```

### 通过分支名引用

```text
git show master
```

### 通过引用日志引用

引用日志是一个日志文件，用来记录 `HEAD` 和分支引用所指向的历史。可以通过下面的命令查看：

```shell
$ git reflog
734713b HEAD@{0}: commit: fixed refs handling, added gc auto, updated
d921970 HEAD@{1}: merge phedders/rdocs: Merge made by recursive.
1c002dd HEAD@{2}: commit: added some blame and merge stuff
1c36188 HEAD@{3}: rebase -i (squash): updating HEAD
95df984 HEAD@{4}: commit: # This is a combination of two commits.
1c36188 HEAD@{5}: rebase -i (squash): updating HEAD
7e05da5 HEAD@{6}: rebase -i (pick): updating HEAD
```

```text
git show HEAD@{5}
// 等价于
git show 1c36188
```

### 祖先引用

```text
git show HEAD^
```

通过 `^` 符号来引用 `HEAD` 的上一个提交，也就是 `HEAD` 所指向的那个 `commit` 对象的 `parent` 对象。

> 对于一个 `merge commit` 对象，会存在2个父对象，因此，该语法支持在 `^` 后面添加一个数字来指明是哪个父对象。
> 比如，`git show d921970^2` 会显示你合并的那个分支上的那个父对象，而 `git show d921970^` 显示的是你合并时所在的那个分支上的父对象。
>
> 注意，`d921970^0` 和 `d921970` 相同

引用祖先提交的另一种语法是 `~`，和 `^` 一样，也是指向第一父提交。不过区别是，`~` 可以方便的连续向上指定多级，比如
`git show HEAD~3` 显示的是 `HEAD` 上面3级的父提交，等价于 `git show HEAD^^^`，也即是 `HEAD` 的第一父提交的第一父提交的第一父提交。

> 当只有一级时，`HEAD~` 和 `HEAD^` 是完全相同的。
> 你也可以组合这两种语法，比如，`git show HEAD~3^2` 来显示之前引用的第二父提交。(假设 `HEAD~3` 是一个 `merge commit`)


## 提交区间
使用提交区间可以解决譬如“这个分支还有哪些提交尚未合并到主分支？”这样的问题。

### 双点

这种语法可以选出在一个分支中而不在另一个分支中的提交。

例如，你有如下的提交历史：
![双点](assets/double-dot.png)

你可以使用 `master..experiment` 来选择 `experiment` 分支中还没有合并到 `master` 分支中的提交，
也就是在 `experiment` 分支中而不在 `master` 分支中的提交，即 `C` 和 `D`。

这可以让你查看即将要合并的内容。
```shell
$ git log master..experiment
D
C
```
说明，你需要合并 `D` 和 `C` 到 `master` 分支。


你也可以调用顺序，比如：
```shell
$ git log experiment..master
F
E
```

另一个常见的场景是，查看你即将推送到远程的内容：
```shell
$ git log origin/master..HEAD
```
这个命令会列出在你当前分支中而不在远程 `origin/master` 中的提交。

> `..` 语法的任意一边都可以留空，比如 `git log origin/master..` 或者 `git log ..origin/master`，这种情况下，
> 留空的那一边会默认是 `HEAD`.

### 多点

多点语法允许你指定超过2个以上的引用，是对双点语法的扩展。比如：

```shell
$ git log refA..refB
$ git log refB ^refA
$ git log refB --not refA
```
以上语法是完全等价的，都是选择在 `refB` 分支中的提交而不在 `refA` 分支中的提交。

而多点语法允许更强大的查询，比如：
```shell
$ git log refA refB ^refC
$ git log refA refB --not refC
```
可以查看所有被 `refA` 或 `refB` 包含，但不被 `refC` 包含的提交。


### 三点

这个语法可以选择出被两个引用中的一个包含，但又不被两者同时包含的提交。

比如之前的那个提交历史，如果想看 `master` 或者 `experiment` 中包含的，但不是两者共有的提交，你可以执行：
```shell
$ git log master...experiment
F
E
D
C
```

> 这个语法通常配合 `--left-right` 参数，可以显示每个提交到底是属于哪一侧的分支。
> ```shell
> $ git log --left-right master...experiment
> < F
> < E
> > D
> > C
>```


## stash 隐藏修改

### 从储藏创建分支

```text
git stash branch <branchName>
```

有时候直接`stash apply`可能会和当前的代码产生冲突，不得不立即去解决冲突。这时候，我们可以创建出一个分支，在这个分支上检出`stash`时所在的提交，然后重新`apply stash`，然后就可以扔掉这些 `stash` 了。


## 重写历史

> 在你 `push` 到远程之前做这件事。

### 修改最后一次提交

对于你的最近一次提交，你通常想做两件事情：
1. 修改提交信息
2. 修改你之前添加/修改/移除的文件快照

`git commit --amend`


### 修改多个提交信息

进入交互式变基模式：

```text
git rebase -i HEAD~3
```

然后将想要修改的提交前面的 `pick` 改为 `eidt` 保存退出，然后在对应 `commit` 停下的地方执行
`git commit --amend` 修改这个提交，之后继续 `git rebase --continue`，处理所有 `edit` 的提交即可。


### 压缩提交

进入交互式变基模式，将想要压缩的 `pick` 改为 `squash` 即可。


## 关于 `detached HEAD`

正常情况下，`HEAD` 都是指向一个分支名，而不是直接指向一个 `commit`，这样你在提交一个新的 `commit` 的时候，当前分支会自动移动到新的 `commit` 上，而 `HEAD` 由于是指向的分支名字，所以也就指向了最新的 `commit`。
但如果你通过某种方式让 `HEAD` 指向了一个 `commit`，这个时候，`HEAD` 的状态就是 `detached`，也就是和分支名分离了。

此时，如果你提交了一个新的 `commit`，那么 `HEAD` 会自动移动来指向这个新的 `commit`，因为没有分支指向这个 `commit`，所以此时进行 `checkout` 是危险的，因为 `checkout` 之后 `HEAD` 就指向了新的 `commit`
之前的那个 `commit` 就没有任何引用指向它啦，就成为一个 `悬挂 commit`，随着时间的推移，最终会被垃圾收集器回收掉。

当然，我们可以通过 `git reflog` 命令找回它的 <sha1>，然后创建一个新的分支指向它。
```text
git branch <newBranchName> <sha1>
```

## 参考资料
- [git concepts simplified](https://gitolite.com/gcs.html) (打开页面后记得按 `A` 键切换成单页模式阅读)
- [Pro Git](https://www.progit.cn/)
