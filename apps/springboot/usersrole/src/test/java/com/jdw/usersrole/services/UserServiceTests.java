package com.jdw.usersrole.services;

import com.jdw.usersrole.dtos.UserRequestDTO;
import com.jdw.usersrole.exceptions.ResourceExistsException;
import com.jdw.usersrole.exceptions.ResourceNotFoundException;
import com.jdw.usersrole.models.Status;
import com.jdw.usersrole.models.User;
import com.jdw.usersrole.repositories.UserRepository;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@Tag("fast")
@Tag("unit")
class UserServiceTests {
    @Mock
    private UserRepository userRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @InjectMocks
    private UserService userService;

    @Test
    void getAllUsers_ShouldReturnListOfUsers() {
        User user = User.builder()
                .id(1L)
                .emailAddress("user@jdw.com")
                .status(Status.ACTIVE.name())
                .build();
        when(userRepository.findAll()).thenReturn(List.of(user));

        List<User> users = userService.getAllUsers();

        assertNotNull(users);
        assertEquals(1, users.size());
        assertEquals("user@jdw.com", users.getFirst().emailAddress());
    }

    @Test
    void getUserById_ShouldReturnUser_WhenUserExists() {
        User user = User.builder()
                .id(1L)
                .emailAddress("user@jdw.com")
                .status(Status.ACTIVE.name())
                .build();
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        User foundUser = userService.getUserById(1L);

        assertNotNull(foundUser);
        assertEquals(1L, foundUser.id());
        assertEquals("user@jdw.com", foundUser.emailAddress());
    }

    @Test
    void getUserById_ShouldThrowException_WhenUserNotFound() {
        when(userRepository.findById(anyLong())).thenReturn(Optional.empty());

        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class,
                () -> userService.getUserById(1L));

        assertEquals("User not found with id 1", exception.getMessage());
    }

    @Test
    void getUserByEmailAddress_ShouldReturnUser_WhenUserExists() {
        User user = User.builder()
                .id(1L)
                .emailAddress("user@jdw.com")
                .status(Status.ACTIVE.name())
                .build();
        when(userRepository.findByEmailAddress("user@jdw.com")).thenReturn(Optional.of(user));

        User foundUser = userService.getUserByEmailAddress("user@jdw.com");

        assertNotNull(foundUser);
        assertEquals(1L, foundUser.id());
        assertEquals("user@jdw.com", foundUser.emailAddress());
    }

    @Test
    void getUserByEmailAddress_ShouldThrowException_WhenUserNotFound() {
        when(userRepository.findByEmailAddress(anyString())).thenReturn(Optional.empty());

        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class,
                () -> userService.getUserByEmailAddress("user@jdw.com"));

        assertEquals("User not found with email address user@jdw.com", exception.getMessage());
    }

    @Test
    void createUser_ShouldCreateAndReturnUser() {
        UserRequestDTO userRequestDTO = new UserRequestDTO("user@jdw.com", "Password1!");
        when(userRepository.findByEmailAddress(anyString())).thenReturn(Optional.empty());
        when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        User createdUser = userService.createUser(userRequestDTO);

        assertNotNull(createdUser);
        assertEquals("user@jdw.com", createdUser.emailAddress());
        assertEquals("encodedPassword", createdUser.password());
        assertEquals(Status.ACTIVE.name(), createdUser.status());
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void createUser_ShouldThrowException_WhenUserAlreadyExists() {
        UserRequestDTO userRequestDTO = new UserRequestDTO("user@jdw.com", "Password1!");
        when(userRepository.findByEmailAddress(anyString())).thenReturn(Optional.of(User.builder().build()));

        ResourceExistsException exception = assertThrows(ResourceExistsException.class,
                () -> userService.createUser(userRequestDTO));

        assertEquals("User already exists with email address user@jdw.com", exception.getMessage());
    }

    @Test
    void createUser_ShouldDelegateToCreateUserWithUserId() {
        UserRequestDTO userRequestDTO = new UserRequestDTO("user@jdw.com", "Password1!");
        String requesterEmail = "requester@jdw.com";

        when(userRepository.findByEmailAddress(userRequestDTO.emailAddress())).thenReturn(Optional.empty());
        when(userRepository.findByEmailAddress(requesterEmail)).thenReturn(Optional.of(User.builder().id(2L).build()));
        when(passwordEncoder.encode(userRequestDTO.password())).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        User createdUser = userService.createUser(userRequestDTO, requesterEmail);

        assertNotNull(createdUser);
        assertEquals("user@jdw.com", createdUser.emailAddress());
        assertEquals("encodedPassword", createdUser.password());
        assertEquals(Status.ACTIVE.name(), createdUser.status());
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void updateUser_ShouldUpdateAndReturnUser() {
        User existingUser = User.builder()
                .id(1L)
                .emailAddress("user@jdw.com")
                .password("oldPassword")
                .status(Status.ACTIVE.name())
                .build();
        UserRequestDTO userRequestDTO = new UserRequestDTO("user@jdw.com", "NewPassword1!");

        when(userRepository.findById(1L)).thenReturn(Optional.of(existingUser));
        when(userRepository.findByEmailAddress("requester@jdw.com")).thenReturn(Optional.of(User.builder().id(1L).build()));
        when(passwordEncoder.encode(anyString())).thenReturn("encodedNewPassword");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        User updatedUser = userService.updateUser(1L, userRequestDTO, "requester@jdw.com");

        assertNotNull(updatedUser);
        assertEquals("user@jdw.com", updatedUser.emailAddress());
        assertEquals("encodedNewPassword", updatedUser.password());
        assertEquals(existingUser.status(), updatedUser.status());
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void updateUser_ShouldThrowException_WhenUserNotFound() {
        UserRequestDTO userRequestDTO = new UserRequestDTO("user@jdw.com", "NewPassword1!");
        when(userRepository.findById(anyLong())).thenReturn(Optional.empty());

        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class,
                () -> userService.updateUser(1L, userRequestDTO, "requester@jdw.com"));

        assertEquals("User not found with id 1", exception.getMessage());
    }

    @Test
    void deleteUser_ShouldDeleteUser_WhenUserExists() {
        doNothing().when(userRepository).deleteById(anyLong());

        userService.deleteUser(1L, "requester@jdw.com");

        verify(userRepository, times(1)).deleteById(1L);
    }

    @Test
    void getUserIdByEmailAddress_ShouldReturnUserId_WhenUserExists() {
        User user = User.builder()
                .id(1L)
                .emailAddress("user@jdw.com")
                .build();
        when(userRepository.findByEmailAddress("user@jdw.com")).thenReturn(Optional.of(user));

        Long userId = userService.getUserIdByEmailAddress("user@jdw.com");

        assertNotNull(userId);
        assertEquals(1L, userId);
    }

    @Test
    void getUserIdByEmailAddress_ShouldThrowException_WhenUserNotFound() {
        when(userRepository.findByEmailAddress(anyString())).thenReturn(Optional.empty());

        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class,
                () -> userService.getUserIdByEmailAddress("user@jdw.com"));

        assertEquals("User not found with email address user@jdw.com", exception.getMessage());
    }
}