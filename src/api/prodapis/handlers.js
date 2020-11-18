import { eval as evaluate, parse } from 'expression-eval';
import fs from 'fs';
import * as ErrorResponse from '../../constants/error-response';
import * as csvUtility from '../../utility/csv-utility';
import * as QueryUtility from '../../utility/query-utility';
import * as UserWalletUtility from '../../utility/user-wallet-utility';

let adder = (sum, element) => {
	let p = new Promise ((resolve) => {
    resolve(sum + element);
  });

  return p;
}

export let loop = async (request, h) => {
  let numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  let sum = 0;

  for (const n of numbers) {
    console.log(`Trying to add ${n}`);
    const res = await adder(sum, n).then((res) => {
      console.log(`Current sum is ${res}`);
      return res;
    });
    sum = res;
  }

  return sum;
};

export const csv2JsonHandler = async (request, h) => {
  const data = request.payload;

  if (data.file) {
    let name = data.file.hapi.filename.split(' ').join('');

    // Construct valid file name.
    const arr = name.split('.');
    arr.splice(name.length - 1, 1, Date.now());
    name = arr.join('').concat('.csv');

    // Construct the path
    const dir = __dirname + '/../../uploads/';
    const path = dir + name;

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }

    return new Promise((resolve, reject) => {
      // Create file write stream.
      const file = fs.createWriteStream(path);

      file.on('error', (err) => {
        resolve({ message: 'Error parsing the CSV file' });
      });

      data.file.pipe(file);

      data.file.on('end', (err) => {
        csvUtility.csvToJson(path).then((results) => {
          resolve(results);
        });
      });
    });
  }
};

export const offers = async (request, h) => {
  const { userId } = request.query;
  if (userId) {
    // List of bonus offered bu NOSTRA.
    const nostraBonus = [
      {
        code: 'NOSTRA100BONUS',
        desc: 'Get 100% Bonus',
        probabilityPercentage: 10,
        coolDownPeriodInSeconds: 43200,
      },
      {
        code: 'NOSTRA50BONUS',
        desc: 'Get 50% Bonus',
        probabilityPercentage: 10,
        coolDownPeriodInSeconds: 36000,
      },
      {
        code: 'NOSTRA10BONUS',
        desc: 'Get 10% Bonus',
        probabilityPercentage: 50,
        coolDownPeriodInSeconds: 18000,
      },
      {
        code: 'NOSTRA0BONUS',
        desc: 'Keep Playing !!',
        probabilityPercentage: 30,
        coolDownPeriodInSeconds: 0,
      },
    ];

    // Sort the nostra bonus in the descending order
    // with respect to the probability percentage.
    nostraBonus.sort(
      (a, b) => b.probabilityPercentage - a.probabilityPercentage
    );

    // Get a random number between 1 - 100.
    const probability = Math.round(Math.random() * 100);

    const bonus = {};
    let percentage = 0;

    // Loop through the nostra bonus array and
    // find the bonus for the user based on the probability.
    for (let index = 0; index < nostraBonus.length; index++) {
      percentage += nostraBonus[index].probabilityPercentage;

      if (probability <= percentage) {
        bonus.title = nostraBonus[index].desc;
        bonus.code = nostraBonus[index].code;
        bonus.coolDownPeriod = nostraBonus[index].coolDownPeriodInSeconds;
        break;
      }
    }

    if (bonus.code !== 'NOSTRA0BONUS') {
      // Path to the users bonus file.
      const path = '/../../storage/users-bonus.json';

      // Parse the json file from the path.
      const bonusObject = JSON.parse(fs.readFileSync(__dirname + path));

      // Find the user's index based on the user id.
      const userIndex = bonusObject.usersBonus.findIndex(
        (userBonus) => userBonus.id === userId
      );

      // Check if the index is valid.
      if (userIndex >= 0) {
        // Get the user object.
        const user = bonusObject.usersBonus[userIndex];

        // Check if the cool down period is expired.
        if ((Date.now() - user.timeStamp) / 1000 > user.coolDownPeriod) {
          // Update the new cool down period and sync with the file.
          bonusObject.usersBonus[userIndex].coolDownPeriod =
            bonus.coolDownPeriod;
          bonusObject.usersBonus[userIndex].timeStamp = Date.now();
          fs.writeFileSync(
            __dirname + path,
            JSON.stringify({ usersBonus: bonusObject.usersBonus })
          );
        } else {
          // Return NOSTRA0BONUS offer until the cool down is expired.
          const bonusOffer = nostraBonus.find(
            (bonusOffer) => bonusOffer.code === 'NOSTRA0BONUS'
          );
          bonus.title = bonusOffer.desc;
          bonus.code = bonusOffer.code;
          bonus.coolDownPeriod = bonusOffer.coolDownPeriodInSeconds;
        }
      } else {
        // Create a user object for the first time entry.
        const user = {
          id: userId,
          coolDownPeriod: bonus.coolDownPeriod,
          timeStamp: Date.now(),
        };

        // Update the array.
        bonusObject.usersBonus.push(user);

        // Sync with the file.
        fs.writeFileSync(
          __dirname + path,
          JSON.stringify({ usersBonus: bonusObject.usersBonus })
        );
      }
    }

    return {
      message: 'success',
      code: 200,
      data: {
        offer: {
          title: bonus.title,
          code: bonus.code,
        },
      },
    };
  } else {
    return h.response({ message: 'Please provide User ID.' }).code(500);
  }
};

