package com.jdw.usersrole.services;

import com.jdw.usersrole.dtos.AuthResponseDTO;
import com.jdw.usersrole.dtos.UserRequestDTO;
import com.jdw.usersrole.models.SecurityUser;
import com.jdw.usersrole.models.User;
import com.jdw.usersrole.repositories.RoleRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {
    private final UserService userService;
    private final RoleRepository roleRepository;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final HttpServletRequest request;

    public String getCurrentUrl() {
        String scheme = request.getScheme();
        String serverName = request.getServerName();
        int serverPort = request.getServerPort();
        String contextPath = request.getContextPath();
        return "%s://%s:%d%s".formatted(scheme, serverName, serverPort, contextPath);
    }

    public AuthResponseDTO authenticate(@Valid UserRequestDTO userRequestDTO) {
        log.info("Authenticating user with: emailAddress={}", userRequestDTO.emailAddress());
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(userRequestDTO.emailAddress(), userRequestDTO.password()));
        User user = userService.getUserByEmailAddress(userRequestDTO.emailAddress());
        return AuthResponseDTO.builder()
                .jwtToken(jwtService.generateToken(new SecurityUser(user, roleRepository), getCurrentUrl()))
                .build();
    }
}
