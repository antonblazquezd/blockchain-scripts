import approot from 'app-root-path';
import { config } from "dotenv"
config({ path: `${approot.path}/.env` })

import { Client, AccountBalanceQuery, Hbar, TransferTransaction, HbarUnit, LocalProvider, Wallet } from "@hashgraph/sdk";

async function main() {

    //Grab your Hedera testnet account ID and private key from your .env file
    const myAccountId = process.env.HEDERA_WALLET_ACCOUNT_ID;
    const myPrivateKey = process.env.HEDERA_WALLET_PRIVATE_KEY;

    // If we weren't able to grab it, we should throw a new error
    if (!myAccountId || !myPrivateKey) {
        throw new Error("Environment variables HEDERA_WALLET_ACCOUNT_ID and HEDERA_WALLET_PRIVATE_KEY must be present");
    }

    const wallet = new Wallet(
        myAccountId,
        myPrivateKey,
        new LocalProvider({ client: Client.forTestnet() })
    );

    const accountId = '0.0.2621978';
    const amount = '0.1'

    try {
        //Create the transfer transaction
        const sendHbar = await new TransferTransaction()
            .addHbarTransfer(myAccountId, Hbar.from(amount, HbarUnit.Hbar).negated()) //Sending account
            .addHbarTransfer(accountId, Hbar.from(amount, HbarUnit.Hbar)) //Receiving account
            .freezeWithSigner(wallet);

        const transaction = await sendHbar.executeWithSigner(wallet);

        //Verify the transaction reached consensus
        const transactionReceipt = await transaction.getReceiptWithSigner(wallet);
        console.log("The transfer transaction from my account to the new account was: " + transactionReceipt.status.toString());

        //Request the cost of the query
        const queryCost = await new AccountBalanceQuery()
            .setAccountId(accountId)
            .executeWithSigner(wallet);

        console.log("The cost of query is: " + queryCost);

        //Check the new account's balance
        const getNewBalance = await new AccountBalanceQuery()
            .setAccountId(accountId)
            .executeWithSigner(wallet);

        console.log("The account balance after the transfer is: " + getNewBalance.hbars.toTinybars() + " tinybar.")
    }
    catch (error) {
        console.log(error)
    }
}

main();