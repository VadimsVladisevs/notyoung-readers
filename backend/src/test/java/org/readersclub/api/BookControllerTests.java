package org.readersclub.api;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.readersclub.model.Book;
import org.readersclub.model.BookStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.mongodb.test.autoconfigure.DataMongoTest;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import static org.junit.jupiter.api.Assertions.assertEquals;

@DataMongoTest
@ExtendWith(SpringExtension.class)
class BookControllerTests {

    @Autowired
    private MongoTemplate mongoTemplate;

    @AfterEach
    void cleanUp() {
        mongoTemplate.getDb().drop();
    }

    @DisplayName("given object to save"
            + " when save object using MongoDB template"
            + " then object is saved")
    @Test
    void test() {
        // given
        var book = Book.builder()
                .title("title")
                .author("author")
                .image("image")
                .status(BookStatus.NEW)
                .tag("tag")
                .wiki("wiki")
                .build();

        // when
        mongoTemplate.save(book, "collection");

        // then
        assertEquals(1,  mongoTemplate.findAll(Book.class, "collection").size());
    }
}
