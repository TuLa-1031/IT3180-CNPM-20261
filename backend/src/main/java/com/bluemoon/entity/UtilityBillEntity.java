package com.bluemoon.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "utility_bills")
@NoArgsConstructor
@AllArgsConstructor
public class UtilityBillEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "household_id", nullable = false)
    private Integer householdId;

    @Column(name = "fee_id")
    private Integer feeId;

    @Column(name = "service_type", nullable = false, length = 20)
    private String serviceType;

    @Column(name = "billing_month", nullable = false, columnDefinition = "TINYINT")
    private Integer billingMonth;

    @Column(name = "billing_year", nullable = false, columnDefinition = "SMALLINT")
    private Integer billingYear;

    @Column(name = "previous_index", nullable = false)
    private Integer previousIndex = 0;

    @Column(name = "current_index", nullable = false)
    private Integer currentIndex = 0;

    @Column(name = "usage_amount", nullable = false)
    private Integer usageAmount = 0;

    @Column(name = "total_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalAmount = BigDecimal.ZERO;

    @Column(name = "provider_name", length = 100)
    private String providerName;

    @Column(name = "payment_status", nullable = false, length = 20)
    private String paymentStatus = "UNPAID";

    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    @Column(name = "note", columnDefinition = "TEXT")
    private String note;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}

