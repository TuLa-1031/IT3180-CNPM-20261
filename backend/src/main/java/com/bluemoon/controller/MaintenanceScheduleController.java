package com.bluemoon.controller;

import com.bluemoon.dto.maintenance.MaintenanceScheduleResponse;
import com.bluemoon.service.MaintenanceScheduleService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/maintenance-schedules")
public class MaintenanceScheduleController {

    private final MaintenanceScheduleService maintenanceScheduleService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'TECHNICIAN')")
    public ResponseEntity<List<MaintenanceScheduleResponse>> getAll(
            @RequestParam(required = false) Integer equipmentId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(maintenanceScheduleService.findAll(equipmentId, from, to));
    }
}
