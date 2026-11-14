package com.bluemoon.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class HouseholdDTO {
    private Integer id;
    private String householdCode;
    private String apartmentNumber;
    private Integer floor;
    private BigDecimal area;
    private String ownerName;
    private String phone;
    private LocalDate moveInDate;
    private String status;
}

