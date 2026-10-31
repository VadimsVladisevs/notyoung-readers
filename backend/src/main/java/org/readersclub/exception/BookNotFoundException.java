package org.readersclub.exception;

public class BookNotFoundException extends Exception {
    public BookNotFoundException(String id) {
        super("Book with id '%s' not found".formatted(id));
    }
}
