package org.readersclub.exception;

public class BookStatusNotFoundException extends Exception {
    public BookStatusNotFoundException(String status) {
        super("Invalid book status '%s'".formatted(status));
    }
}
