package com.bluemoon.exception;

import com.bluemoon.dto.ErrorResponse;
import lombok.Getter;
import org.springframework.http.HttpStatus;

import java.util.List;

/**
 * Lỗi nghiệp vụ có mã ổn định theo spec §7.5.
 * Service ném exception này, GlobalExceptionHandler chuyển thành JSON lỗi.
 */
@Getter
public class BusinessException extends RuntimeException {

    private final String code;
    private final HttpStatus status;
    private final List<ErrorResponse.FieldError> fieldErrors;

    public BusinessException(String code, HttpStatus status, String message) {
        this(code, status, message, List.of());
    }

    public BusinessException(String code, HttpStatus status, String message,
                             List<ErrorResponse.FieldError> fieldErrors) {
        super(message);
        this.code = code;
        this.status = status;
        this.fieldErrors = fieldErrors == null ? List.of() : fieldErrors;
    }
}
