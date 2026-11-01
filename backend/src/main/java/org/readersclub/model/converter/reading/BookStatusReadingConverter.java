package org.readersclub.model.converter.reading;

import org.readersclub.model.BookStatus;
import org.springframework.core.convert.converter.Converter;
import org.springframework.data.convert.ReadingConverter;
import org.springframework.stereotype.Component;

@Component
@ReadingConverter
public class BookStatusReadingConverter implements Converter<String, BookStatus> {
    @Override
    public BookStatus convert(String status) {
        return BookStatus.fromValue(status);
    }
}
