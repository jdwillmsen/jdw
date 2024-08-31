package com.jdw.usersrole.repositories;

import com.jdw.usersrole.daos.*;
import com.jdw.usersrole.models.Address;
import com.jdw.usersrole.models.Profile;
import com.jdw.usersrole.models.ProfileIcon;
import com.jdw.usersrole.models.User;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.sql.Date;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@Tag("fast")
@Tag("unit")
class UserRepositoryImplTests {
    @Mock
    private UserDao userDao;
    @Mock
    private UserRoleDao userRoleDao;
    @Mock
    private ProfileDao profileDao;
    @Mock
    private ProfileIconDao profileIconDao;
    @Mock
    private AddressDao addressDao;
    @InjectMocks
    private UserRepositoryImpl userRepository;

    private User buildMockUser() {
        return User.builder()
                .id(1L)
                .emailAddress("user@jdw.com")
                .password("P@ssw0rd!")
                .status("ACTIVE")
                .roles(Set.of())
                .profile(buildMockProfile())
                .createdByUserId(1L)
                .createdTime(Timestamp.from(Instant.now()))
                .modifiedByUserId(1L)
                .modifiedTime(Timestamp.from(Instant.now()))
                .build();
    }

    private Profile buildMockProfile() {
        return Profile.builder()
                .id(1L)
                .firstName("John")
                .middleName("M")
                .lastName("Doe")
                .birthdate(Date.valueOf("1990-01-01"))
                .userId(1L)
                .addresses(Set.of(buildMockAddress()))
                .icon(buildMockProfileIcon())
                .createdByUserId(1L)
                .createdTime(Timestamp.from(Instant.now()))
                .modifiedByUserId(1L)
                .modifiedTime(Timestamp.from(Instant.now()))
                .build();
    }

    private Address buildMockAddress() {
        return Address.builder()
                .id(1L)
                .profileId(1L)
                .addressLine1("123 Main St")
                .city("Cityville")
                .stateProvince("State")
                .country("Country")
                .createdByUserId(1L)
                .createdTime(Timestamp.from(Instant.now()))
                .modifiedByUserId(1L)
                .modifiedTime(Timestamp.from(Instant.now()))
                .build();
    }

    private ProfileIcon buildMockProfileIcon() {
        return ProfileIcon.builder()
                .id(1L)
                .profileId(1L)
                .icon(new byte[]{1, 2, 3})
                .createdByUserId(1L)
                .createdTime(Timestamp.from(Instant.now()))
                .modifiedByUserId(1L)
                .modifiedTime(Timestamp.from(Instant.now()))
                .build();
    }

    @Test
    void findById_shouldReturnUserWithProfile() {
        User mockUser = buildMockUser();

        when(userDao.findById(1L)).thenReturn(Optional.of(mockUser));
        when(userRoleDao.findByUserId(1L)).thenReturn(List.of());
        when(profileDao.findByUserId(1L)).thenReturn(Optional.of(mockUser.profile()));
        when(addressDao.findByProfileId(1L)).thenReturn(mockUser.profile().addresses().stream().toList());
        when(profileIconDao.findByProfileId(1L)).thenReturn(Optional.of(mockUser.profile().icon()));

        Optional<User> result = userRepository.findById(1L);

        assertTrue(result.isPresent());
        assertEquals(mockUser.emailAddress(), result.get().emailAddress());
        assertEquals(mockUser.profile(), result.get().profile());
        verify(userDao, times(1)).findById(1L);
        verify(userRoleDao, times(1)).findByUserId(1L);
        verify(profileDao, times(1)).findByUserId(1L);
        verify(addressDao, times(1)).findByProfileId(1L);
        verify(profileIconDao, times(1)).findByProfileId(1L);
    }

    @Test
    void findById_shouldReturnEmptyOptionalWhenUserNotFound() {
        when(userDao.findById(1L)).thenReturn(Optional.empty());

        Optional<User> result = userRepository.findById(1L);

        assertTrue(result.isEmpty());
        verify(userDao, times(1)).findById(1L);
    }

    @Test
    void findByEmailAddress_shouldReturnUserWithProfile() {
        User mockUser = buildMockUser();

        when(userDao.findByEmailAddress("user@jdw.com")).thenReturn(Optional.of(mockUser));
        when(userRoleDao.findByUserId(1L)).thenReturn(List.of());
        when(profileDao.findByUserId(1L)).thenReturn(Optional.of(mockUser.profile()));
        when(addressDao.findByProfileId(1L)).thenReturn(mockUser.profile().addresses().stream().toList());
        when(profileIconDao.findByProfileId(1L)).thenReturn(Optional.of(mockUser.profile().icon()));

        Optional<User> result = userRepository.findByEmailAddress("user@jdw.com");

        assertTrue(result.isPresent());
        assertEquals(mockUser.emailAddress(), result.get().emailAddress());
        assertEquals(mockUser.profile(), result.get().profile());
        verify(userDao, times(1)).findByEmailAddress("user@jdw.com");
        verify(userRoleDao, times(1)).findByUserId(1L);
        verify(profileDao, times(1)).findByUserId(1L);
        verify(addressDao, times(1)).findByProfileId(1L);
        verify(profileIconDao, times(1)).findByProfileId(1L);
    }