export const getUserWallet = async (request, h) => {
  // Get user id from request param.
  const { userId } = request.params;

  if (userId) {
    try {
      // Get user wallet details by user id.
      const user = await UserWalletUtility.getUserWalletById(userId);

      // Return valid user wallet information.
      if (user) {
        return h.response({ code: 200, data: user });
      } else {
        return h.response(ErrorResponse.INVALID_USER_ID).code(500);
      }
    } catch (e) {
      return h.response(ErrorResponse.ERR_GET).code(500);
    }
  }

  return h.response(ErrorResponse.INVALID_USER_ID).code(500);
};

export const addUserWallet = async (request, h) => {
  // Get user details from request payload.
  const {
    user_id: userId,
    has_deposited: hasDeposited,
    wallet_balance: walletBalance,
    number_of_deposits: numberOfDeposits,
  } = request.payload;

  if (userId && hasDeposited && walletBalance && numberOfDeposits) {
    try {
      // Check if the user id is duplicate.
      const user = await UserWalletUtility.getUserWalletById(userId);

      if (user) {
        return h.response(ErrorResponse.DUPLICATE_USER_ID).code(500);
      }

      // Create the user using the given details.
      const isUserCreated = await UserWalletUtility.createUserWallet(
        userId,
        hasDeposited,
        walletBalance,
        numberOfDeposits
      );

      // Check if the user has been created successfully.
      if (isUserCreated) {
        return h.response({ code: 200, message: 'Successfully Created.' });
      } else {
        return h.response(ErrorResponse.ERR_CREATE).code(500);
      }
    } catch (e) {
      return h.response(ErrorResponse.ERR_CREATE).code(500);
    }
  }

  return h.response(ErrorResponse.INVALID_USER_ID).code(500);
};

export const updateUserWallet = async (request, h) => {
  // Get the userId from the request param.
  const { userId } = request.params;

  // Get the wallet details from request payload.
  const {
    has_deposited: hasDeposited,
    wallet_balance: walletBalance,
    number_of_deposits: numberOfDeposits,
  } = request.payload;

  if (userId && hasDeposited && walletBalance && numberOfDeposits) {
    try {
      // Create the user using the given details.
      const isUserUpdated = await UserWalletUtility.updateUserWalletById(
        userId,
        hasDeposited,
        walletBalance,
        numberOfDeposits
      );

      // Check if the user has been created successfully.
      if (isUserUpdated) {
        return h.response({ code: 200, message: 'Successfully Updated.' });
      } else {
        return h.response(ErrorResponse.ERR_UPDATE).code(500);
      }
    } catch (e) {
      return h.response(ErrorResponse.ERR_UPDATE).code(500);
    }
  }

  return h.response(ErrorResponse.INVALID_USER_ID).code(500);
};

export const deleteUserWallet = async (request, h) => {
  // Get user id from request param.
  const { userId } = request.params;

  if (userId) {
    try {
      // Delete user wallet by user id.
      const isUserDeleted = await UserWalletUtility.deleteUserWalletById(
        userId
      );

      // Check if the user wallet is deleted.
      if (isUserDeleted) {
        return h.response({ code: 200, message: 'Successfully Deleted.' });
      } else {
        return h.response(ErrorResponse.INVALID_USER_ID).code(500);
      }
    } catch (e) {
      return h.response(ErrorResponse.ERR_DELETE).code(500);
    }
  }

  return h.response(ErrorResponse.INVALID_USER_ID).code(500);
};

export const query = async (request, h) => {
  // Get query from the request payload.
  const { query } = request.payload;

  // Get userId and expression from the query.
  let { userId, expression } = QueryUtility.splitUserIdAndExp(query);

  if (userId && expression) {
    const user = await UserWalletUtility.getUserWalletById(userId);

    if (user) {
      const parameters = {
        has_deposited: user.has_deposited,
        wallet_balance: user.wallet_balance,
        number_of_deposits: user.number_of_deposits,
      };

      // Construct a valid expression based on parameter values.
      // Eg: has_deposited > 30 ----> 40 > 30
      expression = QueryUtility.constructValidExpression(
        expression,
        parameters
      );

      try {
        // Evaluate the expression.
        // Eg: 40 > 30 ----> true
        const value = evaluate(parse(expression));

        return {
          code: 200,
          data: value,
        };
      } catch (e) {
        return h.response(ErrorResponse.INVALID_EXPRESSION).code(500);
      }
    }

    return h.response(ErrorResponse.INVALID_USER_ID).code(500);
  }

  return h.response(ErrorResponse.INVALID_QUERY).code(500);
};
