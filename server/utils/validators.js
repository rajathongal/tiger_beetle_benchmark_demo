import client from "./initTigerBeetleClient.js";

const isUserExists = async (accountId) => {
  try {
    if (!accountId) {
      return false;
    }
    const convertedAccountID = BigInt(accountId);
    const accountDetails = await client.lookupAccounts([convertedAccountID]);

    if (accountDetails.length == 0) {
      return false;
    }

    return accountDetails[0];
  } catch (error) {
    return false;
  }
};

const countDecimals = (number) => {
  const match = number.toString().match(/(?:\.(\d+))/);
  return match ? match[1].length : 0;
};

export { isUserExists, countDecimals };
