package org.readersclub.api;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class WebController {

    /** The security filter chain checks the X-Club-Password header; reaching here means it was right. */
    @PostMapping("/check-password")
    public ResponseEntity<Void> checkPassword() {
        return ResponseEntity.ok().build();
    }
}
