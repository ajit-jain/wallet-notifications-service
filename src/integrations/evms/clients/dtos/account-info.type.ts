export class AccountInfoDto  {
    readonly address: string;
    constructor(address: string) {
        this.address = address;
    }
}