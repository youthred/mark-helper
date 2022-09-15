package io.github.youthred.api.generator.o;

import lombok.Data;
import lombok.experimental.Accessors;

/**
 * @author https://github.com/youthred
 */
@Data
@Accessors(chain = true)
public class Doc {

    private String title;
    private String mdHtml;
    private String tocHtml;
}
