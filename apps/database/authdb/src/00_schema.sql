-- CREATE DATABASE jdw;

CREATE SCHEMA IF NOT EXISTS auth;

CREATE TABLE IF NOT EXISTS auth.roles
(
    role_id BIGINT NOT NULL GENERATED ALWAYS AS IDENTITY,
    role_name TEXT NOT NULL,
    role_description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    created_by_user_id BIGINT NOT NULL,
    created_time TIMESTAMPTZ NOT NULL,
    modified_by_user_id BIGINT NOT NULL,
    modified_time TIMESTAMPTZ NOT NULL,
    PRIMARY KEY (role_id)
);

CREATE TABLE IF NOT EXISTS auth.users
(
    user_id BIGINT NOT NULL GENERATED ALWAYS AS IDENTITY,
    email_address TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    created_by_user_id BIGINT NOT NULL,
    created_time TIMESTAMPTZ NOT NULL,
    modified_by_user_id BIGINT NOT NULL,
    modified_time TIMESTAMPTZ NOT NULL,
    PRIMARY KEY (user_id)
);

CREATE TABLE IF NOT EXISTS auth.users_roles
(
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    created_by_user_id BIGINT NOT NULL,
    created_time TIMESTAMPTZ NOT NULL,
    PRIMARY KEY (user_id, role_id),
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(user_id),
    CONSTRAINT fk_role FOREIGN KEY (role_id) REFERENCES auth.roles(role_id)
);

CREATE TABLE IF NOT EXISTS auth.profiles
(
    profile_id BIGINT NOT NULL GENERATED ALWAYS AS IDENTITY,
    user_id BIGINT NOT NULL,
    first_name TEXT NOT NULL,
    middle_name TEXT,
    last_name TEXT NOT NULL,
    birthdate DATE NOT NULL,
    created_by_user_id BIGINT NOT NULL,
    created_time TIMESTAMPTZ NOT NULL,
    modified_by_user_id BIGINT NOT NULL,
    modified_time TIMESTAMPTZ NOT NULL,
    PRIMARY KEY (profile_id),
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(user_id)
);

CREATE TABLE IF NOT EXISTS auth.addresses
(
    address_id BIGINT NOT NULL GENERATED ALWAYS AS IDENTITY,
    profile_id BIGINT NOT NULL,
    address_line_1 TEXT NOT NULL,
    address_line_2 TEXT,
    city TEXT NOT NULL,
    state_province TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    country TEXT NOT NULL,
    created_by_user_id BIGINT NOT NULL,
    created_time TIMESTAMPTZ NOT NULL,
    modified_by_user_id BIGINT NOT NULL,
    modified_time TIMESTAMPTZ NOT NULL,
    PRIMARY KEY (address_id),
    CONSTRAINT fk_profile FOREIGN KEY (profile_id) REFERENCES auth.profiles(profile_id)
);

CREATE TABLE IF NOT EXISTS auth.profile_icons
(
    icon_id BIGINT NOT NULL GENERATED ALWAYS AS IDENTITY,
    profile_id BIGINT NOT NULL,
    icon BYTEA NOT NULL,
    created_by_user_id BIGINT NOT NULL,
    created_time TIMESTAMPTZ NOT NULL,
    modified_by_user_id BIGINT NOT NULL,
    modified_time TIMESTAMPTZ NOT NULL,
    PRIMARY KEY (icon_id),
    CONSTRAINT fk_profile FOREIGN KEY (profile_id) REFERENCES auth.profiles(profile_id)
);
