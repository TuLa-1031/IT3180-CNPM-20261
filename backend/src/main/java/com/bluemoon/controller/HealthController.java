package com.bluemoon.controller;

import com.bluemoon.config.DatabaseConnection;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class HealthController {

    private final DatabaseConnection databaseConnection;

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        boolean dbConnected = databaseConnection.testConnection();

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("status", dbConnected ? "UP" : "DOWN");
        response.put("database", databaseConnection.getDatabaseName());
        response.put("dbConnected", dbConnected);
        response.put("message", dbConnected
                ? "Connected to MySQL database successfully"
                : "Failed to connect to MySQL database");

        return ResponseEntity.ok(response);
    }
}
