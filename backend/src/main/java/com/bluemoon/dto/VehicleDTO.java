package com.bluemoon.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VehicleDTO {
    private Integer id;
    private Integer householdId;
    private String householdCode;
    private String vehicleType;
    private String licensePlate;
    private String brand;
    private BigDecimal monthlyFee;
    private LocalDate registeredDate;
    private String status;
    private String note;
}

