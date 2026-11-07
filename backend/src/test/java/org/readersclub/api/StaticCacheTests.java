package org.readersclub.api;

import org.junit.jupiter.api.Test;
import org.readersclub.IntegrationTest;
import org.springframework.http.HttpHeaders;

import static org.hamcrest.Matchers.allOf;
import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class StaticCacheTests extends IntegrationTest {

    @Test
    void hashedAssetsAreCachedForAYear() throws Exception {
        mockMvc.perform(get("/assets/test-asset.js"))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.CACHE_CONTROL,
                        allOf(containsString("max-age=31536000"), containsString("public"), containsString("immutable"))));
    }

    @Test
    void indexHtmlIsNotCachedSoADeployIsPickedUpAtOnce() throws Exception {
        mockMvc.perform(get("/index.html"))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.CACHE_CONTROL, containsString("no-store")));
    }
}
