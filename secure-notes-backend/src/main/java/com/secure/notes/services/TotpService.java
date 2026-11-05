package com.secure.notes.services;

import com.warrenstrange.googleauth.GoogleAuthenticatorKey;

public interface TotpService {
    GoogleAuthenticatorKey generateSecret();

    String getOtpAuthUri(GoogleAuthenticatorKey secret, String username);

    boolean verifyCode(String secret, int code);
}
