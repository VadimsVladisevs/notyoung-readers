package org.readersclub.api;

import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.readersclub.exception.InvalidPasswordException;
import org.readersclub.service.PasswordService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin
@Slf4j
@RequestMapping("/api")
@RequiredArgsConstructor
public class WebController {

    private final PasswordService passwordService;

    @PostMapping("/check-password")
    public ResponseEntity<Void> checkPassword(@RequestParam @NotBlank String password) {
        if (!passwordService.checkPassword(password)) {
            throw new InvalidPasswordException();
        }

        return ResponseEntity.ok().build();
    }
}
