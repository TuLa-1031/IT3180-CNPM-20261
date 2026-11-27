package com.bluemoon.dto.maintenance;

import com.bluemoon.enums.Priority;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MaintenanceTaskResponse {
    private Integer id;
    private Integer equipmentId;
    private Integer scheduleId;
    private Integer technicianId;
    private String title;
    private String description;
    private Priority priority;
    private LocalDate startDate;
    private LocalDate endDate;
    private String status;
    private String result;
    private Integer acceptedBy;
    private LocalDateTime acceptedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
