package org.readersclub.exception;

public class InvalidBookStateException extends RuntimeException {
    public InvalidBookStateException(String message) {
        super(message);
    }
}
