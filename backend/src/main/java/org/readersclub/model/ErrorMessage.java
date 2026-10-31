package org.readersclub.model;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Setter
@Getter
@Builder
public class ErrorMessage {

    private UUID id;

    private String title;

    private int status;

    private String detail;
}
