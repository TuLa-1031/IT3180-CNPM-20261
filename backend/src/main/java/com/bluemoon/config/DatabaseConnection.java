package com.bluemoon.config;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Properties;

/**
 * Lop quan ly ket noi co so du lieu MySQL bang JDBC.
 * Thu tu uu tien doc cau hinh: Bien moi truong -> file .env -> application.properties.
 */
public class DatabaseConnection {

    private static final Properties appProps = loadAppProperties();
    private static final Map<String, String> envFileValues = loadDotEnv();

    private DatabaseConnection() {
    }

    /**
     * Tao va tra ve mot ket noi moi toi MySQL.
     */
    public static Connection getConnection() throws SQLException {
        String host = getConfig("DB_HOST", "db.host", "localhost");
        String port = getConfig("DB_PORT", "db.port", "3306");
        String dbName = getConfig("DB_NAME", "db.name", "bluemoon_db");
        String user = getConfig("DB_USER", "db.user", "root");
        String password = getConfig("DB_PASS", "db.pass", "");

        String url = String.format(
                "jdbc:mysql://%s:%s/%s?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=Asia/Ho_Chi_Minh&characterEncoding=UTF-8",
                host, port, dbName
        );

        return DriverManager.getConnection(url, user, password);
    }

    /**
     * Dong ket noi an toan sau khi su dung.
     */
    public static void closeConnection(Connection connection) {
        if (connection != null) {
            try {
                if (!connection.isClosed()) {
                    connection.close();
                }
            } catch (SQLException e) {
                System.err.println("Loi khi dong ket noi MySQL: " + e.getMessage());
            }
        }
    }

    /**
     * Kiem tra ket noi toi MySQL co hoat dong khong.
     */
    public static boolean testConnection() {
        try (Connection conn = getConnection()) {
            return conn != null && conn.isValid(3);
        } catch (SQLException e) {
            System.err.println("Khong the ket noi toi MySQL: " + e.getMessage());
            return false;
        }
    }

    public static String getDatabaseName() {
        return getConfig("DB_NAME", "db.name", "bluemoon_db");
    }

    private static String getConfig(String envKey, String propKey, String defaultValue) {
        String sysEnv = System.getenv(envKey);
        if (sysEnv != null && !sysEnv.isEmpty()) {
            return sysEnv;
        }

        String dotEnvVal = envFileValues.get(envKey);
        if (dotEnvVal != null && !dotEnvVal.isEmpty()) {
            return dotEnvVal;
        }

        String propVal = appProps.getProperty(propKey);
        if (propVal != null && !propVal.isEmpty()) {
            return propVal;
        }

        return defaultValue;
    }

    private static Properties loadAppProperties() {
        Properties props = new Properties();
        try (InputStream is = DatabaseConnection.class.getClassLoader().getResourceAsStream("application.properties")) {
            if (is != null) {
                props.load(is);
            }
        } catch (IOException e) {
            System.err.println("Khong doc duoc application.properties: " + e.getMessage());
        }
        return props;
    }

    private static Map<String, String> loadDotEnv() {
        Map<String, String> values = new HashMap<>();
        List<Path> candidates = List.of(
                Paths.get(".env"),
                Paths.get("backend", ".env"),
                Paths.get("..", ".env")
        );

        for (Path path : candidates) {
            if (Files.isRegularFile(path)) {
                try {
                    List<String> lines = Files.readAllLines(path, StandardCharsets.UTF_8);
                    for (String rawLine : lines) {
                        String line = rawLine.trim();
                        if (line.isEmpty() || line.startsWith("#")) {
                            continue;
                        }
                        int idx = line.indexOf('=');
                        if (idx > 0) {
                            String key = line.substring(0, idx).trim();
                            String val = line.substring(idx + 1).trim();
                            values.put(key, val);
                        }
                    }
                } catch (IOException e) {
                    System.err.println("Khong doc duoc file .env tai " + path + ": " + e.getMessage());
                }
                break;
            }
        }
        return values;
    }
}

