import client from "./initTigerBeetleClient.js";

const isUserExists = async(accountId) => {
    try {
        if (!accountId) {
          return false;
        }
        const convertedAccountID = BigInt(accountId)
        const accountDetails = await client.lookupAccounts([convertedAccountID]);

        if(accountDetails.length == 0) {
            return false;
        }

        return accountDetails[0];
        
    } catch(error) {
        return false;
    }
};

export { isUserExists };