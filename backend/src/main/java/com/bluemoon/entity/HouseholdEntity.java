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
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "households")
@NoArgsConstructor
@AllArgsConstructor
public class HouseholdEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "household_code", nullable = false, unique = true, length = 20)
    private String householdCode;

    @Column(name = "apartment_number", nullable = false, length = 20)
    private String apartmentNumber;

    @Column(name = "floor", nullable = false)
    private Integer floor;

    @Column(name = "area", nullable = false, precision = 8, scale = 2)
    private BigDecimal area;

    @Column(name = "owner_name", nullable = false, length = 100)
    private String ownerName;

    @Column(name = "phone", length = 20)
    private String phone;

    @Column(name = "move_in_date")
    private LocalDate moveInDate;

    @Column(name = "status", nullable = false, length = 20)
    private String status = "ACTIVE";

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}

