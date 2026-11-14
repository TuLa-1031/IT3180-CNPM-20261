package com.bluemoon.service;

import com.bluemoon.entity.PaymentEntity;
import com.bluemoon.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;

    public List<PaymentEntity> findAll() {
        return paymentRepository.findAll();
    }
}

