package org.readersclub.validator;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.readersclub.model.BookStatus;

import java.util.stream.Stream;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.is;

class BookStatusTypeSubSetValidatorTests {

    private static class Annotated {
        @ValidBookStatus(anyOf = {BookStatus.NEW, BookStatus.PROGRESS})
        BookStatus status;
    }

    private final BookStatusTypeSubSetValidator validator = new BookStatusTypeSubSetValidator();

    @BeforeEach
    void setUp() throws NoSuchFieldException {
        validator.initialize(Annotated.class.getDeclaredField("status").getAnnotation(ValidBookStatus.class));
    }

    private static Stream<Arguments> shouldValidateSubset() {
        return Stream.of(
                Arguments.of(BookStatus.NEW, true),
                Arguments.of(BookStatus.PROGRESS, true),
                Arguments.of(BookStatus.FINISHED, false),
                Arguments.of(null, false)
        );
    }

    @ParameterizedTest
    @MethodSource
    void shouldValidateSubset(BookStatus status, boolean expectedResult) {
        assertThat(validator.isValid(status, null), is(expectedResult));
    }
}
