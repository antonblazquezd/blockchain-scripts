import approot from 'app-root-path';
import { config } from "dotenv"
config({ path: `${approot.path}/.env` })

import { ethers } from 'ethers';
import { globalConfig } from '../config.js';
import { EthereumNetworkEnum, ChainlistEnum, ethereumConfig } from './ethereum-config.js';

async function main() {

    const privateKey = process.env.ETHEREUM_PRIVATE_KEY;
    const ethereumAddress = process.env.ETHEREUM_ADDRESS;
    const etherscanKey = process.env.ETHERSCAN_KEY


    if (!privateKey || !ethereumAddress || !etherscanKey) {
        throw new Error("Environment variables ETHEREUM_PRIVATE_KEY and ETHEREUM_ADDRESS and ETHERSCAN_KEY must be present");
    }

    const provider = new ethers.EtherscanProvider(EthereumNetworkEnum.GOERLI, etherscanKey);
    const wallet = new ethers.Wallet(privateKey).connect(provider);
    const to: string[] = ["0x9157Da27Fd29ae0619b99a02E002885101fA5002", "0x17AdC479f6d7ad54023D01872F1266C1E9FaAAec"];

    const value = '0.0001';

    const nonce = await provider.getTransactionCount(ethereumAddress);

    // Define una función asincrónica para manejar cada transacción
    const sendTransaction = async (address: string, index: number) => {
        const feeData = await provider.getFeeData();

        const signedTxDto = {
            chainId: ChainlistEnum[ethereumConfig.networks[globalConfig.network].toUpperCase() as any],
            to: address,
            type: 2,
            nonce: nonce + index,
            gasLimit: BigInt("21000"),
            maxFeePerGas: feeData.maxFeePerGas,
            maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
            value: ethers.parseUnits(value), // convert from ETH to wei
        };

        const populateSignedTx = await wallet.populateTransaction(signedTxDto);

        const sentTransaction = await wallet.sendTransaction(populateSignedTx);
        console.log(`Transaction sent successfully: ${sentTransaction?.hash}`);
    };

    // Itera sobre las direcciones usando Promise.all para manejar las transacciones en paralelo
    await Promise.all(to.map((address, index) => sendTransaction(address, index)));

}

main();