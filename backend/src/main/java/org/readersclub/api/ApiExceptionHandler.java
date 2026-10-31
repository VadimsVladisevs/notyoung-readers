package org.readersclub.api;

import org.readersclub.exception.BookNotFoundException;
import org.readersclub.exception.BookStatusNotFoundException;
import org.readersclub.exception.MissingPropertyException;
import org.readersclub.exception.ValidationException;
import org.readersclub.model.ErrorMessage;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@ControllerAdvice
public class ApiExceptionHandler extends ResponseEntityExceptionHandler {

    @ExceptionHandler(value = {
            BookStatusNotFoundException.class,
            BookNotFoundException.class,
            MissingPropertyException.class,
            ValidationException.class,
            Exception.class
    })
    public ResponseEntity<ErrorMessage> handleAccessDeniedException(
            Exception ex, WebRequest request) {
        return new ResponseEntity<>(
                ErrorMessage.builder()
                        .id(UUID.randomUUID())
                        .title(HttpStatus.BAD_REQUEST.getReasonPhrase())
                        .status(HttpStatus.BAD_REQUEST.value())
                        .detail(ex.getMessage())
                        .build(),
                new HttpHeaders(),
                HttpStatus.BAD_REQUEST);
    }

    @Override
    protected ResponseEntity<Object> handleMethodArgumentNotValid(MethodArgumentNotValidException ex,
                                                                  HttpHeaders headers, HttpStatusCode status, WebRequest request) {
        Map<String, Map<String, String>> body = new HashMap<>();
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult()
                .getFieldErrors()
                .forEach(fieldError -> {
                    errors.put(fieldError.getField(), fieldError.getDefaultMessage());
                });

        body.put("errors", errors); //TODO: replace with POJO class

        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
    }
}
