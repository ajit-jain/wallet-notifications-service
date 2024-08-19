import { EVMClient } from "src/integrations/evms/clients/evm-client.interface";

export const EVMClientMock = (): jest.Mocked<EVMClient> => {
    return {
        getBalance: jest.fn(),
        getAccountByPrivateKey: jest.fn(),
        sendTransaction: jest.fn(),
        // Add other methods that need to be mocked
    } as unknown as jest.Mocked<EVMClient>;
};