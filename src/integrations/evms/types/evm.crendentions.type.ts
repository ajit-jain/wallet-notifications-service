export abstract class EVMCredentails {}

export class PrivateKeyCredentials extends EVMCredentails {
    readonly privateKey: string;
    constructor(privatekey: string) {
        super();
        this.privateKey= privatekey;
    }
}