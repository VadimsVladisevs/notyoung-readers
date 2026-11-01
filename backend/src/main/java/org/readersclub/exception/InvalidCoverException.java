package org.readersclub.exception;

public class InvalidCoverException extends RuntimeException {
    public InvalidCoverException() {
        super("The cover must be a JPEG file");
    }
}
