package org.readersclub.exception;

public class BookStatusNotFoundException extends RuntimeException {
    public BookStatusNotFoundException(String status) {
        super("Invalid book status '%s'".formatted(status));
    }
}
