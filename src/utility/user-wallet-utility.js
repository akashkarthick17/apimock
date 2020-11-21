import {
  redisDelAsync,
  redisExistsAsync,
  redisGetAsync,
  redisSetAsync
} from '../utility/db-utility';

const USER_KEY_PREFIX = 'user:';

export const getUserWalletById = async (userId) => {
  return redisGetAsync(USER_KEY_PREFIX + userId).then((user) =>
    JSON.parse(user)
  );
};

export const upsertUserWalletById = async (
  user_id,
  has_deposited,
  wallet_balance,
  number_of_deposits
) => {
  return redisSetAsync(
    USER_KEY_PREFIX + user_id,
    JSON.stringify({ has_deposited, wallet_balance, number_of_deposits })
  ).then((res) => res === 'OK');
};

export const deleteUserWalletById = async (userId) => {
  return redisDelAsync(USER_KEY_PREFIX + userId).then((res) => res === 1);
};

export const isUserIdExists = async (userId) => {
  return redisExistsAsync(USER_KEY_PREFIX + userId).then((res) => res === 1);
};
