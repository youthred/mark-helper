package io.github.youthred.api.generator.util;

import cn.hutool.core.collection.CollUtil;
import cn.hutool.core.io.FileUtil;
import cn.hutool.core.util.StrUtil;
import com.github.houbb.markdown.toc.core.impl.AtxMarkdownToc;
import com.github.houbb.markdown.toc.util.MdTocTextHelper;
import com.github.houbb.markdown.toc.vo.TocGen;
import com.vladsch.flexmark.ext.abbreviation.AbbreviationExtension;
import com.vladsch.flexmark.ext.admonition.AdmonitionExtension;
import com.vladsch.flexmark.ext.anchorlink.AnchorLinkExtension;
import com.vladsch.flexmark.ext.aside.AsideExtension;
import com.vladsch.flexmark.ext.attributes.AttributesExtension;
import com.vladsch.flexmark.ext.autolink.AutolinkExtension;
import com.vladsch.flexmark.ext.definition.DefinitionExtension;
import com.vladsch.flexmark.ext.emoji.EmojiExtension;
import com.vladsch.flexmark.ext.enumerated.reference.EnumeratedReferenceExtension;
import com.vladsch.flexmark.ext.escaped.character.EscapedCharacterExtension;
import com.vladsch.flexmark.ext.footnotes.FootnoteExtension;
import com.vladsch.flexmark.ext.gfm.issues.GfmIssuesExtension;
import com.vladsch.flexmark.ext.gfm.strikethrough.StrikethroughExtension;
import com.vladsch.flexmark.ext.gfm.tasklist.TaskListExtension;
import com.vladsch.flexmark.ext.gfm.users.GfmUsersExtension;
import com.vladsch.flexmark.ext.gitlab.GitLabExtension;
import com.vladsch.flexmark.ext.ins.InsExtension;
import com.vladsch.flexmark.ext.jekyll.front.matter.JekyllFrontMatterExtension;
import com.vladsch.flexmark.ext.jekyll.tag.JekyllTagExtension;
import com.vladsch.flexmark.ext.macros.MacrosExtension;
import com.vladsch.flexmark.ext.media.tags.MediaTagsExtension;
import com.vladsch.flexmark.ext.superscript.SuperscriptExtension;
import com.vladsch.flexmark.ext.tables.TablesExtension;
import com.vladsch.flexmark.ext.typographic.TypographicExtension;
import com.vladsch.flexmark.ext.wikilink.WikiLinkExtension;
import com.vladsch.flexmark.ext.xwiki.macros.MacroExtension;
import com.vladsch.flexmark.ext.yaml.front.matter.YamlFrontMatterExtension;
import com.vladsch.flexmark.ext.youtube.embedded.YouTubeLinkExtension;
import com.vladsch.flexmark.html.HtmlRenderer;
import com.vladsch.flexmark.parser.Parser;
import com.vladsch.flexmark.util.ast.Node;
import com.vladsch.flexmark.util.data.DataHolder;
import com.vladsch.flexmark.util.data.MutableDataSet;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.StringUtils;

import java.io.File;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/**
 * For flexmark-java
 *
 * @author https://github.com/youthred
 */
public class MdUtil {

    /**
     * markdown格式转变成HTML格式
     *
     * @param mdRaw md raw
     * @return rendered html
     */
    public static String mdToHtml(String mdRaw) {
        final DataHolder OPTIONS = new MutableDataSet()
                .set(Parser.EXTENSIONS, Arrays.asList(
                        AbbreviationExtension.create(),
                        AdmonitionExtension.create(),
                        AnchorLinkExtension.create(),
                        AsideExtension.create(),
                        AttributesExtension.create(),
                        AutolinkExtension.create(),
                        DefinitionExtension.create(),
                        EmojiExtension.create(),
                        EnumeratedReferenceExtension.create(),
                        EscapedCharacterExtension.create(),
                        FootnoteExtension.create(),
                        GfmIssuesExtension.create(),
                        GfmUsersExtension.create(),
                        StrikethroughExtension.create(),
                        TaskListExtension.create(),
                        GitLabExtension.create(),
                        InsExtension.create(),
                        JekyllFrontMatterExtension.create(),
                        JekyllTagExtension.create(),
                        MacrosExtension.create(),
                        MediaTagsExtension.create(),
                        SuperscriptExtension.create(),
                        TablesExtension.create(),
                        // TocExtension.create(),
                        TypographicExtension.create(),
                        WikiLinkExtension.create(),
                        MacroExtension.create(),
                        YamlFrontMatterExtension.create(),
                        YouTubeLinkExtension.create()
                ))
                .toImmutable();
        Parser parser = Parser.builder(OPTIONS).build();
        HtmlRenderer renderer = HtmlRenderer.builder(OPTIONS).build();
        // You can re-use parser and renderer instances
        Node document = parser.parse(mdRaw);
        return renderer.render(document);
    }

