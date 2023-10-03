import approot from 'app-root-path';
import { config } from "dotenv"
config({ path: `${approot.path}/.env` })

import { Client, Transaction, PublicKey } from "@hashgraph/sdk";

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

    const transactionSerialized: string = '';

    const txBuffer = Buffer.from(transactionSerialized, "base64");
    const transactionToSign: Transaction = Transaction.fromBytes(txBuffer);


    const txSignedSerialized1: string = ''
    const txSignedSerialized2: string = ''

    //Signer one signs the transaction with their private key
    const txSignature1 = getSignature(txSignedSerialized1);

    //Signer two signs the transaction with their private key
    const txSignature2 = getSignature(txSignedSerialized2);

    if (!txSignature1 || !txSignature2) {
        throw new Error("Invalid signature ")
    }

    //signature1, signature2 are returned back to you
    //Collate all three signatures with the transaction
    const signedTransaction = transactionToSign.addSignature(txSignature1.publicKey, new Uint8Array(txSignature1.signature)).addSignature(txSignature2.publicKey, new Uint8Array(txSignature2.signature));


    //Print all public keys that signed the transaction
    console.log("The public keys that signed the transaction  " + signedTransaction.getSignatures());

    //Submit the transaction to a Hedera network
    const submitTx = await signedTransaction.execute(client);

    //Get the transaction ID
    const txId = submitTx.transactionId.toString();

    //Print the transaction ID to the console
    console.log("The transaction ID " + txId);

    const transactionReceipt = await submitTx.getReceipt(client);
    console.log("The transfer transaction from my account to the new account was: " + transactionReceipt.status.toString());
}

function getSignature(transactionSerialized: string): { publicKey: PublicKey, signature: Uint8Array } | undefined {
    const txBuffer = Buffer.from(transactionSerialized, "base64");
    const transaction = Transaction.fromBytes(txBuffer);
    const signaturesMap = transaction.getSignatures();
    const signaturesMapKeys = signaturesMap.keys();
    for (const signaturesMapKey of signaturesMapKeys) {
        console.log("NodeAccountId: " + signaturesMapKey);
        const nodeSignatures = signaturesMap.get(signaturesMapKey);
        if (nodeSignatures) {
            const keys = nodeSignatures.keys();
            for (const key of keys) {
                console.log("Public key: " + key.toStringRaw());
                const signature = nodeSignatures.get(key);
                if (signature) {
                    console.log("Signature: " + Buffer.from(signature).toString('base64'));
                    return {
                        publicKey: key,
                        signature
                    }
                }
            }

        }
    }
}

main();