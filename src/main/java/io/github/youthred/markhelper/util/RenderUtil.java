package io.github.youthred.markhelper.util;

import cn.hutool.core.bean.BeanUtil;
import cn.hutool.core.date.DatePattern;
import cn.hutool.core.date.LocalDateTimeUtil;
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
import java.time.LocalDateTime;
import java.util.List;
import java.util.regex.Pattern;

/**
 * 文档渲染生成工具类
 *
 * @author https://github.com/youthred
 */
public class RenderUtil {

    public static TemplateEngine ENGINE = TemplateUtil.createEngine(new TemplateConfig("templates", TemplateConfig.ResourceMode.CLASSPATH));

    public static String genOutputDirPath(String docDirPath) {
        return Paths.get(docDirPath).getParent().toAbsolutePath().toFile().getPath();
    }

    public static String genIndexTitle(String docDirPath) {
        return FileUtil.getPrefix(docDirPath);
    }

    public static String genTargetDirName(String docDirPath) {
        return genIndexTitle(docDirPath) + "-html-" + LocalDateTimeUtil.format(LocalDateTime.now(), DatePattern.PURE_DATETIME_FORMATTER);
    }

    /**
     * 在同级目录生成 [MD目录同名]-html-[date] 的文件夹
     *
     * @param docDirPath MD文档目录绝对路径
     * @return 输出路径
     */
    public static String render(String docDirPath) {
        String outputDirPath = genOutputDirPath(docDirPath);
        String indexTitle = genIndexTitle(docDirPath);
        String targetDirName = genTargetDirName(docDirPath);
        String finalOut = renderIndex(docDirPath, outputDirPath, targetDirName, indexTitle);
        renderDocs(docDirPath, outputDirPath, targetDirName);
        return finalOut;
    }

    /**
     * 在目标目录生成 [MD目录同名]-html-[date] 的文件夹
     *
     * @param docDirPath    MD文档目录绝对路径
     * @param outputDirPath HTML文档输出目录绝对路径
     * @return 输出路径
     */
    public static String render(String docDirPath, String outputDirPath) {
        String indexTitle = genIndexTitle(docDirPath);
        String targetDirName = genTargetDirName(docDirPath);
        String finalOut = renderIndex(docDirPath, outputDirPath, targetDirName, indexTitle);
        renderDocs(docDirPath, outputDirPath, targetDirName);
        return finalOut;
    }

    /**
     * 在目标目录生成 [输出目录名称] 的文件夹
     *
     * @param docDirPath    MD文档目录绝对路径
     * @param outputDirPath HTML文档输出目录绝对路径
     * @param targetDirName 输出目录名称
     * @return 输出路径
     */
    public static String render(String docDirPath, String outputDirPath, String targetDirName) {
        String finalOut = renderIndex(docDirPath, outputDirPath, targetDirName, targetDirName);
        renderDocs(docDirPath, outputDirPath, targetDirName);
        return finalOut;
    }

    /**
     * 在目标目录生成 [输出目录名称] 的文件夹
     *
     * @param docDirPath    MD文档目录绝对路径
     * @param outputDirPath HTML文档输出目录绝对路径
     * @param targetDirName 输出目录名称
     * @param indexTitle    首页标题
     * @return 输出路径
     */
    public static String render(String docDirPath, String outputDirPath, String targetDirName, String indexTitle) {
        String finalOut = renderIndex(docDirPath, outputDirPath, targetDirName, indexTitle);
        renderDocs(docDirPath, outputDirPath, targetDirName);
        return finalOut;
    }

    /**
     * 公共提取 渲染首页
     *
     * @param docDirPath    MD文档目录绝对路径
     * @param outputDirPath HTML文档输出目录绝对路径
     * @param targetDirName 输出目录名称
     * @param indexTitle    首页标题
     * @return 输出路径
     */
    private static String renderIndex(String docDirPath, String outputDirPath, String targetDirName, String indexTitle) {
        String dirTocHtmlExt = MdUtil.genDirTocHtmlExt(docDirPath, false);
        Index index = new Index()
                .setTitle(indexTitle)
                .setDirTocHtml(dirTocHtmlExt);
        List<String> dirTocHrefs = ReUtil.findAllGroup0(Pattern.compile("docs/.*html"), dirTocHtmlExt);
        if (CollectionUtils.isNotEmpty(dirTocHrefs)) {
            index.setFirstDocPath(dirTocHrefs.get(0));
        }
        return renderIndex(outputDirPath, targetDirName, index);
    }

    /**
     * 公共提取 渲染所有文档
     *
     * @param docDirPath    MD文档目录绝对路径
     * @param outputDirPath HTML文档输出目录绝对路径
     * @param targetDirName 输出目录名称
     */
    private static void renderDocs(String docDirPath, String outputDirPath, String targetDirName) {
        MdUtil.getMdsPaths(docDirPath).forEach(mdPath -> {
            String docTitle = FileUtil.getPrefix(mdPath);
            renderDoc(outputDirPath, targetDirName, MdUtil.fileNamePrefixToAnchorId(FileUtil.getPrefix(mdPath)),
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
     * @return 输出路径
     */
    private static String renderIndex(String outputDirPath, String targetDirName, Index index) {
        String dir = outputDirPath + "\\" + targetDirName + "\\";
        FileUtil.copy("templates/static", dir, true);
        Template template = ENGINE.getTemplate("index.html");
        template.render(BeanUtil.beanToMap(index), Paths.get(dir + "index.html").toFile());
        return dir;
    }

    /**
     * 渲染生成[md-file-name].html
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
