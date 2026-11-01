package org.readersclub.repository;

import org.bson.Document;
import org.bson.types.ObjectId;
import org.junit.jupiter.api.Test;
import org.readersclub.IntegrationTest;
import org.readersclub.model.Book;
import org.readersclub.model.BookStatus;

import java.time.Instant;
import java.util.Date;

import static org.junit.jupiter.api.Assertions.*;
import static org.readersclub.api.factory.BookFactory.createDefaultBook;

class BookPersistenceTests extends IntegrationTest {

    @Test
    void storesStatusAsLowercaseString() {
        Book book = bookRepository.save(createDefaultBook(BookStatus.PROGRESS));

        Document stored = mongoTemplate.getCollection("books")
                .find(new Document("_id", new ObjectId(book.getId()))).first();

        assertNotNull(stored);
        assertEquals("progress", stored.get("status"));
    }

    @Test
    void setsAuditingDates() {
        Book book = bookRepository.save(createDefaultBook(BookStatus.NEW));

        Book stored = bookRepository.findById(book.getId()).orElseThrow();

        assertNotNull(stored.getCreatedAt());
        assertNotNull(stored.getUpdatedAt());
    }

    @Test
    void loadsLegacyDocument() {
        // Shape written by the old Mongoose app: __v, integer rating, no wiki
        Instant createdAt = Instant.parse("2023-01-15T10:00:00Z");
        ObjectId id = new ObjectId();
        mongoTemplate.getCollection("books").insertOne(new Document("_id", id)
                .append("title", "Мастер и Маргарита")
                .append("author", "Булгаков")
                .append("image", "images/master.jpg")
                .append("status", "finished")
                .append("tag", "роман")
                .append("rating", 9)
                .append("createdAt", Date.from(createdAt))
                .append("updatedAt", Date.from(createdAt))
                .append("__v", 0));

        Book book = bookRepository.findById(id.toHexString()).orElseThrow();

        assertEquals("Мастер и Маргарита", book.getTitle());
        assertEquals(BookStatus.FINISHED, book.getStatus());
        assertEquals(9.0, book.getRating());
        assertNull(book.getWiki());
        assertEquals(createdAt, book.getCreatedAt());
    }
}
