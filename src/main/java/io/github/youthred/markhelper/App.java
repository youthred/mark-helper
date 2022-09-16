package io.github.youthred.markhelper;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Import;

@SpringBootApplication
@Slf4j
@Import(cn.hutool.extra.spring.SpringUtil.class)
public class App {

    public static void main(String[] args) {
        System.setProperty("org.jline.terminal.dumb", "true");
        SpringApplication.run(App.class, args);
    }
}
