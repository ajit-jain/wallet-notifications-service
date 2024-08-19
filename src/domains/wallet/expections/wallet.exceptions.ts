import { InternalServerErrorException } from "@nestjs/common";
import { WALLET_EXCEPTIONS } from "../constants/wallet.constants";

export class EVMChainUrlNotConfigured extends InternalServerErrorException{
    constructor(){
        super(WALLET_EXCEPTIONS.CHAIN_URL_NOT_CONFIGURED)
    }
}

export class EVMChainAirdropSettingsNotConfigured extends InternalServerErrorException{
    constructor(){
        super(WALLET_EXCEPTIONS.AIRDROP_SETTINGS_NOT_CONFIGURED)
    }
}