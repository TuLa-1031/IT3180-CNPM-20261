package com.bluemoon.service;

import com.bluemoon.entity.UtilityBillEntity;
import com.bluemoon.repository.UtilityBillRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UtilityBillService {

    private final UtilityBillRepository utilityBillRepository;

    public List<UtilityBillEntity> findAll() {
        return utilityBillRepository.findAll();
    }
}

