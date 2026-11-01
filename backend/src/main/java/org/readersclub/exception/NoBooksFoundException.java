package org.readersclub.exception;

public class NoBooksFoundException extends RuntimeException {
    public NoBooksFoundException() {
        super("No books to pick from");
    }
}
