package com.bluemoon.dto;

import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Khuôn lỗi thống nhất cho mọi API (spec §7.3).
 * Không chứa stack trace hay thông tin nội bộ của hệ thống.
 */
public record ErrorResponse(
        LocalDateTime timestamp,
        int status,
        String code,
        String message,
        String path,
        List<FieldError> fieldErrors
) {

    public record FieldError(String field, String message) {}

    public static ErrorResponse of(HttpStatus status, String code, String message, String path) {
        return of(status, code, message, path, List.of());
    }

    public static ErrorResponse of(HttpStatus status, String code, String message, String path,
                                   List<FieldError> fieldErrors) {
        return new ErrorResponse(
                LocalDateTime.now(),
                status.value(),
                code,
                message,
                path,
                fieldErrors == null ? List.of() : fieldErrors
        );
    }
}
