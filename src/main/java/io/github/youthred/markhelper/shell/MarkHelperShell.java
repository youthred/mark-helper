package io.github.youthred.markhelper.shell;

import cn.hutool.core.io.FileUtil;
import io.github.youthred.markhelper.util.RenderUtil;
import org.springframework.shell.standard.ShellCommandGroup;
import org.springframework.shell.standard.ShellComponent;
import org.springframework.shell.standard.ShellMethod;
import org.springframework.shell.standard.ShellOption;

/**
 * org.springframework.shell.standard.commands.Help#help(java.lang.String)
 *
 * @author https://github.com/youthred
 */
@ShellComponent
@ShellCommandGroup("MarkHelper")
public class MarkHelperShell {

    @ShellMethod(value = "生成HTML，支持无限层级的markdown文件夹", key = "html", prefix = "-")
    public String html(
            @ShellOption(value = {"-i", "--docDirPath"}, help = "MD文档目录绝对路径") String docDirPath,
            @ShellOption(value = {"-o", "--outputDirPath"}, defaultValue = "__NULL__", help = "HTML文档输出目录绝对路径, 默认 同级目录生成 [MD目录同名]-html-[date] 的文件夹") String outputDirPath,
            @ShellOption(value = {"-n", "--targetDirName"}, defaultValue = "__NULL__", help = "输出目录名称, 默认 [MD目录同名]-html-[date]") String targetDirName,
            @ShellOption(value = {"-t", "indexTitle"}, defaultValue = "__NULL__", help = "首页标题, 默认 [MD目录同名]") String indexTitle
    ) {
        if (!FileUtil.exist(docDirPath)) {
            return "目录不存在";
        }
        return "生成位置: " + RenderUtil.render(docDirPath);
    }
}
