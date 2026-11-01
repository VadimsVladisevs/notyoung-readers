package org.readersclub.model.dto;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;

import java.util.List;

/** The logged-in user as the UI sees it; roles without the {@code ROLE_} prefix. */
public record CurrentUserDto(String username, List<String> roles) {

    public static CurrentUserDto from(Authentication authentication) {
        List<String> roles = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .filter(authority -> authority.startsWith("ROLE_"))
                .map(authority -> authority.substring("ROLE_".length()))
                .toList();
        return new CurrentUserDto(authentication.getName(), roles);
    }
}
