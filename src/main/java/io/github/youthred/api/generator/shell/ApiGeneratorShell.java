package io.github.youthred.api.generator.shell;

import org.springframework.shell.standard.ShellCommandGroup;
import org.springframework.shell.standard.ShellComponent;
import org.springframework.shell.standard.ShellMethod;
import org.springframework.shell.standard.ShellOption;

/**
 * @author https://github.com/youthred
 */
@ShellComponent
@ShellCommandGroup("Api generator")
public class ApiGeneratorShell {

    @ShellMethod(value = "生成HTML，支持无限层级的markdown文件夹", key = "html", prefix = "-")
    public String html(@ShellOption("-p") String path, boolean b) {
        return null;
    }
}
