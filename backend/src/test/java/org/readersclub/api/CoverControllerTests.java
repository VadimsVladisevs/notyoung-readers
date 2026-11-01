package org.readersclub.api;

import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.readersclub.IntegrationTest;
import org.readersclub.model.Book;
import org.readersclub.model.BookStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.gridfs.GridFsTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.ResultActions;

import java.io.ByteArrayInputStream;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.readersclub.api.factory.BookFactory.createBook;
import static org.springframework.data.mongodb.core.query.Criteria.where;
import static org.springframework.data.mongodb.core.query.Query.query;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class CoverControllerTests extends IntegrationTest {

    private static final String MISSING_ID = "000000000000000000000000";
    // Smallest bytes that pass the JPEG check (SOI marker + start of a segment)
    private static final byte[] JPEG = {(byte) 0xFF, (byte) 0xD8, (byte) 0xFF, (byte) 0xE0, 1, 2, 3};
    private static final byte[] OTHER_JPEG = {(byte) 0xFF, (byte) 0xD8, (byte) 0xFF, (byte) 0xE1, 9, 9};

    @Autowired
    private GridFsTemplate gridFsTemplate;

    private void storeFile(String filename, byte[] bytes) {
        gridFsTemplate.store(new ByteArrayInputStream(bytes), filename, MediaType.IMAGE_JPEG_VALUE);
    }

    private List<String> storedNames() {
        List<String> names = new ArrayList<>();
        gridFsTemplate.find(query(where("filename").exists(true))).forEach(file -> names.add(file.getFilename()));
        return names;
    }

    private Book saveBook(String author, String title, String image) {
        return bookRepository.save(createBook(title, author, "wiki", image, null, BookStatus.NEW, "tag"));
    }

    private ResultActions upload(String bookId, MockMultipartFile file) throws Exception {
        return mockMvc.perform(multipart(HttpMethod.PUT, "/api/books/{id}/cover", bookId).file(file).with(admin()));
    }

    private static MockMultipartFile jpeg(byte[] bytes) {
        return new MockMultipartFile("file", "photo.jpg", MediaType.IMAGE_JPEG_VALUE, bytes);
    }

    @Nested
    class Serve {

        @Test
        void returnsTheStoredCover() throws Exception {
            storeFile("orwell-1984.jpg", JPEG);

            mockMvc.perform(get("/images/orwell-1984.jpg"))
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.IMAGE_JPEG))
                    .andExpect(content().bytes(JPEG))
                    .andExpect(header().string(HttpHeaders.CACHE_CONTROL, "no-cache"))
                    .andExpect(header().exists(HttpHeaders.ETAG));
        }

        @Test
        void returns304WhenTheETagMatches() throws Exception {
            storeFile("orwell-1984.jpg", JPEG);
            String etag = mockMvc.perform(get("/images/orwell-1984.jpg"))
                    .andReturn().getResponse().getHeader(HttpHeaders.ETAG);

            mockMvc.perform(get("/images/orwell-1984.jpg").header(HttpHeaders.IF_NONE_MATCH, etag))
                    .andExpect(status().isNotModified());
        }

        @Test
        void returns404ForAnUnknownCover() throws Exception {
            mockMvc.perform(get("/images/missing.jpg"))
                    .andExpect(status().isNotFound())
                    .andExpect(content().contentType(MediaType.APPLICATION_PROBLEM_JSON));
        }
    }

    @Nested
    class Upload {

        @Test
        void storesTheCoverUnderAGeneratedName() throws Exception {
            Book book = saveBook("Оруэлл", "1984", null);

            upload(book.getId(), jpeg(JPEG))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.image").value("images/oruell-1984.jpeg"));

            assertEquals("images/oruell-1984.jpeg", bookRepository.findById(book.getId()).orElseThrow().getImage());
            mockMvc.perform(get("/images/oruell-1984.jpeg"))
                    .andExpect(status().isOk())
                    .andExpect(content().bytes(JPEG));
        }

        @Test
        void replacingKeepsOneFileAndServesTheNewBytes() throws Exception {
            Book book = saveBook("Orwell", "1984", null);
            upload(book.getId(), jpeg(JPEG)).andExpect(status().isOk());

            upload(book.getId(), jpeg(OTHER_JPEG)).andExpect(status().isOk());

            assertEquals(List.of("orwell-1984.jpeg"), storedNames());
            mockMvc.perform(get("/images/orwell-1984.jpeg")).andExpect(content().bytes(OTHER_JPEG));
        }

        @Test
        void replacingAfterATitleChangeDeletesTheOldFile() throws Exception {
            storeFile("orwell-old.jpg", JPEG);
            Book book = saveBook("Orwell", "1984", "images/orwell-old.jpg");

            upload(book.getId(), jpeg(OTHER_JPEG))
                    .andExpect(jsonPath("$.image").value("images/orwell-1984.jpeg"));

            assertEquals(List.of("orwell-1984.jpeg"), storedNames());
        }

        @Test
        void addsASuffixWhenAnotherBookUsesTheName() throws Exception {
            Book other = saveBook("Orwell", "1984", "images/orwell-1984.jpeg");
            storeFile("orwell-1984.jpeg", JPEG);
            Book book = saveBook("Orwell", "1984", null);

            upload(book.getId(), jpeg(OTHER_JPEG))
                    .andExpect(jsonPath("$.image").value("images/orwell-1984-2.jpeg"));

            assertEquals("images/orwell-1984.jpeg", bookRepository.findById(other.getId()).orElseThrow().getImage());
            mockMvc.perform(get("/images/orwell-1984.jpeg")).andExpect(content().bytes(JPEG));
        }

        @Test
        void rejectsANonJpegContentType() throws Exception {
            Book book = saveBook("Orwell", "1984", null);

            upload(book.getId(), new MockMultipartFile("file", "c.png", MediaType.IMAGE_PNG_VALUE, JPEG))
                    .andExpect(status().isBadRequest())
                    .andExpect(content().contentType(MediaType.APPLICATION_PROBLEM_JSON));

            assertEquals(List.of(), storedNames());
        }

        @Test
        void rejectsBytesThatAreNotAJpeg() throws Exception {
            Book book = saveBook("Orwell", "1984", null);

            upload(book.getId(), jpeg(new byte[]{(byte) 0x89, 'P', 'N', 'G'}))
                    .andExpect(status().isBadRequest());
            upload(book.getId(), jpeg(new byte[0]))
                    .andExpect(status().isBadRequest());

            assertEquals(List.of(), storedNames());
        }

        @Test
        void rejectsAFileOver2Mb() throws Exception {
            Book book = saveBook("Orwell", "1984", null);
            byte[] big = Arrays.copyOf(JPEG, 2 * 1024 * 1024 + 1);

            upload(book.getId(), jpeg(big))
                    .andExpect(status().isPayloadTooLarge())
                    .andExpect(content().contentType(MediaType.APPLICATION_PROBLEM_JSON));

            assertEquals(List.of(), storedNames());
        }

        @Test
        void rejectsAMissingFilePart() throws Exception {
            Book book = saveBook("Orwell", "1984", null);

            mockMvc.perform(multipart(HttpMethod.PUT, "/api/books/{id}/cover", book.getId()).with(admin()))
                    .andExpect(status().isBadRequest());
        }

        @Test
        void returns404ForAnUnknownBook() throws Exception {
            upload(MISSING_ID, jpeg(JPEG)).andExpect(status().isNotFound());

            assertEquals(List.of(), storedNames());
        }
    }

    @Test
    void deletingABookDeletesItsCover() throws Exception {
        storeFile("orwell-1984.jpg", JPEG);
        Book book = saveBook("Orwell", "1984", "images/orwell-1984.jpg");

        mockMvc.perform(delete("/api/books/{id}", book.getId()).with(admin()))
                .andExpect(status().isOk());

        assertEquals(List.of(), storedNames());
    }

    @Test
    void imageInTheCreateBodyIsIgnored() throws Exception {
        mockMvc.perform(post("/api/books/add").with(admin()).contentType(MediaType.APPLICATION_JSON).content("""
                        {"title": "t", "author": "a", "tag": "x", "wiki": "w", "image": "images/other.jpg"}"""))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.image").doesNotExist());
    }
}
