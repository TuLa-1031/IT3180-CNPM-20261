package com.bluemoon.controller;

import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bluemoon.config.DatabaseConnection;

@RestController
@RequestMapping("/api")
public class HealthController {

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        boolean dbConnected = DatabaseConnection.testConnection();

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("status", dbConnected ? "UP" : "DOWN");
        response.put("database", DatabaseConnection.getDatabaseName());
        response.put("dbConnected", dbConnected);
        response.put("message", dbConnected
                ? "Connected to MySQL database successfully"
                : "Failed to connect to MySQL database");

        return ResponseEntity.ok(response);
    }
}
