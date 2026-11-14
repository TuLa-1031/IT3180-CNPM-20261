package com.bluemoon;

import com.bluemoon.config.DatabaseConnection;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.Statement;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
class DatabaseConnectionTest {

    @Autowired
    private DatabaseConnection databaseConnection;

    @Test
    void testGetConnectionAndQuery() throws Exception {
        try (Connection conn = databaseConnection.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery("SELECT COUNT(*) FROM households")) {
            assertNotNull(conn);
            assertFalse(conn.isClosed());
            assertTrue(rs.next());
            assertTrue(rs.getInt(1) >= 0);
        }
    }

    @Test
    void testConnectionHelper() {
        assertTrue(databaseConnection.testConnection());
    }
}
