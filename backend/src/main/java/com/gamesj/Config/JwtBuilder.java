package com.gamesj.Config;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import java.security.Key;
import java.util.Date;

public class JwtBuilder {
    private static final long EXPIRATION_TIME_MS = 60*60*1000; // 1 hour

    private static final Key SECRET_KEY = loadSecretKey();

    private static Key loadSecretKey() {
      String secret = System.getenv("JWT_SECRET");

      if (secret == null || secret.length() < 32) {
        throw new IllegalStateException(
            "JWT_SECRET env variable is missing or too short (min 32 chars)"
        );
      }

      return Keys.hmacShaKeyFor(secret.getBytes());
    }

    public static Key getSecretKey() {
        return SECRET_KEY;
    }

    public static String generateToken(int userId, String username) {
      return Jwts.builder()
              .setSubject(username)
              .claim("userId", userId)
              .setIssuedAt(new Date())
              .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME_MS))
              .signWith(SECRET_KEY, SignatureAlgorithm.HS256)
              .compact();
    }
}
