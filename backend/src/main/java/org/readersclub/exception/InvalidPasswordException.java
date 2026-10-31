package org.readersclub.exception;

public class InvalidPasswordException extends RuntimeException {
    public InvalidPasswordException() {
        super("Password is incorrect");
    }
}
