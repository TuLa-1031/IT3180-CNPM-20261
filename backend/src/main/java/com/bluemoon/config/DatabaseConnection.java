package com.bluemoon.config;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;

@Slf4j
@Component
@RequiredArgsConstructor
public class DatabaseConnection {

    private final DataSource dataSource;

    @Getter
    @Value("${DB_NAME:bluemoon_db}")
    private String databaseName;

    public Connection getConnection() throws SQLException {
        return dataSource.getConnection();
    }

    public boolean testConnection() {
        try (Connection conn = dataSource.getConnection()) {
            return conn.isValid(3);
        } catch (SQLException e) {
            log.error("Failed to connect to MySQL database: {}", e.getMessage());
            return false;
        }
    }
}
