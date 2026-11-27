package com.bluemoon.dto.maintenance;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EquipmentResponse {
    private Integer id;
    private String name;
    private String location;
    private String status;
    private LocalDate installedAt;
    private String note;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
