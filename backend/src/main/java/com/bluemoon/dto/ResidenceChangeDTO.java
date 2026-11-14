package com.bluemoon.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResidenceChangeDTO {
    private Integer id;
    private Integer residentId;
    private String residentName;
    private Integer householdId;
    private String householdCode;
    private String changeType;
    private LocalDate startDate;
    private LocalDate endDate;
    private String destinationOrOrigin;
    private String reason;
    private Integer createdBy;
}

