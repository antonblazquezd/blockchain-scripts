import { ethers } from 'ethers';

async function main() {
    const transactionFields: ethers.TransactionLike = {
        to: "0xF19e9B808Eca47dB283de76EEd94FbBf3E9FdF96",
        value: "10",
        gasPrice: "10",
        nonce: 1,
        gasLimit: "10",
        data: "0x"
    }

    const transaction = ethers.Transaction.from(transactionFields)
    console.log(transaction.unsignedSerialized)
}

main();