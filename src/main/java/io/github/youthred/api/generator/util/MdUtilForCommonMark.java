//package io.github.youthred.api.generator.util;
//
//import com.github.houbb.markdown.toc.core.impl.AtxMarkdownToc;
//import com.github.houbb.markdown.toc.vo.TocGen;
//import org.apache.commons.lang3.StringUtils;
//import org.commonmark.Extension;
//import org.commonmark.ext.gfm.tables.TableBlock;
//import org.commonmark.ext.gfm.tables.TablesExtension;
//import org.commonmark.ext.heading.anchor.HeadingAnchorExtension;
//import org.commonmark.node.Link;
//import org.commonmark.node.Node;
//import org.commonmark.parser.Parser;
//import org.commonmark.renderer.html.AttributeProvider;
//import org.commonmark.renderer.html.HtmlRenderer;
//
//import java.util.Collections;
//import java.util.List;
//import java.util.Map;
//import java.util.Set;
//
//public class MdUtilForCommonMark {
//
//    /**
//     * markdown格式转变成HTML格式
//     *
//     * @param md md raw
//     * @return rendered html
//     */
//    public static String mdToHtml(String md) {
//        Parser parser = Parser.builder().build();
//        Node document = parser.parse(md);
//        HtmlRenderer renderer = HtmlRenderer.builder().build();
//        return renderer.render(document);
//    }
//
//    /**
//     * 增加扩展(table, title order, title id)
//     * MarkDown转变成HTML
//     *
//     * @param md md raw
//     * @return rendered html
//     */
//    public static String mdToHtmlExt(String md) {
//        // h标题生成id
//        Set<Extension> headingAnchorExtensions = Collections.singleton(HeadingAnchorExtension.create());
//        // 转换table的HTML
//        List<Extension> tableExtension = Collections.singletonList(TablesExtension.create());
//        Parser parser = Parser.builder()
//                .extensions(tableExtension)
//                .build();
//        Node document = parser.parse(md);
//        HtmlRenderer renderer = HtmlRenderer.builder()
//                .extensions(headingAnchorExtensions)
//                .extensions(tableExtension)
//                .attributeProviderFactory(attributeProviderContext -> new CustomAttributeProvider())
//                .build();
//        return renderer.render(document);
//    }
//
//    static class CustomAttributeProvider implements AttributeProvider {
//        @Override
//        public void setAttributes(Node node, String s, Map<String, String> attributes) {
//            // 改变a标签的target
//            if (node instanceof Link) {
////                attributes.put("target","_blank");
//            }
//            if (node instanceof TableBlock) {
//                attributes.put("class", "ui celled table");
//            }
//        }
//    }
//
//    /**
//     * 生成Markdown格式的TOC
//     *
//     * @param mdRawFilePath MD文件路径
//     * @return Markdown TOC
//     */
//    public static List<String> genTocMd(String mdRawFilePath) {
//        TocGen tocGen = AtxMarkdownToc.newInstance()
//                .order(true)
//                .write(false)
//                .genTocFile(mdRawFilePath);
//        List<String> tocLines = tocGen.getTocLines();
//        // 去掉"# Table of contents"
//        tocLines.remove(0);
//        return tocLines;
//    }
//
//    /**
//     * 生成HTML格式的TOC
//     *
//     * @param mdRawFilePath MD文件路径
//     * @return HTML TOC
//     */
//    public static String genTocHtml(String mdRawFilePath) {
//        return mdToHtml(StringUtils.join(genTocMd(mdRawFilePath), "\r\n"));
//    }
//}