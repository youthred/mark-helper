package io.github.youthred.markhelper.shell;

import cn.hutool.core.io.FileUtil;
import io.github.youthred.markhelper.util.RenderUtil;
import org.apache.commons.lang3.StringUtils;
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

    @ShellMethod(value = "生成HTML, 支持无限层级的markdown文件夹. 可直接使用命令 'html [路径]' 而无需显式拼写命令选项, 其他选项也可省略但值的顺序不可变", key = "html", prefix = "-")
    public String html(
            @ShellOption(value = {"-i", "--docDirPath"}, help = "MD文档目录绝对路径, 反斜杠需自行转义, 默认 同级目录生成 [MD目录同名]-html-[date] 的文件夹") String docDirPath,
            @ShellOption(value = {"-o", "--outputDirPath"}, defaultValue = "__NULL__", help = "HTML文档输出目录绝对路径, 反斜杠需自行转义, 默认 同级目录生成 [MD目录同名]-html-[date] 的文件夹") String outputDirPath,
            @ShellOption(value = {"-n", "--targetDirName"}, defaultValue = "__NULL__", help = "输出目录名称") String targetDirName,
            @ShellOption(value = {"-t", "--indexTitle"}, defaultValue = "__NULL__", help = "首页标题") String indexTitle
    ) {
        if (!FileUtil.exist(docDirPath)) {
            return "目录不存在";
        }
        outputDirPath = StringUtils.isBlank(outputDirPath) ? RenderUtil.genOutputDirPath(docDirPath) : outputDirPath;
        targetDirName = StringUtils.isBlank(targetDirName) ? RenderUtil.genTargetDirName(docDirPath) : targetDirName;
        indexTitle = StringUtils.isBlank(indexTitle) ? RenderUtil.genIndexTitle(docDirPath) : indexTitle;
        return "生成位置: " + RenderUtil.render(docDirPath, outputDirPath, targetDirName, indexTitle);
    }
}
