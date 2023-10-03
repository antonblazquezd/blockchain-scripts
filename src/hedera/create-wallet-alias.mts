import approot from 'app-root-path';
import { config } from "dotenv"
config({ path: `${approot.path}/.env` })

import { PrivateKey, AccountInfoQuery, AccountBalanceQuery, Hbar, TransferTransaction, Client } from "@hashgraph/sdk";

async function main() {

    //Grab your Hedera testnet account ID and private key from your .env file
    const myAccountId = process.env.HEDERA_ACCOUNT_ID;
    const myPrivateKey = process.env.HEDERA_PRIVATE_KEY;

    // If we weren't able to grab it, we should throw a new error
    if (!myAccountId || !myPrivateKey) {
        throw new Error("Environment variables MY_ACCOUNT_ID and MY_PRIVATE_KEY must be present");
    }

    const client: Client = Client.forTestnet();
    client.setOperator(myAccountId, myPrivateKey);

    console.log('"Creating" a new account');

    const privateKey = PrivateKey.generateED25519();
    const publicKey = privateKey.publicKey;

    // Assuming that the target shard and realm are known.
    // For now they are virtually always 0 and 0.
    const aliasAccountId = publicKey.toAccountId(0, 0);

    console.log(`New account ID: ${aliasAccountId.toString()}`);
    console.log(`Just the aliasKey: ${aliasAccountId.aliasKey?.toString()}`);

    try {
        console.log("Transferring some Hbar to the new account");
        const transferTransaction = new TransferTransaction()
            .addHbarTransfer(myAccountId, new Hbar(1).negated())
            .addHbarTransfer(aliasAccountId, new Hbar(1))
            .freezeWith(client);

        const transaction = await transferTransaction.signWithOperator(client);

        const response = await transaction.execute(client);
        await response.getReceipt(client);

        const balance = await new AccountBalanceQuery()
            .setNodeAccountIds([response.nodeId])
            .setAccountId(aliasAccountId)
            .execute(client);

        console.log(`Balances of the new account: ${balance.toString()}`);

        const info = await new AccountInfoQuery()
            .setNodeAccountIds([response.nodeId])
            .setAccountId(aliasAccountId)
            .execute(client);

        console.log(`Info about the new account: ${info.toString()}`);

        /*
         * Note that once an account exists in the ledger, it is assigned a normal AccountId, which can be retrieved
         * via an AccountInfoQuery.
         *
         * Users may continue to refer to the account by its aliasKey AccountId, but they may also
         * now refer to it by its normal AccountId
         */

        console.log(`The normal account ID: ${info.accountId.toString()}`);
        console.log(`The alias key: ${info.aliasKey?.toString()}`);

        console.log("Example complete!");
    }
    catch (error) {
        console.log(error)
    }
}

main();