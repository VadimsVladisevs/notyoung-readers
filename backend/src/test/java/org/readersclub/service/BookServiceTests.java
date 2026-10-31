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
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.readersclub.exception.BookStatusNotFoundException;
import org.readersclub.exception.NoBooksFoundException;
import org.readersclub.model.Book;
import org.readersclub.model.BookStatus;
import org.readersclub.model.dto.BookDto;
import org.readersclub.repository.BookRepository;
import org.readersclub.validator.BookValidator;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.stream.Stream;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.readersclub.api.factory.BookFactory.createBook;
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

    private static Book withId(String id, BookStatus status) {
        Book book = createDefaultBook(status);
        book.setId(id);
        return book;
    }

    @Test
    void randomBookWithoutIdsPicksFromNewBooksOnly() {
        Book newBook = withId("1", BookStatus.NEW);
        when(bookRepository.findByStatus("new")).thenReturn(List.of(newBook));

        var result = bookService.getRandomBook(List.of());

        assertThat(result, is(newBook));
        verify(bookRepository, never()).findAll();
    }

    @Test
    void randomBookWithIdsPicksOneOfThem() {
        when(bookRepository.findById(any())).thenAnswer(invocation ->
                Optional.of(withId(invocation.getArgument(0), BookStatus.FINISHED)));

        var result = bookService.getRandomBook(List.of("a", "b"));

        assertThat(result.getId(), is(oneOf("a", "b")));
    }

    @Test
    void randomBookWithoutNewBooksThrows() {
        when(bookRepository.findByStatus("new")).thenReturn(List.of());

        assertThrows(NoBooksFoundException.class, () -> bookService.getRandomBook(null));
    }

    @Test
    void statisticsAreSortedByCountDescending() {
        when(bookRepository.findAll()).thenReturn(List.of(
                createBook("t", "a", "w", "i", 5.0, BookStatus.FINISHED, "poetry"),
                createBook("t", "a", "w", "i", 5.0, BookStatus.FINISHED, "novel"),
                createBook("t", "a", "w", "i", 5.0, BookStatus.PROGRESS, "novel"),
                createBook("t", "a", "w", "i", null, BookStatus.NEW, "essay"),
                createBook("t", "a", "w", "i", null, BookStatus.NEW, "novel")));

        var result = bookService.getStatistics();

        assertThat(List.copyOf(result.keySet()), contains("novel", "poetry", "essay"));
        assertThat(List.copyOf(result.values()), contains(2, 1, 0));
    }

    @Test
    void updateMergesGivenFieldsAndKeepsCreatedAt() {
        Instant createdAt = Instant.parse("2024-05-01T12:00:00Z");
        Book book = withId("1", BookStatus.FINISHED);
        book.setCreatedAt(createdAt);
        when(bookRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        bookService.updateAndSave(book, BookDto.builder().title("New title").rating(9.0).build());

        var captor = ArgumentCaptor.forClass(Book.class);
        verify(bookRepository).save(captor.capture());
        Book saved = captor.getValue();
        assertEquals("1", saved.getId());
        assertEquals("New title", saved.getTitle());
        assertEquals(9.0, saved.getRating());
        assertEquals("author", saved.getAuthor());
        assertEquals("wiki", saved.getWiki());
        assertEquals("images/image.jpg", saved.getImage());
        assertEquals("tag", saved.getTag());
        assertEquals(BookStatus.FINISHED, saved.getStatus());
        assertEquals(createdAt, saved.getCreatedAt());
    }
}
