package com.bluemoon.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FeeDTO {
    private Integer id;
    private String feeCode;
    private String name;
    private String feeType;
    private Boolean isMandatory;
    private String calculationMethod;
    private BigDecimal unitPrice;
    private Integer billingMonth;
    private Integer billingYear;
    private LocalDate startDate;
    private LocalDate dueDate;
    private String description;
    private String status;
}

