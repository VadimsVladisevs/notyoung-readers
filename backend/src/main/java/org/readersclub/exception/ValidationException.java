package org.readersclub.exception;

public class ValidationException extends Exception {
    public ValidationException(String property) {
        super("Property '%s' is not valid or missing".formatted(property));
    }
}
