package org.readersclub.service;

import lombok.RequiredArgsConstructor;
import org.readersclub.exception.BookNotFoundException;
import org.readersclub.exception.BookStatusNotFoundException;
import org.readersclub.exception.NoBooksFoundException;
import org.readersclub.model.Book;
import org.readersclub.model.BookStatus;
import org.readersclub.model.dto.BookDto;
import org.readersclub.model.dto.CreateBookDto;
import org.readersclub.model.dto.FinishBookDto;
import org.readersclub.repository.BookRepository;
import org.readersclub.validator.BookValidator;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import java.util.*;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookService {

    private final BookRepository bookRepository;
    private final BookValidator bookValidator;

    public List<Book> getAllBooks() {
        return bookRepository.findAll();
    }

    //    public List<Book> getBooksByStatus(BookStatus status) {
    public List<Book> getBooksByStatus(String status) {
        if (!bookValidator.isValidBookStatus(status)) {
            throw new BookStatusNotFoundException(status);
        }

        return bookRepository.findByStatus(status);
    }

    public Book getBookById(String id) {
        return bookRepository.findById(id).orElseThrow(
                () -> new BookNotFoundException(id)
        );
    }

    public void deleteBookById(String id) {
        Book book = getBookById(id);
        bookRepository.deleteById(id);
    }

    public Book createAndSave(CreateBookDto bookDto) {
        return bookRepository.save(Book.builder()
                .title(bookDto.title())
                .author(bookDto.author())
                .tag(bookDto.tag())
                .status(BookStatus.NEW)
                .wiki(bookDto.wiki())
                .image(bookDto.image())
                .build());
    }

    public Book updateAndSave(Book book, BookDto bookDto) {
        return bookRepository.save(Book.builder()
                .id(book.getId())
                .createdAt(book.getCreatedAt())
                .title(Optional.ofNullable(bookDto.title()).orElse(book.getTitle()))
                .author(Optional.ofNullable(bookDto.author()).orElse(book.getAuthor()))
                .image(Optional.ofNullable(bookDto.image()).orElse(book.getImage()))
                .wiki(Optional.ofNullable(bookDto.wiki()).orElse(book.getWiki()))
                .tag(Optional.ofNullable(bookDto.tag()).orElse(book.getTag()))
                .rating(Optional.ofNullable(bookDto.rating()).orElse(book.getRating()))
                .status(Optional.ofNullable(bookDto.status()).orElse(book.getStatus()))
                .build());
    }

    public Book finishAndSave(Book book, FinishBookDto bookDto) {
        book.setRating(bookDto.rating());
        book.setStatus(BookStatus.FINISHED);

        return bookRepository.save(book);
    }

    public Book startAndSave(Book book) {
        book.setStatus(BookStatus.PROGRESS);

        return bookRepository.save(book);
    }

    public Book getRandomBook(List<String> bookIds) {
        if (CollectionUtils.isEmpty(bookIds)) {
            return pickRandom(bookRepository.findByStatus(BookStatus.NEW.getValue()));
        }

        return getBookById(pickRandom(bookIds));
    }

    private static <T> T pickRandom(List<T> list) {
        if (list.isEmpty()) {
            throw new NoBooksFoundException();
        }

        return list.get(ThreadLocalRandom.current().nextInt(list.size()));
    }

    public Map<String, Integer> getStatistics() {
        Map<String, Integer> map = new HashMap<>();
        List<Book> allBooks = bookRepository.findAll();
        Set<String> tags = allBooks.stream()
                .map(Book::getTag)
                .collect(Collectors.toSet());

        for (String tag : tags) {
            List<Book> books = allBooks.stream()
                    .filter(book -> !BookStatus.NEW.equals(book.getStatus()))
                    .filter(book -> tag.equals(book.getTag()))
                    .toList();
            map.put(tag, books.size());
        }

        return map.entrySet()
                .stream()
                .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        Map.Entry::getValue,
                        (oldValue, _) -> oldValue, LinkedHashMap::new)
                );
    }
}
