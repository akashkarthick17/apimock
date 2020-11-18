export const GET_USER_QUERY = 'SELECT * FROM wallet WHERE user_id = ?';

export const CREATE_USER_QUERY =
  'INSERT INTO wallet (user_id, has_deposited, wallet_balance, number_of_deposits) VALUES (?, ?, ?, ?)';

export const UPDATE_USER_QUERY =
  'UPDATE wallet SET has_deposited=?, wallet_balance = ?, number_of_deposits = ?  WHERE user_id = ?';

export const DELETE_USER_QUERY = 'DELETE FROM wallet WHERE user_id = ?';
