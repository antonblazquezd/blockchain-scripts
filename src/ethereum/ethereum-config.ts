export enum EthereumNetworkEnum {
    MAINNET = 'mainnet',
    GOERLI = 'goerli'
}

export enum ChainlistEnum {
    MAINNET = 1,
    GOERLI = 5
}

export const ethereumConfig = {
    networks: {
        mainnet: EthereumNetworkEnum.MAINNET,
        testnet: EthereumNetworkEnum.GOERLI
    },
}