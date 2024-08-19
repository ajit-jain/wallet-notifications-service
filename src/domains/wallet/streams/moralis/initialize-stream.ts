
import { EVM_CHAIN_CODE_NAME_MAP } from '../../constants/evm.constants';
import Moralis from 'moralis';
export const initialize =  async () => {
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
    
        await Moralis.Streams.addAddress({
            id: streamId,
            address: [process.env.MORALIS_ADD_STREAM_ADDRESS],
        });
        console.log("Stream API added");
    } catch(e) {
        console.error(e);
    }
}