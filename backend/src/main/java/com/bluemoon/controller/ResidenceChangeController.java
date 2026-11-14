package com.bluemoon.controller;

import com.bluemoon.entity.ResidenceChangeEntity;
import com.bluemoon.service.ResidenceChangeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@CrossOrigin
@RequiredArgsConstructor
@RequestMapping("/api/residence-changes")
public class ResidenceChangeController {

    private final ResidenceChangeService residenceChangeService;

    @GetMapping
    public ResponseEntity<List<ResidenceChangeEntity>> getAll() {
        return ResponseEntity.ok(residenceChangeService.findAll());
    }
}

