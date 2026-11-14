package com.bluemoon.controller;

import com.bluemoon.entity.HouseholdEntity;
import com.bluemoon.service.HouseholdService;
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
@RequestMapping("/api/households")
public class HouseholdController {

    private final HouseholdService householdService;

    @GetMapping
    public ResponseEntity<List<HouseholdEntity>> getAll() {
        return ResponseEntity.ok(householdService.findAll());
    }
}

