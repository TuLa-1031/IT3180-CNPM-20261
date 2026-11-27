package com.bluemoon.controller;

import com.bluemoon.dto.maintenance.EquipmentResponse;
import com.bluemoon.service.EquipmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/equipment")
public class EquipmentController {

    private final EquipmentService equipmentService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'TECHNICIAN')")
    public ResponseEntity<List<EquipmentResponse>> getAll(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String q) {
        return ResponseEntity.ok(equipmentService.findAll(status, q));
    }
}
