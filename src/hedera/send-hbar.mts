import approot from 'app-root-path';
import { config } from "dotenv"
config({ path: `${approot.path}/.env` })

import { Client, AccountBalanceQuery, Hbar, TransferTransaction, HbarUnit } from "@hashgraph/sdk";

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

    // The operator is the account that will, by default, pay the transaction fee for transactions and queries built with this client
    client.setOperator(myAccountId, myPrivateKey);

    const accountId = '0.0.2621978';
    const amount = '0.1'

    try {
        //Create the transfer transaction
        const sendHbar = await new TransferTransaction()
            .addHbarTransfer(myAccountId, Hbar.from(amount, HbarUnit.Hbar).negated()) //Sending account
            .addHbarTransfer(accountId, Hbar.from(amount, HbarUnit.Hbar)) //Receiving account
            .execute(client);

        //Verify the transaction reached consensus
        const transactionReceipt = await sendHbar.getReceipt(client);
        console.log("The transfer transaction from my account to the new account was: " + transactionReceipt.status.toString());

        //Request the cost of the query
        const queryCost = await new AccountBalanceQuery()
            .setAccountId(accountId)
            .getCost(client);

        console.log("The cost of query is: " + queryCost);

        //Check the new account's balance
        const getNewBalance = await new AccountBalanceQuery()
            .setAccountId(accountId)
            .execute(client);

        console.log("The account balance after the transfer is: " + getNewBalance.hbars.toTinybars() + " tinybar.")
    }
    catch (error) {
        console.log(error)
    }
}

main();