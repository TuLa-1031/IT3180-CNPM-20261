package com.bluemoon.service;

import com.bluemoon.entity.FeeEntity;
import com.bluemoon.repository.FeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FeeService {

    private final FeeRepository feeRepository;

    public List<FeeEntity> findAll() {
        return feeRepository.findAll();
    }
}

