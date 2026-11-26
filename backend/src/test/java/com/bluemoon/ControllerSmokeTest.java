package com.bluemoon;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class ControllerSmokeTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    /** Các endpoint nghiệp vụ yêu cầu JWT sau khi bật bảo mật ở GĐ1. */
    private String bearerToken(String username, String password) throws Exception {
        String body = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"" + username + "\",\"password\":\"" + password + "\"}"))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        return "Bearer " + objectMapper.readTree(body).get("token").asText();
    }

    private String bearerToken() throws Exception {
        return bearerToken("admin", "123456");
    }

    @Test
    void testHealthEndpoint() throws Exception {
        mockMvc.perform(get("/api/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"))
                .andExpect(jsonPath("$.dbConnected").value(true));
    }

    @Test
    void testUsersFindAllHidesPassword() throws Exception {
        mockMvc.perform(get("/api/users").header(HttpHeaders.AUTHORIZATION, bearerToken()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].username").value("admin"))
                .andExpect(content().string(not(containsString("password"))));
    }

    @Test
    void testTechnicianCannotReadResidentOrFinancialData() throws Exception {
        String token = bearerToken("kythuat", "123456");
        String[] forbidden = {
                "/api/households", "/api/residents", "/api/fees", "/api/payments",
                "/api/utility-bills", "/api/vehicles", "/api/stats/overview"
        };

        for (String endpoint : forbidden) {
            mockMvc.perform(get(endpoint).header(HttpHeaders.AUTHORIZATION, token))
                    .andExpect(status().isForbidden());
        }
    }

    @Test
    void testAccountantCannotReadFeedbackOrManageUsers() throws Exception {
        String token = bearerToken("ketoan", "123456");

        mockMvc.perform(get("/api/feedbacks").header(HttpHeaders.AUTHORIZATION, token))
                .andExpect(status().isForbidden());
        mockMvc.perform(get("/api/users").header(HttpHeaders.AUTHORIZATION, token))
                .andExpect(status().isForbidden());
    }

    @Test
    void testManagerCanReadFees() throws Exception {
        mockMvc.perform(get("/api/fees").header(HttpHeaders.AUTHORIZATION, bearerToken("quanly", "123456")))
                .andExpect(status().isOk());
    }

    @Test
    void testAllFindAllEndpoints() throws Exception {
        String token = bearerToken();
        String[] endpoints = {
                "/api/households",
                "/api/residents",
                "/api/residence-changes",
                "/api/fees",
                "/api/payments",
                "/api/vehicles",
                "/api/utility-bills"
        };

        for (String endpoint : endpoints) {
            mockMvc.perform(get(endpoint).header(HttpHeaders.AUTHORIZATION, token))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$").isArray())
                    .andExpect(jsonPath("$.length()").value(org.hamcrest.Matchers.greaterThan(0)));
        }
    }
}

