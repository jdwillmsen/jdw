package com.jdw.usersrole.services;

import com.jdw.usersrole.dtos.UserRequestDTO;
import com.jdw.usersrole.models.SecurityUser;
import com.jdw.usersrole.models.User;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@Tag("fast")
@Tag("unit")
class AuthServiceTests {
    @Mock
    private UserService userService;
    @Mock
    private AuthenticationManager authenticationManager;
    @Mock
    private JwtService jwtService;
    @InjectMocks
    private AuthService authService;

    @Test
    void authenticate_shouldReturnTokenWhenCredentialsAreValid() {
        UserRequestDTO requestDTO = new UserRequestDTO("user@jdw.com", "P@ssw0rd!");
        User user = new User(1L, "user@jdw.com", "encodedPassword", null, null, null, null, null, null, null);

        when(userService.getUserByEmailAddress(requestDTO.emailAddress())).thenReturn(user);
        when(jwtService.generateToken(any(SecurityUser.class))).thenReturn("mocked-jwt-token");

        String token = authService.authenticate(requestDTO);

        verify(authenticationManager).authenticate(
                new UsernamePasswordAuthenticationToken(requestDTO.emailAddress(), requestDTO.password()));
        verify(userService).getUserByEmailAddress(requestDTO.emailAddress());
        verify(jwtService).generateToken(any(SecurityUser.class));
        assertEquals("mocked-jwt-token", token);
    }

    @Test
    void authenticate_shouldThrowExceptionWhenCredentialsAreInvalid() {
        UserRequestDTO requestDTO = new UserRequestDTO("user@jdw.com", "wrongPassword");

        when(authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(requestDTO.emailAddress(), requestDTO.password())))
                .thenThrow(new BadCredentialsException("Invalid credentials"));

        assertThrows(BadCredentialsException.class, () -> authService.authenticate(requestDTO));

        verify(authenticationManager).authenticate(
                new UsernamePasswordAuthenticationToken(requestDTO.emailAddress(), requestDTO.password()));
        verify(userService, never()).getUserByEmailAddress(anyString());
        verify(jwtService, never()).generateToken(any(SecurityUser.class));
    }

}