import { Transaction } from "@hashgraph/sdk";

async function main() {

    const transactionSerialized = "CsQBKsEBClcKGgoMCLHms6YGEL+a24gCEggIABAAGNSgGxgAEgYIABAAGAMYgMLXLyICCHgyAHImCiQKEAoICAAQABjN9wYQwJoMGAAKEAoICAAQABjUoBsQv5oMGAASZgpkCiDVpYnkiR1hNXV+ZlN4COTu7Z5At3QGpxyFrAtEgbNNKxpA14li1/yDxQIxgoXBWGTbutFBLIFo71gciiuTXzQsx4PUtwGysSNiTNhAQLzvm35gUdgZsxG8b+kwnKXu1R4cBQ=="

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
                const signature = nodeSignatures.get(key);
                if (signature) {
                    console.log("Public key: " + key.toStringRaw());
                    console.log("Signature: ");
                    console.log(signature);
                    console.log("\n");
                }
            }

        }
    }
}

main();