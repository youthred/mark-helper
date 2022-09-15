package io.github.youthred.api.generator.o;

import lombok.Data;
import lombok.experimental.Accessors;

/**
 * @author https://github.com/youthred
 */
@Data
@Accessors(chain = true)
public class Index {

    private String title;
    /**
     * thymeleaf避免转义
     * 使用<span th:utext="${dirTocHtml}"/>
     * 或者[(${dirTocHtml})]
     */
    private String dirTocHtml;
    private String firstDocPath;
}
