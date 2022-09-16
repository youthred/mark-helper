# MarkHelper

> Markdown助手
> 
> 将整个Markdown文件夹生成为静态HTML

公共命令

``` text
Built-In Commands
        clear: Clear the shell screen.
        exit, quit: Exit the shell.
        help: Display help about available commands.
        history: Display or save the history of previously run commands
        script: Read and execute commands from a file.
        stacktrace: Display the full stacktrace of the last error.
```

`help` 获取帮助

``` text
NAME
	help - Display help about available commands.

SYNOPSYS
	help [[-C] string]  

OPTIONS
	-C or --command  string
		The command to obtain help for.
		[Optional, default = <none>]
```

`html` 生成HTML，支持无限层级的markdown文件夹

``` text
NAME
	html - 生成HTML，支持无限层级的markdown文件夹

SYNOPSYS
	html [-i] string  [[-o] string]  [[-n] string]  [[-t] string]  

OPTIONS
	-i or --docDirPath  string
		MD文档目录绝对路径
		[Mandatory]

	-o or --outputDirPath  string
		HTML文档输出目录绝对路径, 默认 同级目录生成 [MD目录同名]-html-[date] 的文件夹
		[Optional, default = <none>]

	-n or --targetDirName  string
		输出目录名称, 默认 [MD目录同名]-html-[date]
		[Optional, default = <none>]

	-t or indexTitle  string
		首页标题, 默认 [MD目录同名]
		[Optional, default = <none>]
```
