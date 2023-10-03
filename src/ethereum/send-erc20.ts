import approot from 'app-root-path';
import { config } from "dotenv"
config({ path: `${approot.path}/.env` })

import { ethers } from 'ethers';
import { EthereumNetworkEnum } from './ethereum-config.js';
import { abi } from '../abi.js';

async function main() {

    const privateKey = process.env.ETHEREUM_PRIVATE_KEY;
    const ethereumAddress = process.env.ETHEREUM_ADDRESS;
    const etherscanKey = process.env.ETHERSCAN_KEY


    if (!privateKey || !ethereumAddress || !etherscanKey) {
        throw new Error("Environment variables ETHEREUM_PRIVATE_KEY and ETHEREUM_ADDRESS and ETHERSCAN_KEY must be present");
    }

    const provider = new ethers.EtherscanProvider(EthereumNetworkEnum.GOERLI, etherscanKey);
    const wallet = new ethers.Wallet(privateKey).connect(provider);
    const to: string = "0x9157Da27Fd29ae0619b99a02E002885101fA5002";

    const contractAddress = '0x326C977E6efc84E512bB9C30f76E30c160eD06FB';
    const value = '0.0001';
    const decimalsNumber = 18;
    const numberTransactions = 2;

    const erc20Contract = new ethers.Contract(contractAddress, abi, wallet);

    for (let i = 0; i < numberTransactions; i++) {
        const populateTransaction = await erc20Contract.transfer.populateTransaction(to, ethers.parseUnits(value, decimalsNumber));
        const populateSignedTx = await wallet.populateTransaction(populateTransaction);

        const sentTransaction = await wallet.sendTransaction(populateSignedTx);
        console.log(`Transaction sent successfully: ${sentTransaction?.hash}`);
    }
}

main();