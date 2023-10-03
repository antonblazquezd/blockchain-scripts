import approot from 'app-root-path';
import { config } from "dotenv"
config({ path: `${approot.path}/.env` })

const { Hbar, TransferTransaction, Client, AccountId } = require("@hashgraph/sdk");

async function main() {

    //Grab your Hedera testnet account ID and private key from your .env file
    const myAccountId = process.env.HEDERA_ACCOUNT_ID;
    const myPrivateKey = process.env.HEDERA_PRIVATE_KEY;

    // If we weren't able to grab it, we should throw a new error
    if (!myAccountId || !myPrivateKey) {
        throw new Error("Environment variables MY_ACCOUNT_ID and MY_PRIVATE_KEY must be present");
    }

    const client = Client.forTestnet();
    client.setOperator(myAccountId, myPrivateKey);

    //The node account ID to submit the transaction to. You can add more than 1 node account ID to the list
    const nodeId = [];
    nodeId.push(new AccountId(3));

    const senderAccountId1 = '0.0.2621981'
    const senderAccountId2 = '0.0.2621978'

    //Create the transfer transaction
    const transferTransaction = new TransferTransaction()
        .addHbarTransfer(senderAccountId1, new Hbar(-0.1))
        .addHbarTransfer(senderAccountId2, new Hbar(-0.1))
        .addHbarTransfer(myAccountId, new Hbar(0.2))
        .setTransactionValidDuration(180)
        .setNodeAccountIds(nodeId);

    //Freeze the transaction from further modifications
    const transaction = await transferTransaction.freezeWith(client);

    const transactionSerialized = Buffer.from(transaction.toBytes()).toString("base64");
    console.log(transactionSerialized)
}

main();