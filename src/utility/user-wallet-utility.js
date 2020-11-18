import {
  CREATE_USER_QUERY,
  DELETE_USER_QUERY,
  GET_USER_QUERY,
  UPDATE_USER_QUERY
} from '../constants/queries';
import { MySqlClient } from './db-utility';

export const getUserWalletById = async (userId) => {
  return MySqlClient.executeQuery(GET_USER_QUERY, [userId]).then((res) => {
    if (res.length === 1) {
      return res[0];
    }
    return null;
  });
};

export const createUserWallet = async (
  userId,
  hasDeposited,
  walletBalance,
  numberOfDeposits
) => {
  return MySqlClient.executeQuery(CREATE_USER_QUERY, [
    userId,
    hasDeposited,
    walletBalance,
    numberOfDeposits,
  ]).then((res) => {
    if (res.affectedRows > 0) {
      return true;
    }
    return false;
  });
};

export const updateUserWalletById = async (
  userId,
  hasDeposited,
  walletBalance,
  numberOfDeposits
) => {
  return MySqlClient.executeQuery(UPDATE_USER_QUERY, [
    hasDeposited,
    walletBalance,
    numberOfDeposits,
    userId,
  ]).then((res) => {
    if (res.affectedRows > 0) {
      return true;
    }
    return false;
  });
};

export const deleteUserWalletById = async (userId) => {
  return MySqlClient.executeQuery(DELETE_USER_QUERY, [userId]).then((res) => {
    if (res.affectedRows > 0) {
      return true;
    }
    return false;
  });
};
