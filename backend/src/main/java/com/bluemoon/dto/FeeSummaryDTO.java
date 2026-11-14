package com.bluemoon.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FeeSummaryDTO {
    private Integer feeId;
    private String feeCode;
    private String feeName;
    private String feeType;
    private Long totalHouseholds;
    private Long paidHouseholds;
    private BigDecimal totalCollected;
}

