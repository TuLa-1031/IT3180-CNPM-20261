package com.bluemoon.security;

import com.bluemoon.dto.ErrorResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final ObjectMapper objectMapper;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(Customizer.withDefaults())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/api/auth/login", "/api/auth/register", "/api/health", "/error").permitAll()

                        // Tài khoản: chỉ ADMIN quản lý.
                        .requestMatchers("/api/users", "/api/users/**").hasRole("ADMIN")

                        // UC01 — hộ/nhân khẩu/biến động: kế toán chỉ đọc, kỹ thuật không có quyền.
                        .requestMatchers(HttpMethod.GET,
                                "/api/households", "/api/households/**",
                                "/api/residents", "/api/residents/**",
                                "/api/residence-changes", "/api/residence-changes/**")
                        .hasAnyRole("ADMIN", "MANAGER", "ACCOUNTANT")
                        .requestMatchers("/api/households", "/api/households/**",
                                "/api/residents", "/api/residents/**",
                                "/api/residence-changes", "/api/residence-changes/**")
                        .hasAnyRole("ADMIN", "MANAGER")

                        // UC02 — tài chính: kỹ thuật không có quyền; quản lý chỉ đọc; kế toán ghi.
                        .requestMatchers(HttpMethod.GET,
                                "/api/fees", "/api/fees/**",
                                "/api/payments", "/api/payments/**",
                                "/api/utility-bills", "/api/utility-bills/**",
                                "/api/stats", "/api/stats/**")
                        .hasAnyRole("ADMIN", "MANAGER", "ACCOUNTANT")
                        .requestMatchers("/api/fees", "/api/fees/**",
                                "/api/payments", "/api/payments/**",
                                "/api/utility-bills", "/api/utility-bills/**")
                        .hasAnyRole("ADMIN", "ACCOUNTANT")
                        .requestMatchers(HttpMethod.GET, "/api/transactions", "/api/transactions/**")
                        .hasAnyRole("ADMIN", "MANAGER", "ACCOUNTANT")
                        .requestMatchers("/api/transactions", "/api/transactions/**")
                        .hasAnyRole("ADMIN", "ACCOUNTANT")

                        // UC03 — phản ánh: kỹ thuật chỉ đọc; kế toán không có quyền.
                        .requestMatchers(HttpMethod.GET, "/api/feedbacks", "/api/feedbacks/**")
                        .hasAnyRole("ADMIN", "MANAGER", "TECHNICIAN")
                        .requestMatchers("/api/feedbacks", "/api/feedbacks/**")
                        .hasAnyRole("ADMIN", "MANAGER")

                        // UC04 — bảo trì: kỹ thuật đọc thiết bị/lịch và cập nhật việc của mình.
                        .requestMatchers(HttpMethod.GET,
                                "/api/equipment", "/api/equipment/**",
                                "/api/maintenance-schedules", "/api/maintenance-schedules/**")
                        .hasAnyRole("ADMIN", "MANAGER", "TECHNICIAN")
                        .requestMatchers("/api/equipment", "/api/equipment/**",
                                "/api/maintenance-schedules", "/api/maintenance-schedules/**")
                        .hasAnyRole("ADMIN", "MANAGER")
                        .requestMatchers("/api/maintenance-tasks", "/api/maintenance-tasks/**")
                        .hasAnyRole("ADMIN", "MANAGER", "TECHNICIAN")
                        .requestMatchers("/api/technicians", "/api/technicians/**")
                        .hasAnyRole("ADMIN", "MANAGER")

                        // UC05 — gửi xe/thẻ: kế toán chỉ đọc phương tiện; kỹ thuật không có quyền.
                        .requestMatchers(HttpMethod.GET,
                                "/api/vehicle-registrations", "/api/vehicle-registrations/**",
                                "/api/parking-cards", "/api/parking-cards/**")
                        .hasAnyRole("ADMIN", "MANAGER", "ACCOUNTANT")
                        .requestMatchers("/api/vehicle-registrations", "/api/vehicle-registrations/**",
                                "/api/parking-cards", "/api/parking-cards/**")
                        .hasAnyRole("ADMIN", "MANAGER")
                        .requestMatchers(HttpMethod.GET, "/api/vehicles", "/api/vehicles/**")
                        .hasAnyRole("ADMIN", "MANAGER", "ACCOUNTANT")
                        .requestMatchers("/api/vehicles", "/api/vehicles/**")
                        .hasAnyRole("ADMIN", "MANAGER")

                        // Còn lại: đã đăng nhập (auth/me, auth/password, notifications).
                        .anyRequest().authenticated()
                )
                .exceptionHandling(handler -> handler
                        .authenticationEntryPoint(this::onUnauthorized)
                        .accessDeniedHandler(accessDeniedHandler())
                )
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    private void onUnauthorized(HttpServletRequest request, HttpServletResponse response,
                                AuthenticationException exception) throws IOException {
        writeError(response, request, HttpStatus.UNAUTHORIZED, "INVALID_CREDENTIALS",
                "Phiên đăng nhập không hợp lệ hoặc đã hết hạn");
    }

    private AccessDeniedHandler accessDeniedHandler() {
        return (request, response, exception) -> writeError(
                response, request, HttpStatus.FORBIDDEN, "FORBIDDEN",
                "Bạn không có quyền thực hiện thao tác này");
    }

    private void writeError(HttpServletResponse response, HttpServletRequest request,
                            HttpStatus status, String code, String message) throws IOException {
        response.setStatus(status.value());
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        objectMapper.writeValue(response.getWriter(),
                ErrorResponse.of(status, code, message, request.getRequestURI(), List.of()));
    }
}
