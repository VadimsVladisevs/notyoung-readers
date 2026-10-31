package org.readersclub.service;

import org.readersclub.configuration.PasswordProperties;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;
import java.security.NoSuchAlgorithmException;
import java.security.spec.InvalidKeySpecException;
import java.security.spec.KeySpec;
import java.util.Arrays;
import java.util.Base64;

@Service
public class PasswordService {

    private final PasswordProperties passwordProperties;

    public PasswordService(PasswordProperties passwordProperties) {
        this.passwordProperties = passwordProperties;
    }

    public boolean checkPassword(String password) throws InvalidKeySpecException, NoSuchAlgorithmException {
        if (!StringUtils.hasLength(password)) {
            return false;
        }

        String hashedPassword = hashPassword(password);

        return comparePasswords(hashedPassword);
    }

    private String hashPassword(String password) throws InvalidKeySpecException, NoSuchAlgorithmException {
        byte[] salt = new byte[16];
        Arrays.fill(salt, (byte) 1);
        KeySpec spec = new PBEKeySpec(password.toCharArray(), salt, 65536, 128);
        SecretKeyFactory f = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA1");
        byte[] hashBytes = f.generateSecret(spec).getEncoded();

        return Base64.getEncoder().encodeToString(hashBytes);
    }

    private boolean comparePasswords(String hashedPassword) {
        return passwordProperties.getPasswordHash().equals(hashedPassword);
    }
}
