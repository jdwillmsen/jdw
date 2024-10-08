INSERT INTO auth.roles (role_name, role_description, created_by_user_id, created_time, modified_by_user_id, modified_time)
VALUES ('ADMIN', 'Administrator role with full access.', 1, CURRENT_TIMESTAMP, 1, CURRENT_TIMESTAMP);

INSERT INTO auth.roles (role_name, role_description, created_by_user_id, created_time, modified_by_user_id, modified_time)
VALUES ('MANAGER', 'Manager role with limited access.', 1, CURRENT_TIMESTAMP, 1, CURRENT_TIMESTAMP);

INSERT INTO auth.roles (role_name, role_description, created_by_user_id, created_time, modified_by_user_id, modified_time)
VALUES ('USER', 'Standard user role with basic access.', 1, CURRENT_TIMESTAMP, 1, CURRENT_TIMESTAMP);

INSERT INTO auth.users (email_address, password, created_by_user_id, created_time, modified_by_user_id, modified_time)
VALUES ('system@jdw.com', '$2a$10$v5e3IStWiGNj1tmB8WWoguoVQHFThHyMlqaOJP1vrNyrrcZfwDRBa', 1, CURRENT_TIMESTAMP, 1, CURRENT_TIMESTAMP);

INSERT INTO auth.users_roles (user_id, role_id, created_by_user_id, created_time)
VALUES (1, 1, 1, CURRENT_TIMESTAMP),  -- Admin role
       (1, 2, 1, CURRENT_TIMESTAMP),  -- Manager role
       (1, 3, 1, CURRENT_TIMESTAMP);  -- User role
