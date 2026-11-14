package com.bluemoon.controller;

import com.bluemoon.entity.ResidentEntity;
import com.bluemoon.service.ResidentService;
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
@RequestMapping("/api/residents")
public class ResidentController {

    private final ResidentService residentService;

    @GetMapping
    public ResponseEntity<List<ResidentEntity>> getAll() {
        return ResponseEntity.ok(residentService.findAll());
    }
}

