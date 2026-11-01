package org.readersclub.service;

import lombok.RequiredArgsConstructor;
import org.readersclub.exception.InvalidCoverException;
import org.readersclub.model.Book;
import org.readersclub.repository.BookRepository;
import org.springframework.data.mongodb.gridfs.GridFsResource;
import org.springframework.data.mongodb.gridfs.GridFsTemplate;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.util.Optional;

import static org.springframework.data.mongodb.core.query.Criteria.where;
import static org.springframework.data.mongodb.core.query.Query.query;

/**
 * Covers live in GridFS under their file name. A book's {@code image} is {@code images/<file name>},
 * which is also the URL the cover is served at.
 */
@Service
@RequiredArgsConstructor
public class CoverService {

    // Same as spring.servlet.multipart.max-file-size, which already rejects bigger uploads before they get here
    public static final long MAX_BYTES = 2L * 1024 * 1024;
    private static final String PREFIX = "images/";

    private final GridFsTemplate gridFsTemplate;
    private final BookRepository bookRepository;

    public Optional<GridFsResource> find(String filename) {
        GridFsResource cover = gridFsTemplate.getResource(filename);
        return cover.exists() ? Optional.of(cover) : Optional.empty();
    }

    /** Stores the cover as `<author>-<title>.jpeg`, points the book at it and deletes the previous cover. */
    public Book upload(Book book, MultipartFile file) {
        if (file.getSize() > MAX_BYTES) {
            throw new MaxUploadSizeExceededException(MAX_BYTES);
        }
        byte[] bytes = readBytes(file);
        if (!MediaType.IMAGE_JPEG_VALUE.equals(file.getContentType()) || !isJpeg(bytes)) {
            throw new InvalidCoverException();
        }

        String oldImage = book.getImage();
        String name = freeName(book);
        // No other book uses this name, so a file under it is a leftover or this book's own old cover
        deleteFile(name);
        gridFsTemplate.store(new ByteArrayInputStream(bytes), name, MediaType.IMAGE_JPEG_VALUE);
        book.setImage(PREFIX + name);
        Book saved = bookRepository.save(book);

        if (oldImage != null && !oldImage.equals(saved.getImage())) {
            deleteIfUnused(oldImage, book.getId());
        }
        return saved;
    }

    /** Deletes the book's cover file, unless another book points at the same file. */
    public void deleteCover(Book book) {
        if (book.getImage() != null) {
            deleteIfUnused(book.getImage(), book.getId());
        }
    }

    private String freeName(Book book) {
        String base = CoverNames.base(book.getAuthor(), book.getTitle());
        for (int n = 1; ; n++) {
            String name = CoverNames.fileName(base, n);
            if (!bookRepository.existsByImageAndIdNot(PREFIX + name, book.getId())) {
                return name;
            }
        }
    }

    private void deleteIfUnused(String image, String bookId) {
        if (image.startsWith(PREFIX) && !bookRepository.existsByImageAndIdNot(image, bookId)) {
            deleteFile(image.substring(PREFIX.length()));
        }
    }

    private void deleteFile(String filename) {
        gridFsTemplate.delete(query(where("filename").is(filename)));
    }

    private static boolean isJpeg(byte[] bytes) {
        return bytes.length >= 3 && bytes[0] == (byte) 0xFF && bytes[1] == (byte) 0xD8 && bytes[2] == (byte) 0xFF;
    }

    private static byte[] readBytes(MultipartFile file) {
        try {
            return file.getBytes();
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }
}
