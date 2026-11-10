package com.bluemoon.controller;

import com.bluemoon.config.DatabaseConnection;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;

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
                ? "Ket noi co so du lieu MySQL thanh cong"
                : "Khong the ket noi toi co so du lieu MySQL");

        return ResponseEntity.ok(response);
    }
}

