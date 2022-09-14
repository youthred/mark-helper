package io.github.youthred.api.generator;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@Slf4j
public class App {

    public static void main(String[] args) {
        System.setProperty("org.jline.terminal.dumb", "true");
        SpringApplication.run(App.class, args);
    }
}
