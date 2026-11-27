package com.bluemoon.dto.maintenance;

import com.bluemoon.enums.MaintenanceFrequency;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MaintenanceScheduleResponse {
    private Integer id;
    private Integer equipmentId;
    private LocalDate plannedDate;
    private MaintenanceFrequency frequency;
    private String note;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
