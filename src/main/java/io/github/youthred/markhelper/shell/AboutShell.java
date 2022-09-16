//package io.github.youthred.markhelper.shell;
//
//import cn.hutool.json.JSONUtil;
//import lombok.RequiredArgsConstructor;
//import org.springframework.boot.info.BuildProperties;
//import org.springframework.shell.standard.ShellCommandGroup;
//import org.springframework.shell.standard.ShellComponent;
//import org.springframework.shell.standard.ShellMethod;
//
///**
// * @author https://github.com/youthred
// */
//@ShellComponent
//@ShellCommandGroup("About")
//@RequiredArgsConstructor
//public class AboutShell {
//
//    private final BuildProperties buildProperties;
//
//    @ShellMethod(value = "关于", key = "about", prefix = "-")
//    public String html() {
//        return JSONUtil.toJsonPrettyStr(buildProperties);
//    }
//}
