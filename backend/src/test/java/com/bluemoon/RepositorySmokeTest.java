package com.bluemoon;

import com.bluemoon.repository.FeeRepository;
import com.bluemoon.repository.HouseholdRepository;
import com.bluemoon.repository.PaymentRepository;
import com.bluemoon.repository.ResidenceChangeRepository;
import com.bluemoon.repository.ResidentRepository;
import com.bluemoon.repository.UserRepository;
import com.bluemoon.repository.UtilityBillRepository;
import com.bluemoon.repository.VehicleRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
class RepositorySmokeTest {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private HouseholdRepository householdRepository;
    @Autowired
    private ResidentRepository residentRepository;
    @Autowired
    private ResidenceChangeRepository residenceChangeRepository;
    @Autowired
    private FeeRepository feeRepository;
    @Autowired
    private PaymentRepository paymentRepository;
    @Autowired
    private VehicleRepository vehicleRepository;
    @Autowired
    private UtilityBillRepository utilityBillRepository;

    @Test
    void testAllRepositoriesFindAll() {
        assertFalse(userRepository.findAll().isEmpty());
        assertFalse(householdRepository.findAll().isEmpty());
        assertFalse(residentRepository.findAll().isEmpty());
        assertFalse(residenceChangeRepository.findAll().isEmpty());
        assertFalse(feeRepository.findAll().isEmpty());
        assertFalse(paymentRepository.findAll().isEmpty());
        assertFalse(vehicleRepository.findAll().isEmpty());
        assertFalse(utilityBillRepository.findAll().isEmpty());
    }

    @Test
    void testDerivedQueries() {
        assertTrue(userRepository.findByUsername("admin").isPresent());
        assertTrue(householdRepository.findByHouseholdCode("BM-0601").isPresent());
        assertTrue(feeRepository.findByFeeCode("DV-2026-10").isPresent());
        assertFalse(residentRepository.findByHouseholdId(1).isEmpty());
        assertFalse(paymentRepository.findByHouseholdId(1).isEmpty());
        assertFalse(vehicleRepository.findByHouseholdId(1).isEmpty());
        assertFalse(utilityBillRepository.findByHouseholdId(1).isEmpty());
    }
}
