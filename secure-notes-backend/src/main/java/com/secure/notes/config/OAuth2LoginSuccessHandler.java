package com.secure.notes.config;

import com.secure.notes.models.AppRole;
import com.secure.notes.models.Role;
import com.secure.notes.models.User;
import com.secure.notes.repositories.RoleRepository;
import com.secure.notes.repositories.UserRepository;
import com.secure.notes.security.LoginAttemptService;
import com.secure.notes.security.jwt.JwtUtils;
import com.secure.notes.security.services.UserDetailsImpl;
import com.secure.notes.services.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AccountExpiredException;
import org.springframework.security.authentication.AccountStatusException;
import org.springframework.security.authentication.AccountStatusUserDetailsChecker;
import org.springframework.security.authentication.CredentialsExpiredException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;
import java.io.IOException;
import java.util.Map;

@Component
public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {
    private static final Logger logger = LoggerFactory.getLogger(OAuth2LoginSuccessHandler.class);
    private static final int MAX_USERNAME_LENGTH = 20;

    private final UserService userService;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final JwtUtils jwtUtils;
    private final LoginAttemptService loginAttemptService;

    @Value("${frontend.url}")
    private String frontendUrl;

    public OAuth2LoginSuccessHandler(UserService userService, UserRepository userRepository,
                                     RoleRepository roleRepository, JwtUtils jwtUtils,
                                     LoginAttemptService loginAttemptService) {
        this.userService = userService;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.jwtUtils = jwtUtils;
        this.loginAttemptService = loginAttemptService;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        String registrationId = ((OAuth2AuthenticationToken) authentication).getAuthorizedClientRegistrationId();
        Map<String, Object> attributes = ((OAuth2User) authentication.getPrincipal()).getAttributes();

        String email = (String) attributes.get("email");
        String providerUsername;
        if ("github".equals(registrationId)) {
            providerUsername = (String) attributes.get("login");
        } else if ("google".equals(registrationId) && Boolean.TRUE.equals(attributes.get("email_verified"))) {
            providerUsername = email.split("@")[0];
        } else {
            providerUsername = null;
        }
        if (email == null || email.isBlank() || providerUsername == null || providerUsername.isBlank()) {
            logger.warn("OAuth2 login via {} rejected: no verified email", registrationId);
            redirectToLoginError(request, response, "email_unavailable");
            return;
        }

        String username = userService.findByEmail(email)
                .orElseGet(() -> registerOAuthUser(email, providerUsername, registrationId))
                .getUserName();
        loginAttemptService.unlockIfLockExpired(username);
        User user = userService.findByUsername(username);

        UserDetailsImpl userDetails = UserDetailsImpl.build(user);
        try {
            new AccountStatusUserDetailsChecker().check(userDetails);
        } catch (LockedException e) {
            redirectToLoginError(request, response, "account_locked");
            return;
        } catch (AccountExpiredException e) {
            redirectToLoginError(request, response, "account_expired");
            return;
        } catch (CredentialsExpiredException e) {
            redirectToLoginError(request, response, "credentials_expired");
            return;
        } catch (AccountStatusException e) {
            redirectToLoginError(request, response, "account_disabled");
            return;
        }

        boolean twoFactorRequired = userDetails.is2faEnabled();
        String jwtToken = twoFactorRequired
                ? jwtUtils.generatePending2faToken(userDetails)
                : jwtUtils.generateTokenFromUsername(userDetails);
        String targetUrl = UriComponentsBuilder.fromUriString(frontendUrl + "/oauth2/redirect")
                .queryParam("token", jwtToken)
                .queryParam("twoFactorRequired", twoFactorRequired)
                .build().toUriString();
        clearAuthenticationAttributes(request);
        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }

    private User registerOAuthUser(String email, String providerUsername, String registrationId) {
        Role userRole = roleRepository.findByRoleName(AppRole.ROLE_USER)
                .orElseThrow(() -> new RuntimeException("Default role not found"));
        User newUser = new User(uniqueUsername(providerUsername), email);
        newUser.setRole(userRole);
        newUser.setSignUpMethod(registrationId);
        return userService.registerUser(newUser);
    }

    private String uniqueUsername(String base) {
        String candidate = truncate(base, MAX_USERNAME_LENGTH);
        int suffix = 1;
        while (userRepository.existsByUserName(candidate)) {
            String suffixText = String.valueOf(suffix++);
            candidate = truncate(base, MAX_USERNAME_LENGTH - suffixText.length()) + suffixText;
        }
        return candidate;
    }

    private static String truncate(String value, int maxLength) {
        return value.length() > maxLength ? value.substring(0, maxLength) : value;
    }

    private void redirectToLoginError(HttpServletRequest request, HttpServletResponse response,
                                      String error) throws IOException {
        String targetUrl = UriComponentsBuilder.fromUriString(frontendUrl + "/login")
                .queryParam("error", error)
                .build().toUriString();
        clearAuthenticationAttributes(request);
        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}
