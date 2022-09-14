package io.github.youthred.api.generator.util;

import cn.hutool.core.collection.CollUtil;
import com.github.houbb.markdown.toc.core.impl.AtxMarkdownToc;
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

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

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
     * @return Markdown TOC
     */
    public static List<String> genTocMd(String mdRawFilePath) {
        TocGen tocGen = AtxMarkdownToc.newInstance()
                .order(true)
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
     * 生成HTML格式的TOC
     *
     * @param mdRawFilePath MD文件路径
     * @return HTML TOC
     */
    public static String genTocHtml(String mdRawFilePath) {
        return mdToHtml(StringUtils.join(genTocMd(mdRawFilePath), "\r\n"));
    }
}