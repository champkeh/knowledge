/**
 * Special Characters (共12个)
 * 这些特殊字符也被称为是元字符(metacharacters)，单独使用时通常都会报错。
 * 如果确实需要把它作为字面量字符使用，需要使用 \ 进行转义。
 *
 * 1.  \
 * 2.  ^
 * 3.  $
 * 4.  .
 * 5.  |
 * 6.  ?
 * 7.  *
 * 8.  +
 * 9.  (
 * 10. )
 * 11. [
 * 12. {
 */

/**
 * 字母表
 *
 * Oct  Hex     Char
 * 1    01      A
 * 2    02      B
 * 3    03      C
 * 4    04      D
 * 5    05      E
 * 6    06      F
 * 7    07      G
 * 8    08      H
 * 9    09      I
 * 10   0A      J
 * 11   0B      K
 * 12   0C      L
 * 13   0D      M
 * 14   0E      N
 * 15   0F      O
 * 16   10      P
 * 17   11      Q
 * 18   12      R
 * 19   13      S
 * 20   14      T
 * 21   15      U
 * 22   16      V
 * 23   17      W
 * 24   18      X
 * 25   19      Y
 * 26   1A      Z
 */

/**
 * Non-Printable Characters(不可打印字符/控制字符)
 *
 * \t => ASCII 0x09
 * \r => ASCII 0x0D
 * \n => ASCII 0x0A
 * \a => ASCII 0x07
 * \e => ASCII 0x1B
 * \f => ASCII 0x0C
 * \v => ASCII 0x0B (不同的正则引擎有不同的解释)
 *
 * 还有大部分引擎支持用 \cA ~ \cZ 来表示 ASCII 的控制字符，也就是 Control+A 到 Control+Z
 * 这个范围，等价于 \x01 ~ \x1A (共26个字符).
 * 比如，\cM 等价于 \r，都是表示 \x0D 这个不可打印字符。
 *
 * \c@ ~ \c_ 这个范围是比 \cA ~ \cZ 更宽的范围，可以匹配 0x00 ~ 0x1F，可以对照 ASCII 中
 * 的控制字符表插入符号表示法(https://en.wikipedia.org/wiki/ASCII)。
 *
 * 再宽的范围就不推荐了，因为不同的引擎有不同的解释。比如，有的是取该字符的最低5bit来映射到0x00~0x1F
 * 这个范围，有的是对该字符进行0x40翻转(flip bit 0x40)。
 * 这两种操作的结果是不同的，比如 \c* 第一种操作对应的字符是\x0A，第二种操作对应的字符是\x6A
 */
let r = /\c*/

/**
 * How a Regex Engine Works Internally
 *
 * A regex-directed engine walks through the regex, attempting to match the next
 * token in the regex to the next character. If a match is found, the engine
 * advances through the regex and the subject string. If a token fails to match,
 * the engine *backtracks* to a previous position in the regex and the subject
 * string where it can try a different path through the regex.
 *
 * 和回溯有关的特性有：atomic grouping / possessive quantifiers
 *
 * A text-directed engine walks through the subject string, attempting all
 * permutations of the regex before advancing to the next character in the string.
 * A text-directed engine never backtracks. Thus, there isn't much to discuss
 * the matching process of a text-directed engine.
 *
 * The regex engine always returns the *leftmost* match.
 * This is a very important point to understand: a regex engine always returns
 * the leftmost match, even if a "better" match could be found later. When applying
 * a regex to a string, the engine starts at the first character of the string.
 * It tries all possible permutations of the regular expression at the first
 * character. Only if all possibilities have been tried and found to fail, does
 * the engine continue with the second character in the text. Again, it tries
 * all possible permutations of the regex, in exactly the same order. The result
 * is that the regex engine returns the *leftmost* match.
 *
 * 举个例子：
 * 当用正则表达式 /cat/ 去匹配字符串 'He captured a catfish for his cat.' 时，过程如下:
 * 引擎尝试匹配正则的第一个 token(c) 与字符串的第一个字符(H)，匹配失败。由于这个 token 只包含
 * 字面量字符，所以不存在其他可能的排列，因此引擎会尝试匹配字符串的下一个字符，也就是e，c与e也
 * 不匹配，失败。同理，空格也匹配失败。到达字符串的第4个字符时，token 与这个字符匹配上了，引擎
 * 会尝试匹配下一个 token(a) 与下一个字符(a)，也匹配上了。继续，token(t)与字符(p) 不匹配。
 * 此时，引擎知道这个正则不匹配从字符串的第四个字符开始的子串，所以引擎会回到第5个字符的位置从头
 * 开始匹配，token(c) 不匹配字符(a)，token(c) 不匹配字符(p)，以此类推，直到 token(c) 匹配
 * 到第15个字符(c)时，又一次匹配上了。重复上面的过程，第二个 token(a) 与第16个字符(a)匹配，
 * 第三个 token(t) 与第17个字符(t)匹配。正则的所有 token 匹配完毕，因此位于第15个字符的子串
 * cat匹配这个这个正则，引擎会急切的报告这个匹配结果，并且不再往下继续匹配了。
 *
 */

/**
 * Character Class
 *
 * Negated Character Class
 * 反向字符类可以匹配到不可见字符\n，这一点与元字符.不同(.在默认模式下不能匹配换行符\n)
 * 如果不想让反向字符类匹配到换行符，则需要把\n包含进字符类中，比如[^0-9\r\n]
 *
 * 字符类中的元字符:
 * 1. ]
 * 2. \
 * 3. ^
 * 4. -
 *
 * Repeating Character Classes
 * If you repeat a character class by using the ?, * or + operators, you're
 * repeating the entire character class. You're not repeating just the character
 * that it matched.
 * If you want to repeat the matched character, rather than the class, you need
 * to use backreference.
 *
 */

/**
 * Character Class Subtraction 字符类减法
 *
 * JavaScript 不支持
 *
 * 语法:
 * [class-[subtract]]
 *
 */

/**
 * Character Class Intersection 字符类交集
 *
 * JavaScript 不支持
 *
 * 语法:
 * [class&&[intersect]]
 */

/**
 * Shorthand Character Class 字符类简写
 *
 * \d => [0-9]
 * \w => [A-Za-z0-9_]
 * \s => [ \t\r\n\f\v] 注意: JS中 \s 也包含所有的 Unicode 空白字符
 *
 *
 * Negated Shorthand Character Classes
 *
 * \D => [^\d]
 * \W => [^\w]
 * \S => [^\s]
 *
 *
 * More Shorthand Character Classes
 *
 * JavaScript 不支持
 */

/**
 * Dot
 *
 * . 匹配几乎任意字符
 */

/**
 * Anchors 锚点
 *
 * 锚点不是匹配字符的，而是匹配位置的。
 * ^ 匹配字符串的第一个字符前面的位置
 * $ 匹配字符串的最后一个字符后面的位置
 *
 * 默认模式下，这两个锚点匹配字符串的开头和结尾，通过开启多行模式，可以重新定义这两个锚点的意义
 * 在多行模式下，^不仅会匹配字符串开头，还会匹配行的开头(也就是字符\n之后的位置)，$类似。
 */
