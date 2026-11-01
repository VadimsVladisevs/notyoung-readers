package org.readersclub.validator;

import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.readersclub.validator.BookValidator;

import java.util.stream.Stream;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.is;

public class BookValidatorTests {

    private final BookValidator validator = new BookValidator();

//    private static Stream<Arguments> shouldValidateImage() {
//        return Stream.of(
//                Arguments.of("images/image.jpg", true),
//                Arguments.of("", false),
//                Arguments.of(null, false),
//                Arguments.of("image.jpg", false),
//                Arguments.of("images/image.png", false)
//        );
//    }
//
//    @ParameterizedTest
//    @MethodSource
//    void shouldValidateImage(String image, boolean expectedResult) {
//        // given - when
//        boolean result = validator.isValidImage(image);
//
//        // then
//        assertThat(result, is(expectedResult));
//    }

    private static Stream<Arguments> shouldValidateBookStatus() {
        return Stream.of(
                Arguments.of("finished", true),
                Arguments.of("progress", true),
                Arguments.of("new", true),
                Arguments.of("", false),
                Arguments.of(null, false),
                Arguments.of("randomStatus", false)
        );
    }

    @ParameterizedTest
    @MethodSource
    void shouldValidateBookStatus(String status, boolean expectedResult) {
        // given - when
        boolean result = validator.isValidBookStatus(status);

        // then
        assertThat(result, is(expectedResult));
    }

//    private static Stream<Arguments> shouldValidateRating() {
//        return Stream.of(
//                Arguments.of(5.5, true),
//                Arguments.of(10.2, false),
//                Arguments.of(0.5, false),
//                Arguments.of(null, false)
//        );
//    }
//
//    @ParameterizedTest
//    @MethodSource
//    void shouldValidateRating(Double rating, boolean expectedResult) {
//        // given - when
//        boolean result = validator.isValidRating(rating);
//
//        // then
//        assertThat(result, is(expectedResult));
//    }
//
//    private static Stream<Arguments> shouldValidateTag() {
//        return Stream.of(
//                Arguments.of("tag", true),
//                Arguments.of("", false),
//                Arguments.of(null, false)
//        );
//    }
//
//    @ParameterizedTest
//    @MethodSource
//    void shouldValidateTag(String tag, boolean expectedResult) {
//        // given - when
//        boolean result = validator.isValidTag(tag);
//
//        // then
//        assertThat(result, is(expectedResult));
//    }
//
//    private static Stream<Arguments> shouldValidateWiki() {
//        return Stream.of(
//                Arguments.of("wiki", true),
//                Arguments.of("", false),
//                Arguments.of(null, false)
//        );
//    }
//
//    @ParameterizedTest
//    @MethodSource
//    void shouldValidateWiki(String wiki, boolean expectedResult) {
//        // given - when
//        boolean result = validator.isValidWiki(wiki);
//
//        // then
//        assertThat(result, is(expectedResult));
//    }
//
//    private static Stream<Arguments> shouldValidateAuthor() {
//        return Stream.of(
//                Arguments.of("author", true),
//                Arguments.of("", false),
//                Arguments.of(null, false)
//        );
//    }
//
//    @ParameterizedTest
//    @MethodSource
//    void shouldValidateAuthor(String author, boolean expectedResult) {
//        // given - when
//        boolean result = validator.isValidAuthor(author);
//
//        // then
//        assertThat(result, is(expectedResult));
//    }
//
//    private static Stream<Arguments> shouldValidateTitle() {
//        return Stream.of(
//                Arguments.of("title", true),
//                Arguments.of("", false),
//                Arguments.of(null, false)
//        );
//    }
//
//    @ParameterizedTest
//    @MethodSource
//    void shouldValidateTitle(String title, boolean expectedResult) {
//        // given - when
//        boolean result = validator.isValidTitle(title);
//
//        // then
//        assertThat(result, is(expectedResult));
//    }
}
