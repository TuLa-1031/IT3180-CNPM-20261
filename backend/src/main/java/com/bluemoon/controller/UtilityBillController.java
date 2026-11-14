package com.bluemoon.controller;

import com.bluemoon.entity.UtilityBillEntity;
import com.bluemoon.service.UtilityBillService;
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
@RequestMapping("/api/utility-bills")
public class UtilityBillController {

    private final UtilityBillService utilityBillService;

    @GetMapping
    public ResponseEntity<List<UtilityBillEntity>> getAll() {
        return ResponseEntity.ok(utilityBillService.findAll());
    }
}

