package io.github.youthred.markhelper.util;

import cn.hutool.core.bean.BeanUtil;
import cn.hutool.core.io.FileUtil;
import cn.hutool.core.util.ReUtil;
import cn.hutool.extra.template.Template;
import cn.hutool.extra.template.TemplateConfig;
import cn.hutool.extra.template.TemplateEngine;
import cn.hutool.extra.template.TemplateUtil;
import io.github.youthred.markhelper.common.DirConstant;
import io.github.youthred.markhelper.o.Doc;
import io.github.youthred.markhelper.o.Index;
import org.apache.commons.collections4.CollectionUtils;

import java.nio.file.Paths;
import java.util.List;
import java.util.regex.Pattern;

/**
 * @author https://github.com/youthred
 */
public class ThymeleafUtil {

    public static TemplateEngine ENGINE = TemplateUtil.createEngine(new TemplateConfig("templates", TemplateConfig.ResourceMode.CLASSPATH));

    public static void render(String docDirPath, String outputDirPath) {
        // 生成index
        String targetDirName = FileUtil.getPrefix(docDirPath);
        String dirTocHtmlExt = MdUtil.genDirTocHtmlExt(docDirPath, false);
        Index index = new Index()
                .setTitle(targetDirName)
                .setDirTocHtml(dirTocHtmlExt);
        List<String> dirTocHrefs = ReUtil.findAllGroup0(Pattern.compile("docs/.*html"), dirTocHtmlExt);
        if (CollectionUtils.isNotEmpty(dirTocHrefs)) {
            index.setFirstDocPath(dirTocHrefs.get(0));
        }
        renderIndex(outputDirPath, targetDirName, index);

        // 生成docs
        MdUtil.getDocsPaths(docDirPath).forEach(mdPath -> {
            String docTitle = FileUtil.getPrefix(mdPath);
            renderDoc(outputDirPath, targetDirName, FileUtil.getPrefix(mdPath),
                    new Doc()
                            .setTitle(docTitle)
                            .setMdHtml(MdUtil.mdToHtmlByPath(mdPath))
                            .setTocHtml(MdUtil.genTocHtml(mdPath, false))
            );
        });
    }

    /**
     * 渲染生成index.html
     *
     * @param outputDirPath 输出目录绝对路径
     * @param targetDirName 输出目标文件夹名称
     * @param index         Index Object
     */
    private static void renderIndex(String outputDirPath, String targetDirName, Index index) {
        String dir = outputDirPath + "\\" + targetDirName + "\\";
        FileUtil.copy("templates/static", dir, true);
        Template template = ENGINE.getTemplate("index.html");
        template.render(BeanUtil.beanToMap(index), Paths.get(dir + "index.html").toFile());
    }

    /**
     * 渲染生成[doc].html
     *
     * @param outputDirPath  输出目录绝对路径
     * @param targetDirName  输出目标文件夹名称
     * @param fileNamePrefix HTML文件名称(不带后缀)
     * @param doc            Doc Object
     */
    private static void renderDoc(String outputDirPath, String targetDirName, String fileNamePrefix, Doc doc) {
        String dir = outputDirPath + "\\" + targetDirName + "\\" + DirConstant.DOCS + "\\";
        Template template = ENGINE.getTemplate("docs/doc.html");
        template.render(BeanUtil.beanToMap(doc), Paths.get(dir + fileNamePrefix + ".html").toFile());
    }
}
