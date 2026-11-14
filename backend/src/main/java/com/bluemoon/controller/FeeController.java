package com.bluemoon.controller;

import com.bluemoon.entity.FeeEntity;
import com.bluemoon.service.FeeService;
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
@RequestMapping("/api/fees")
public class FeeController {

    private final FeeService feeService;

    @GetMapping
    public ResponseEntity<List<FeeEntity>> getAll() {
        return ResponseEntity.ok(feeService.findAll());
    }
}

