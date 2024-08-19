
import { Logger } from '@nestjs/common';
import { EVM_CHAIN_CODE_NAME_MAP } from '../../constants/evm.constants';
import Moralis from 'moralis';
export const initialize =  async () => {
    let logger = new Logger('Initialise stream');
    try {
        await Moralis.start({
            apiKey: process.env.MORALIS_API_KEY
        })
          
        const response = await Moralis.Streams.add({
            chains: Object.keys(EVM_CHAIN_CODE_NAME_MAP),
            description: 'Test Stream',
            includeContractLogs: true,
            includeNativeTxs: true,
            tag: process.env.MORALIS_ADD_STREAM_TAG,
            webhookUrl: process.env.MORALIS_ADD_STREAM_WEBHOOK_URL,
        });

        const streamId = response.toJSON().id;
    
        const addresses = [process.env.MORALIS_ADD_STREAM_ADDRESS]
        await Moralis.Streams.addAddress({
            id: streamId,
            address: addresses,
        });

        logger.log(`Stream API added for addresses: ${addresses}`);

    } catch(e) {
        logger.error(e);
    }
}