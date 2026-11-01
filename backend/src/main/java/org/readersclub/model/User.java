package org.readersclub.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

/**
 * A login account from the legacy {@code users} collection. {@code password} is a bcrypt hash.
 * {@code roles} (e.g. {@code ADMIN}) is new; legacy documents may not have it.
 * The app only reads users (the {@code dev} seed is the one exception).
 */
@Document("users")
public record User(@Id String id, String username, String password, List<String> roles) {
}
