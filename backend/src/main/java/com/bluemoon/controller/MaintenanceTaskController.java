package com.bluemoon.controller;

import com.bluemoon.dto.maintenance.MaintenanceTaskResponse;
import com.bluemoon.service.MaintenanceTaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/maintenance-tasks")
public class MaintenanceTaskController {

    private final MaintenanceTaskService maintenanceTaskService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'TECHNICIAN')")
    public ResponseEntity<List<MaintenanceTaskResponse>> getAll(
            Authentication authentication,
            @RequestParam(required = false) Integer technicianId,
            @RequestParam(required = false) String status) {
        String username = authentication == null ? null : authentication.getName();
        return ResponseEntity.ok(maintenanceTaskService.findAll(technicianId, status, username));
    }
}
