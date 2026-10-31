package org.readersclub.model.converter.writing;

import org.readersclub.model.BookStatus;
import org.springframework.core.convert.converter.Converter;
import org.springframework.data.convert.WritingConverter;
import org.springframework.stereotype.Component;

@Component
@WritingConverter
public class BookWritingConverter implements Converter<BookStatus, String> {
    @Override
    public String convert(BookStatus status) {
        return status.getValue();
    }
}
