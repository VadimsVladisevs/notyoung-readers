package org.readersclub.exception;

public class CoverNotFoundException extends RuntimeException {
    public CoverNotFoundException(String filename) {
        super("Cover '%s' not found".formatted(filename));
    }
}
