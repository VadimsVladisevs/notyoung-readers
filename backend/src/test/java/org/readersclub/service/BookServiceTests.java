package org.readersclub.service;

import lombok.SneakyThrows;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.MethodSource;
import org.junit.jupiter.params.provider.NullAndEmptySource;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.readersclub.exception.BookStatusNotFoundException;
import org.readersclub.model.Book;
import org.readersclub.model.BookStatus;
import org.readersclub.repository.BookRepository;
import org.readersclub.validator.BookValidator;

import java.util.List;
import java.util.stream.Stream;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.is;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.readersclub.api.factory.BookFactory.createDefaultBook;

@ExtendWith(MockitoExtension.class)
class BookServiceTests {

    @Mock
    private BookRepository bookRepository;

    @Mock
    private BookValidator bookValidator;

    @InjectMocks
    private BookService bookService;

    private static Stream<Arguments> shouldReturnListOfBooksByStatus() {
        List<Book> newBooks = List.of(createDefaultBook(BookStatus.NEW), createDefaultBook(BookStatus.NEW));
        List<Book> booksInProgress = List.of(createDefaultBook(BookStatus.PROGRESS), createDefaultBook(BookStatus.PROGRESS), createDefaultBook(BookStatus.PROGRESS));
        List<Book> finishedBooks = List.of(createDefaultBook(BookStatus.FINISHED));

        return Stream.of(
                Arguments.of(BookStatus.NEW, newBooks, 2),
                Arguments.of(BookStatus.PROGRESS, booksInProgress, 3),
                Arguments.of(BookStatus.NEW, finishedBooks, 1)
        );
    }

    @ParameterizedTest
    @MethodSource
    @SneakyThrows
    void shouldReturnListOfBooksByStatus(BookStatus status, List<Book> books, int expectedSize) {
        // given
        when(bookRepository.findByStatus(any())).thenReturn(books);
        when(bookValidator.isValidBookStatus(any())).thenReturn(true);

        // when
        var result = bookService.getBooksByStatus(status.getValue());

        // then
        assertThat(result.size(), is(expectedSize));
    }

    @ParameterizedTest
    @NullAndEmptySource
    @CsvSource("incorrect status")
    void shouldReturnError(String status) {
        // given
        when(bookValidator.isValidBookStatus(any())).thenReturn(false);

        // when
        var thrown = assertThrows(BookStatusNotFoundException.class, () -> bookService.getBooksByStatus(status));

        // then
        assertThat(thrown.getMessage(), is("Invalid book status '%s'".formatted(status)));
    }

}
