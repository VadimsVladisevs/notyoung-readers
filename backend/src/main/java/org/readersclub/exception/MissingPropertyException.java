package org.readersclub.exception;

public class MissingPropertyException extends Exception {

    public MissingPropertyException(String property) {
        super("Mandatory property '%s' is missing!".formatted(property));
    }
}
