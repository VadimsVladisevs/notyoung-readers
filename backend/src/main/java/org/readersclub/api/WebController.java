package org.readersclub.api;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.readersclub.model.Book;
import org.readersclub.service.PasswordService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin
@Validated
@Slf4j
@RequestMapping("/api")
@RequiredArgsConstructor
public class WebController {

    private final PasswordService passwordService;

    @PostMapping("/check-password")
    public ResponseEntity<Book> checkPassword(
            @RequestParam @Valid @NotNull @NotBlank String password //TODO: update error response
    ) throws Exception {
//        if (!StringUtils.hasLength(password)) {
//            throw new ValidationException(password);
//        }

        if (!passwordService.checkPassword(password)) {
            throw new Exception("Password is incorrect!");
        }

        return new ResponseEntity<>(HttpStatus.OK);
    }
}
