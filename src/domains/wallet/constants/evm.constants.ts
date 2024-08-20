export const enum EVM_CHAINS {
  BASE_MAINNET = 'base-mainnet',
  ETHEREUM_SEPOLIA = 'ethereum-sepolia',
  POLYGON_MAINNET = 'polygon-mainnet',
  ETHEREUM_MAINNET = 'ethereum-mainnet',
  ARBITRUM_MAINNET = 'arbitrum-mainnet',
  LINEA_MAINNET = 'linea_mainnet',
}

export const EVM_CHAIN_NAME_CODE_MAP = {
  [EVM_CHAINS.BASE_MAINNET]: '0x2105',
  [EVM_CHAINS.ETHEREUM_SEPOLIA]: '0xa',
  [EVM_CHAINS.POLYGON_MAINNET]: '0x89',
  [EVM_CHAINS.ETHEREUM_MAINNET]: '0x1',
  [EVM_CHAINS.ARBITRUM_MAINNET]: '0xa4b1',
  [EVM_CHAINS.LINEA_MAINNET]: '0xe708',
};

export const EVM_CHAIN_CODE_NAME_MAP = (() => {
  const entries = Object.entries(EVM_CHAIN_NAME_CODE_MAP).map(
    ([key, value]) => [value, key],
  );
  return Object.fromEntries(entries);
})();

export const SUPPORTED_EVM_CHAINS_FOR_AIRDROP = [EVM_CHAINS.BASE_MAINNET];