    /**
     * 生成Markdown格式的TOC
     *
     * @param mdRawFilePath MD文件路径
     * @param order         是否自动编号
     * @return Markdown TOC
     */
    public static List<String> genTocMd(String mdRawFilePath, boolean order) {
        TocGen tocGen = AtxMarkdownToc.newInstance()
                .order(order)
                .write(false)
                .genTocFile(mdRawFilePath);
        List<String> tocLines = tocGen.getTocLines();
        // com.github.houbb.markdown.toc.constant.TocConstant
        final String DEFAULT_TOC_HEAD = "# Table of Contents";
        final String RETURN_LINE = System.getProperty("line.separator");
        if (CollectionUtils.isNotEmpty(tocLines)) {
            if (StringUtils.join(DEFAULT_TOC_HEAD, RETURN_LINE).equals(tocLines.get(0))) {
                tocLines.remove(0);
            }
            if (RETURN_LINE.equals(CollUtil.getLast(tocLines))) {
                tocLines.remove(tocLines.size() - 1);
            }
            return tocLines;
        }
        return Collections.emptyList();
    }

    /**
     * 生成Markdown格式的TOC
     *
     * @param mdTitles MD标题集合(#, ##, ...)
     * @param order    是否自动编号
     * @return Markdown TOC
     */
    public static List<String> genTocMd(List<String> mdTitles, boolean order) {
        final String RETURN_LINE = System.getProperty("line.separator");
        List<String> tocList = MdTocTextHelper.getTocList(mdTitles, order);
        if (RETURN_LINE.equals(CollUtil.getLast(tocList))) {
            tocList.remove(tocList.size() - 1);
        }
        return tocList;
    }

    /**
     * 生成HTML格式的TOC
     *
     * @param mdRawFilePath MD文件路径
     * @param order         是否自动编号
     * @return HTML TOC
     */
    public static String genTocHtml(String mdRawFilePath, boolean order) {
        return mdToHtml(StringUtils.join(genTocMd(mdRawFilePath, order), "\n"));
    }

    /**
     * 生成HTML格式的TOC
     *
     * @param mdRawFilePath MD文件路径
     * @param order         是否自动编号
     * @return HTML TOC
     */
    public static List<String> genTocHtmlList(String mdRawFilePath, boolean order) {
        return Arrays.asList(genTocHtml(mdRawFilePath, order).split("\n"));
    }

    /**
     * 生成主页的导航菜单(扩展)
     *
     * @param indexTocHtmlList 所有文档的HTML格式的导航集合
     * @return 以"\n"分隔的字符串
     */
    public static String genDirTocHtmlExt(List<String> indexTocHtmlList) {
        return indexTocHtmlList.stream()
                .map(tocHtml -> tocHtml.replace("<a", "<a onclick=\"setDocTitle(this.text)\""))    // 实现文档切换时标题同步切换的功能
                .collect(Collectors.joining("\n"));
    }

    /**
     * 生成主页的导航菜单(扩展)
     *
     * @param indexTocHtml 所有文档的HTML格式的导航
     * @return 以"\n"分隔的字符串
     */
    public static String genDirTocHtmlExt(String indexTocHtml) {
        return indexTocHtml
                .replaceAll("<a",
                        "<a onclick=\"setDocTitle(this.text)\"" // 实现文档切换时标题同步切换的功能
                        + " target=\"doc-iframe\""  // 显示在iframe里
                        + " "
                )
                .replaceAll("(?<=\"#).*(?=\")", "$0.html").replaceAll("href=\"#", "href=\"docs/")  // 修改链接href为文档路径
                ;
    }

    /**
     * 生成主页的导航菜单(扩展)
     *
     * @param dirPath 文档目录绝对路径
     * @param order   是否自动编号
     * @return 以"\n"分隔的字符串
     */
    public static String genDirTocHtmlExt(String dirPath, boolean order) {
        return genDirTocHtmlExt(genDirTocHtml(dirPath, order));
    }

    /**
     * 生成整个文档的以单个md文件为标题单位的Markdown格式的TOC
     *
     * @param dirPath 文档目录绝对路径
     * @param order   是否自动编号
     * @return Markdown TOC
     */
    public static List<String> genDirTocMd(String dirPath, boolean order) {
        Path path = Paths.get(dirPath);
        List<File> files = FileUtil.loopFiles(path.toFile());
        List<String> mdTitles = files.stream()
                .map(file -> pathCut(file.getPath(), dirPath))
                .map(s -> StrUtil.repeat("#", StrUtil.count(s, "\\")) + " " + FileUtil.getPrefix(s))
                .collect(Collectors.toList());
        return MdUtil.genTocMd(mdTitles, order);
    }

    /**
     * 生成整个文档的以单个md文件为标题单位的HTML格式的TOC
     *
     * @param dirPath 文档目录绝对路径
     * @param order   是否自动编号
     * @return HTML TOC
     */
    public static String genDirTocHtml(String dirPath, boolean order) {
        return mdToHtml(StringUtils.join(genDirTocMd(dirPath, order), "\n"));
    }

    /**
     * 只保留文档根目录为开头的相对路径
     *
     * @param p   待操作绝对路径
     * @param cut 父级绝对路径
     * @return 相对路径
     */
    private static String pathCut(String p, String cut) {
        return Paths.get(p).toAbsolutePath().toString().toLowerCase()
                .replace(Paths.get(cut).toAbsolutePath().toString().toLowerCase(), "");
    }
}