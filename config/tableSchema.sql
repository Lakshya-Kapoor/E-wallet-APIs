CREATE TABLE users (
    phone_no BIGINT NOT NULL PRIMARY KEY,
    user_name VARCHAR(50) NOT NULL,
    wallet_id BIGINT NOT NULL UNIQUE,
    user_password VARCHAR(150) NOT NULL,
    FOREIGN KEY (wallet_id) REFERENCES wallet(wallet_id)
);

CREATE TABLE wallet (
    wallet_id BIGSERIAL NOT NULL PRIMARY KEY,
    balance INT NOT NULL DEFAULT 1000
);

CREATE TABLE transactions (
    transaction_id BIGSERIAL NOT NULL PRIMARY KEY,
    sender_phone_no BIGINT NOT NULL,
    receiver_phone_no BIGINT,
    amount INT NOT NULL,
    transaction_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    transaction_status BOOLEAN NOT NULL,
    transaction_message VARCHAR(100) NOT NULL,
    FOREIGN KEY (sender_phone_no) REFERENCES users(phone_no),
    FOREIGN KEY (receiver_phone_no) REFERENCES users(phone_no)
);