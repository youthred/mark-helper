package io.github.youthred.api.generator.util;

import cn.hutool.core.bean.BeanUtil;
import cn.hutool.core.io.FileUtil;
import cn.hutool.extra.template.Template;
import cn.hutool.extra.template.TemplateConfig;
import cn.hutool.extra.template.TemplateEngine;
import cn.hutool.extra.template.TemplateUtil;
import io.github.youthred.api.generator.o.Index;

import java.nio.file.Paths;

/**
 * @author https://github.com/youthred
 */
public class ThymeleafUtil {

    public static TemplateEngine ENGINE = TemplateUtil.createEngine(new TemplateConfig("templates", TemplateConfig.ResourceMode.CLASSPATH));

    public static void render(String docDirPath, String outputDirPath) {
        String title = FileUtil.getPrefix(docDirPath);
        renderIndex(outputDirPath, title,
                new Index()
                        .setTitle(title)
                        .setDirTocHtml(MdUtil.genDirTocHtmlExt(docDirPath, false))
        );
    }

    /**
     * 渲染生成index.html
     *
     * @param outputDirPath 输出目录绝对路径
     * @param outputDirName 输出目录文件夹名称
     * @param index         Index Object
     */
    private static void renderIndex(String outputDirPath, String outputDirName, Index index) {
        String dir = outputDirPath + "\\" + outputDirName + "\\";
        FileUtil.copy("templates/static", dir, true);
        Template template = ENGINE.getTemplate("index.html");
        template.render(BeanUtil.beanToMap(index), Paths.get(dir + "index.html").toFile());
    }

    /**
     * 渲染生成index.html
     *
     * @param outputDirPath 输出目录绝对路径
     * @param outputDirName 输出目录文件夹名称
     * @param index         Index Object
     */
    private static void renderDocs(String outputDirPath, String outputDirName, Index index) {
        String dir = outputDirPath + "\\" + outputDirName + "\\";
        Template template = ENGINE.getTemplate("doc.html");
        template.render(BeanUtil.beanToMap(index), Paths.get(dir + "index.html").toFile());
    }
}
