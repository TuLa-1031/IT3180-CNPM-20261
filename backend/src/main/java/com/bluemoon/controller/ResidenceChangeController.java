package com.bluemoon.controller;

import com.bluemoon.dto.change.ResidenceChangeResponse;
import com.bluemoon.service.ResidenceChangeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@CrossOrigin
@RequiredArgsConstructor
@RequestMapping("/api/residence-changes")
public class ResidenceChangeController {

    private final ResidenceChangeService residenceChangeService;

    @GetMapping
    public ResponseEntity<List<ResidenceChangeResponse>> getAll(
            @RequestParam(required = false) Integer householdId,
            @RequestParam(required = false) String changeType
    ) {
        return ResponseEntity.ok(residenceChangeService.findAll(householdId, changeType));
    }
}

