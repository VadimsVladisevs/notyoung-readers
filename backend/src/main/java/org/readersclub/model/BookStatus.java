package org.readersclub.model;

import com.fasterxml.jackson.annotation.JsonValue;

public enum BookStatus {
    FINISHED("finished"),
    PROGRESS("progress"),
    NEW("new");

    public final String status;

    BookStatus(String status) {
        this.status = status;
    }

    @JsonValue
    public String getValue() {
        return status;
    }

    public static BookStatus fromValue(String status) {
        for (BookStatus bookStatus : values()) {
            if (bookStatus.status.equals(status)) {
                return bookStatus;
            }
        }

        return null;
    }

    @Override
    public String toString() {
        return this.status;
    }
}
