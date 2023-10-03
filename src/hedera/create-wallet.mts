import approot from 'app-root-path';
import { config } from "dotenv"
config({ path: `${approot.path}/.env` })

import { Client, PrivateKey, AccountCreateTransaction, AccountBalanceQuery, Hbar } from "@hashgraph/sdk";

async function main() {

    //Grab your Hedera testnet account ID and private key from your .env file
    const myAccountId = process.env.HEDERA_ACCOUNT_ID;
    const myPrivateKey = process.env.HEDERA_PRIVATE_KEY;

    // If we weren't able to grab it, we should throw a new error
    if (!myAccountId || !myPrivateKey) {
        throw new Error("Environment variables MY_ACCOUNT_ID and MY_PRIVATE_KEY must be present");
    }

    // Create our connection to the Hedera network
    // The Hedera JS SDK makes this really easy!
    const client = Client.forName('testnet');

    client.setOperator(myAccountId, myPrivateKey);

    //Create new keys
    const newAccountPrivateKey = PrivateKey.generateED25519();
    const newAccountPublicKey = newAccountPrivateKey.publicKey;


    try {
        //Create a new account with 1,000 tinybar starting balance
        const newAccount = await new AccountCreateTransaction()
            .setKey(newAccountPublicKey)
            .setInitialBalance(new Hbar(1000))
            .execute(client);

        // Get the new account ID
        const getReceipt = await newAccount.getReceipt(client);
        const newAccountId = getReceipt.accountId;

        //Log the account ID
        console.log("The new account ID is: " + newAccountId);

        if (newAccountId) {
            //Verify the account balance
            const accountBalance = await new AccountBalanceQuery()
                .setAccountId(newAccountId)
                .execute(client);

            console.log("The new account balance is: " + accountBalance.hbars.toTinybars() + " tinybar.");

        }
    }
    catch (error) {
        console.log(error)
    }
}

main();