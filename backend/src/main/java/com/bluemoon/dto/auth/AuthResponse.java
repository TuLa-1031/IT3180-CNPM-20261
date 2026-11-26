package com.bluemoon.dto.auth;

/** Kết quả đăng nhập: token để gắn vào mọi request sau, kèm hồ sơ người dùng. */
public record AuthResponse(String token, UserResponse user) {}
