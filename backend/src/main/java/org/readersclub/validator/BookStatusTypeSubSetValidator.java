package org.readersclub.validator;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import org.readersclub.model.BookStatus;

import java.util.Arrays;

public class BookStatusTypeSubSetValidator implements ConstraintValidator<ValidBookStatus, BookStatus> {
    private BookStatus[] subset;

    @Override
    public void initialize(ValidBookStatus constraint) {
        this.subset = constraint.anyOf();
    }

    @Override
    public boolean isValid(BookStatus value, ConstraintValidatorContext context) {
        return value != null || Arrays.asList(subset).contains(value);
    }
}
