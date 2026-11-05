package com.secure.notes.controllers;

import com.secure.notes.models.AppRole;
import com.secure.notes.models.Role;
import com.secure.notes.models.User;
import com.secure.notes.repositories.RoleRepository;
import com.secure.notes.repositories.UserRepository;
import com.secure.notes.security.LoginAttemptService;
import com.secure.notes.security.TwoFactorAttemptLimiter;
import com.secure.notes.security.jwt.JwtUtils;
import com.secure.notes.security.request.LoginRequest;
import com.secure.notes.security.request.SignupRequest;
import com.secure.notes.security.response.LoginResponse;
import com.secure.notes.security.response.MessageResponse;
import com.secure.notes.security.response.UserInfoResponse;
import com.secure.notes.security.services.UserDetailsImpl;
import com.secure.notes.services.TotpService;
import com.secure.notes.services.UserService;
import com.secure.notes.util.AuthUtil;
import com.warrenstrange.googleauth.GoogleAuthenticatorKey;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AccountExpiredException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.CredentialsExpiredException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    JwtUtils jwtUtils;

    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    RoleRepository roleRepository;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    UserService userService;

    @Autowired
    AuthUtil authUtil;

    @Autowired
    TotpService totpService;

    @Autowired
    TwoFactorAttemptLimiter twoFactorAttemptLimiter;

    @Autowired
    LoginAttemptService loginAttemptService;

    @PostMapping("/public/signin")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {
        String username = loginRequest.getUsername();
        loginAttemptService.unlockIfLockExpired(username);

        Authentication authentication;
        try {
            authentication = authenticationManager
                    .authenticate(new UsernamePasswordAuthenticationToken(username, loginRequest.getPassword()));
        } catch (BadCredentialsException exception) {
            boolean lockedNow = loginAttemptService.recordFailure(username);
            return loginError(lockedNow
                    ? "Too many failed sign-in attempts. Your account is locked for "
                        + LoginAttemptService.LOCK_DURATION.toMinutes() + " minutes."
                    : "Invalid username or password");
        } catch (LockedException exception) {
            return loginError(loginAttemptService.temporaryLockEnd(username)
                    .map(end -> "Too many failed sign-in attempts. Try again in "
                            + minutesUntil(end) + " minutes.")
                    .orElse("Your account has been locked by an administrator."));
        } catch (DisabledException exception) {
            return loginError("Your account has been disabled. Contact an administrator.");
        } catch (AccountExpiredException exception) {
            return loginError("Your account has expired. Contact an administrator.");
        } catch (CredentialsExpiredException exception) {
            Map<String, Object> map = new HashMap<>();
            map.put("message", "Your password has expired. Reset it using Forgot password.");
            map.put("credentialsExpired", true);
            map.put("status", false);
            return new ResponseEntity<Object>(map, HttpStatus.UNAUTHORIZED);
        } catch (AuthenticationException exception) {
            return loginError("Invalid username or password");
        }

        loginAttemptService.recordSuccess(username);
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        if (userDetails.is2faEnabled()) {
            String pendingToken = jwtUtils.generatePending2faToken(userDetails);
            return ResponseEntity.ok(new LoginResponse(userDetails.getUsername(), List.of(), pendingToken));
        }

        SecurityContextHolder.getContext().setAuthentication(authentication);

        String jwtToken = jwtUtils.generateTokenFromUsername(userDetails);

        List<String> roles = userDetails.getAuthorities().stream()
                .map(item -> item.getAuthority())
                .collect(Collectors.toList());

        LoginResponse response = new LoginResponse(userDetails.getUsername(), roles, jwtToken);

        return ResponseEntity.ok(response);
    }

    private ResponseEntity<Object> loginError(String message) {
        Map<String, Object> map = new HashMap<>();
        map.put("message", message);
        map.put("status", false);
        return new ResponseEntity<>(map, HttpStatus.UNAUTHORIZED);
    }

    private static long minutesUntil(LocalDateTime end) {
        long seconds = Duration.between(LocalDateTime.now(), end).getSeconds();
        return Math.max(1, (seconds + 59) / 60);
    }

    @PostMapping("/public/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        if (userRepository.existsByUserName(signUpRequest.getUsername())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Username is already taken!"));
        }

        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Email is already in use!"));
        }

        User user = new User(signUpRequest.getUsername(),
                signUpRequest.getEmail(),
                encoder.encode(signUpRequest.getPassword()));

        Role role = roleRepository.findByRoleName(AppRole.ROLE_USER)
                .orElseThrow(() -> new RuntimeException("Error: Role is not found."));

        user.setAccountNonLocked(true);
        user.setAccountNonExpired(true);
        user.setCredentialsNonExpired(true);
        user.setEnabled(true);
        user.setCredentialsExpiryDate(LocalDate.now().plusYears(1));
        user.setTwoFactorEnabled(false);
        user.setSignUpMethod("email");
        user.setRole(role);
        userRepository.save(user);

        return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
    }

    @GetMapping("/user")
    public ResponseEntity<?> getUserDetails(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.findByUsername(userDetails.getUsername());

        List<String> roles = userDetails.getAuthorities().stream()
                .map(item -> item.getAuthority())
                .collect(Collectors.toList());

        UserInfoResponse response = new UserInfoResponse(
                user.getUserId(),
                user.getUserName(),
                user.getEmail(),
                user.isAccountNonLocked(),
                user.isAccountNonExpired(),
                user.isCredentialsNonExpired(),
                user.isEnabled(),
                user.getCredentialsExpiryDate(),
                user.getAccountExpiryDate(),
                user.isTwoFactorEnabled(),
                roles,
                user.getSignUpMethod()
        );

        return ResponseEntity.ok().body(response);
    }

    @PostMapping("/public/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestParam String email) {
        try {
            userService.generatePasswordResetToken(email);
        } catch (Exception e) {
            logger.error("Failed to send password reset email", e);
        }
        return ResponseEntity.ok(new MessageResponse(
                "If an account exists for this email, a password reset link has been sent"));
    }

    @PostMapping("/public/reset-password")
    public ResponseEntity<?> resetPassword(@RequestParam String token, @RequestParam String newPassword) {
        try {
            userService.resetPassword(token, newPassword);
            return ResponseEntity.ok(new MessageResponse("Password reset successful"));
        }catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new MessageResponse(e.getMessage()));
        }
    }

    @PostMapping("/enable-2fa")
    public ResponseEntity<?> enable2fa() {
        User user = authUtil.loggedInUser();
        GoogleAuthenticatorKey secret;
        try {
            secret = userService.generatePending2FASecret(user.getUserId());
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
        return ResponseEntity.ok(totpService.getOtpAuthUri(secret, user.getUserName()));
    }

    @PostMapping("/update-password")
    public ResponseEntity<?> updateOwnPassword(@RequestParam String currentPassword, @RequestParam String newPassword) {
        try {
            userService.changePassword(authUtil.loggedInUserId(), currentPassword, newPassword);
            return ResponseEntity.ok(new MessageResponse("Password updated"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @PostMapping("/disable-2fa")
    public ResponseEntity<MessageResponse> disable2fa(@RequestParam int code) {
        User user = authUtil.loggedInUser();
        String username = user.getUserName();
        if (twoFactorAttemptLimiter.isBlocked(username)) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(new MessageResponse("Too many invalid codes, try again in a few minutes"));
        }
        if (!userService.validate2FACode(user.getUserId(), code)) {
            twoFactorAttemptLimiter.recordFailure(username);
            return ResponseEntity.badRequest().body(new MessageResponse("Invalid 2FA Code"));
        }
        twoFactorAttemptLimiter.reset(username);
        userService.disable2FA(user.getUserId());
        return ResponseEntity.ok(new MessageResponse("2FA disabled"));
    }

    @PostMapping("/verify-2fa")
    public ResponseEntity<String> verify2FA(@RequestParam int code) {
        Long userId = authUtil.loggedInUserId();
        if (userService.confirm2FA(userId, code)) {
            return ResponseEntity.ok("2FA Verified");
        } else {
            return ResponseEntity.badRequest().body("Invalid 2FA Code");
        }
    }

    @GetMapping("/user/2fa-status")
    public ResponseEntity<?> get2FAStatus() {
        User user = authUtil.loggedInUser();
        if(user != null) {
            return ResponseEntity.ok().body(Map.of("is2faEnabled", user.isTwoFactorEnabled()));
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }
    }

    @PostMapping("/public/verify-2fa-login")
    public ResponseEntity<?> verify2FALogin(@RequestParam int code, @RequestParam String jwtToken) {
        if (!jwtUtils.validateJwtToken(jwtToken) || !jwtUtils.isPending2faToken(jwtToken)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new MessageResponse("Login session is invalid or expired, please sign in again"));
        }

        String username = jwtUtils.getUserNameFromJwtToken(jwtToken);
        if (twoFactorAttemptLimiter.isBlocked(username)) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(new MessageResponse("Too many invalid codes, try again in a few minutes"));
        }

        User user = userService.findByUsername(username);
        if (!userService.validate2FACode(user.getUserId(), code)) {
            twoFactorAttemptLimiter.recordFailure(username);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponse("Invalid 2FA Code"));
        }
        twoFactorAttemptLimiter.reset(username);

        UserDetailsImpl userDetails = UserDetailsImpl.build(user);
        List<String> roles = userDetails.getAuthorities().stream()
                .map(item -> item.getAuthority())
                .collect(Collectors.toList());
        String jwt = jwtUtils.generateTokenFromUsername(userDetails);
        return ResponseEntity.ok(new LoginResponse(userDetails.getUsername(), roles, jwt));
    }
}
