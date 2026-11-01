package org.readersclub.api;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.readersclub.exception.InvalidBookStateException;
import org.readersclub.model.Book;
import org.readersclub.model.BookStatus;
import org.readersclub.model.Statistics;
import org.readersclub.model.dto.BookDto;
import org.readersclub.model.dto.CreateBookDto;
import org.readersclub.model.dto.FinishBookDto;
import org.readersclub.service.BookService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@Slf4j
@RequestMapping("/api")
@RequiredArgsConstructor
public class BookController {

    private final BookService bookService;

    @GetMapping("/books")
    public ResponseEntity<List<Book>> getBooks(@RequestParam(required = false) String status) {
        log.info("Get books with status {}", status);
        List<Book> books = status == null ?
                bookService.getAllBooks() :
                bookService.getBooksByStatus(status);

        return new ResponseEntity<>(books, HttpStatus.OK);
    }

    @GetMapping("/books/{id}")
    public ResponseEntity<Book> getBookById(@PathVariable String id) {
        log.info("Get book with id {}", id);
        Book book = bookService.getBookById(id);

        return new ResponseEntity<>(book, HttpStatus.OK);
    }

    @DeleteMapping("/books/{id}")
    public ResponseEntity<Book> deleteBookById(@PathVariable String id) {
        log.info("Delete book with id {}", id);
        bookService.deleteBookById(id);

        return new ResponseEntity<>(HttpStatus.OK);
    }

    @PostMapping("/books/add")
    public ResponseEntity<Book> addNewBook(@RequestBody @Valid CreateBookDto bookDto) {
        log.info("Add new book {}", bookDto);
        return new ResponseEntity<>(bookService.createAndSave(bookDto), HttpStatus.CREATED);
    }

    @PatchMapping("/books/{id}/update")
    public ResponseEntity<Book> updateBook(@PathVariable String id, @RequestBody @Valid BookDto bookDto) {
        log.info("Update book with id {}", id);
        Book book = bookService.getBookById(id);

        return new ResponseEntity<>(bookService.updateAndSave(book, bookDto), HttpStatus.OK);
    }

    @PatchMapping("/books/{id}/finish")
    public ResponseEntity<Book> finishBook(@PathVariable String id, @RequestBody @Valid FinishBookDto bookDto) {
        Book book = bookService.getBookById(id);

        if (!BookStatus.PROGRESS.equals(book.getStatus())) {
            log.error("Only Book with status 'PROGRESS' can be finished");
            throw new InvalidBookStateException("Only Book with status 'PROGRESS' can be finished. Current status: '%s'".formatted(
                    book.getStatus().toString().toUpperCase()));
        }

        return new ResponseEntity<>(bookService.finishAndSave(book, bookDto), HttpStatus.OK);
    }

    @PatchMapping("/books/{id}/start")
    public ResponseEntity<Book> startBook(@PathVariable String id) {
        log.info("Start book with id {}", id);
        Book book = bookService.getBookById(id);

        if (!BookStatus.NEW.equals(book.getStatus())) {
            log.error("Only Book with status 'NEW' can be started");
            throw new InvalidBookStateException("Only Book with status 'NEW' can be started. Current status: '%s'".formatted(
                    book.getStatus().toString().toUpperCase()));
        }

        Book updatedBook = bookService.startAndSave(book);

        return new ResponseEntity<>(updatedBook, HttpStatus.OK);
    }

    @GetMapping("/books/random")
    public ResponseEntity<Book> getRandomBook(@RequestParam(required = false) List<String> booksId) {
        return new ResponseEntity<>(bookService.getRandomBook(booksId), HttpStatus.OK);
    }

    @GetMapping("/statistics")
    public ResponseEntity<Statistics> getStatistics() {
        return new ResponseEntity<>(Statistics.builder()
                .statistics(bookService.getStatistics())
                .build(), HttpStatus.OK);
    }
}
