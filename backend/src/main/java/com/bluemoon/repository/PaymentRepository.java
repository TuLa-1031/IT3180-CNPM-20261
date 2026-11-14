package com.bluemoon.repository;

import com.bluemoon.entity.PaymentEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<PaymentEntity, Integer> {

    List<PaymentEntity> findByHouseholdId(Integer householdId);

    List<PaymentEntity> findByFeeId(Integer feeId);
}
