package org.readersclub.api.factory;

import org.readersclub.model.Book;
import org.readersclub.model.BookStatus;

public class BookFactory {

    public static Book createDefaultBook(BookStatus status) {
        return createBook("title", "author", "wiki", "images/image.jpg", 5.0, status, "tag");
    }

    public static Book createBook(String title, String author, String wiki, String image,
                                  Double rating, BookStatus status, String tag) {
        return Book.builder()
                .title(title)
                .author(author)
                .wiki(wiki)
                .image(image)
                .rating(rating)
                .status(status)
                .tag(tag)
                .build();
    }
}
