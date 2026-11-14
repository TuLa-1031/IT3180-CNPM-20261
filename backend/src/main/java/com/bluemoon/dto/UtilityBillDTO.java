package com.bluemoon.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UtilityBillDTO {
    private Integer id;
    private Integer householdId;
    private String householdCode;
    private Integer feeId;
    private String serviceType;
    private Integer billingMonth;
    private Integer billingYear;
    private Integer previousIndex;
    private Integer currentIndex;
    private Integer usageAmount;
    private BigDecimal totalAmount;
    private String providerName;
    private String paymentStatus;
    private LocalDateTime paidAt;
    private String note;
}