    @Test
    void findByEmailAddress_shouldReturnEmptyOptionalWhenUserNotFound() {
        String email = "nonexistent@example.com";
        when(userDao.findByEmailAddress(email)).thenReturn(Optional.empty());

        Optional<User> result = userRepository.findByEmailAddress(email);

        assertTrue(result.isEmpty());
        verify(userDao, times(1)).findByEmailAddress(email);
    }

    @Test
    void findAll_shouldReturnAllUsersWithProfiles() {
        User mockUser = buildMockUser();

        when(userDao.findAll()).thenReturn(List.of(mockUser));
        when(userRoleDao.findByUserId(1L)).thenReturn(List.of());
        when(profileDao.findByUserId(1L)).thenReturn(Optional.of(mockUser.profile()));
        when(addressDao.findByProfileId(1L)).thenReturn(mockUser.profile().addresses().stream().toList());
        when(profileIconDao.findByProfileId(1L)).thenReturn(Optional.of(mockUser.profile().icon()));

        List<User> result = userRepository.findAll();

        assertEquals(1, result.size());
        assertEquals(mockUser.emailAddress(), result.getFirst().emailAddress());
        assertEquals(mockUser.profile(), result.getFirst().profile());
        verify(userDao, times(1)).findAll();
        verify(userRoleDao, times(1)).findByUserId(1L);
        verify(profileDao, times(1)).findByUserId(1L);
        verify(addressDao, times(1)).findByProfileId(1L);
        verify(profileIconDao, times(1)).findByProfileId(1L);
    }

    @Test
    void save_shouldCreateNewUserWhenIdIsNull() {
        User userToSave = User.builder()
                .emailAddress("newuser@jdw.com")
                .password("P@ssw0rd!")
                .status("ACTIVE")
                .roles(new HashSet<>())
                .profile(null)
                .createdByUserId(1L)
                .createdTime(Timestamp.from(Instant.now()))
                .modifiedByUserId(1L)
                .modifiedTime(Timestamp.from(Instant.now()))
                .build();

        when(userDao.create(userToSave)).thenReturn(userToSave);

        User result = userRepository.save(userToSave);

        assertEquals(userToSave, result);
        verify(userDao, times(1)).create(userToSave);
        verify(userDao, never()).update(any(User.class));
    }

    @Test
    void save_shouldUpdateUserWhenIdIsPresent() {
        User mockUser = buildMockUser();

        when(userDao.update(mockUser)).thenReturn(mockUser);
        when(userRoleDao.findByUserId(1L)).thenReturn(List.of());
        when(profileDao.findByUserId(1L)).thenReturn(Optional.of(mockUser.profile()));
        when(addressDao.findByProfileId(1L)).thenReturn(mockUser.profile().addresses().stream().toList());
        when(profileIconDao.findByProfileId(1L)).thenReturn(Optional.of(mockUser.profile().icon()));

        User result = userRepository.save(mockUser);

        assertEquals(mockUser, result);
        verify(userDao, times(1)).update(mockUser);
        verify(userDao, never()).create(any(User.class));
    }

    @Test
    void save_shouldReturnNullWhenUserIsNull() {
        User result = userRepository.save(null);

        assertNull(result);
        verify(userDao, never()).create(any());
        verify(userDao, never()).update(any());
    }

    @Test
    void deleteById_shouldDeleteUserAndRelatedData() {
        User mockUser = buildMockUser();
        when(profileDao.findByUserId(1L)).thenReturn(Optional.of(mockUser.profile()));

        userRepository.deleteById(1L);

        verify(profileDao, times(1)).findByUserId(1L);
        verify(addressDao, times(1)).deleteByProfileId(1L);
        verify(profileIconDao, times(1)).deleteByProfileId(1L);
        verify(userRoleDao, times(1)).deleteByUserId(1L);
        verify(userDao, times(1)).deleteById(1L);
    }

    @Test
    void deleteById_shouldNotDeleteRelatedDataIfProfileNotPresent() {
        when(profileDao.findByUserId(1L)).thenReturn(Optional.empty());

        userRepository.deleteById(1L);

        verify(profileDao, times(1)).findByUserId(1L);
        verify(addressDao, never()).deleteByProfileId(anyLong());
        verify(profileIconDao, never()).deleteByProfileId(anyLong());
        verify(userRoleDao, times(1)).deleteByUserId(1L);
        verify(userDao, times(1)).deleteById(1L);
    }
}