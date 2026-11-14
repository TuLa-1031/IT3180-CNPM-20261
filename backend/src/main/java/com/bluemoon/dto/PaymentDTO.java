package com.bluemoon.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentDTO {
    private Integer id;
    private Integer householdId;
    private String householdCode;
    private String ownerName;
    private Integer feeId;
    private String feeName;
    private BigDecimal amountDue;
    private BigDecimal amountPaid;
    private LocalDateTime paymentDate;
    private String paymentMethod;
    private String status;
    private Integer collectedBy;
    private String note;
}

