package org.readersclub.api;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.readersclub.exception.CoverNotFoundException;
import org.readersclub.model.Book;
import org.readersclub.service.BookService;
import org.readersclub.service.CoverService;
import org.springframework.core.io.Resource;
import org.springframework.data.mongodb.gridfs.GridFsResource;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@Slf4j
@RequiredArgsConstructor
public class CoverController {

    private final CoverService coverService;
    private final BookService bookService;

    // Public (outside /api). Re-uploading can put new bytes under the same name, so browsers revalidate.
    // The ETag is the GridFS file id, which changes on every upload; a matching If-None-Match gets 304.
    @GetMapping("/images/{filename}")
    public ResponseEntity<Resource> getCover(@PathVariable String filename) {
        GridFsResource cover = coverService.find(filename)
                .orElseThrow(() -> new CoverNotFoundException(filename));

        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_JPEG)
                .cacheControl(CacheControl.noCache())
                .eTag(cover.getGridFSFile().getObjectId().toHexString())
                .body(cover);
    }

    @PutMapping("/api/books/{id}/cover")
    public ResponseEntity<Book> uploadCover(@PathVariable String id, @RequestPart("file") MultipartFile file) {
        log.info("Upload cover for book with id {}", id);
        Book book = bookService.getBookById(id);

        return ResponseEntity.ok(coverService.upload(book, file));
    }
}
