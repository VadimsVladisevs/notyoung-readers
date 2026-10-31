package org.readersclub.validator;

import org.readersclub.exception.ValidationException;
import org.readersclub.model.BookStatus;
import org.readersclub.model.dto.BookDto;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.awt.geom.Arc2D;

@Component
public class BookValidator {

//    public void validateAddRequest(BookDto bookDto) throws ValidationException {
//        if (!isValidTitle(bookDto.getTitle())) {
//            throw new ValidationException("title");
//        }
//        if (!isValidAuthor(bookDto.getAuthor())) {
//            throw new ValidationException("author");
//        }
//        if (!isValidWiki(bookDto.getWiki())) {
//            throw new ValidationException("wiki");
//        }
//        if (!isValidTag(bookDto.getTag())) {
//            throw new ValidationException("tag");
//        }
//        if (!isValidImage(bookDto.getImage())) {
//            throw new ValidationException("image");
//        }
//    }

//    public void validateFinishRequest(BookDto bookDto) throws ValidationException {
//        if (!isValidRating(bookDto.getRating())) {
//            throw new ValidationException("rating");
//        }
//    }

//    public boolean isValidTitle(String title) {
//        return isValidString(title);
//    }
//
//    public boolean isValidAuthor(String author) {
//        return isValidString(author);
//    }
//
//    public boolean isValidWiki(String wiki) {
//        return isValidString(wiki);
//    }
//
//    public boolean isValidTag(String tag) {
//        return isValidString(tag);
//    }
//
//    public boolean isValidImage(String image) {
//        return isValidString(image) && image.contains("images/") && image.contains(".jpg");
//    }
//
//    public boolean isValidRating(Double rating) {
//        if (rating == null) {
//            return false;
//        }
//
//        return rating <= 10.0 && rating > 1.0;
//    }

    public boolean isValidBookStatus(String status) {
        return BookStatus.fromValue(status) != null;
    }

//    private boolean isValidString(String property) {
//        return StringUtils.hasLength(property);
//    }
}
