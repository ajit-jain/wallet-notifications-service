## Description

The wallet notifications service subscribes to open wallet transactions for specific users and processes those events, triggering airdrops if users have low balances.

## Installation

```bash
$ npm install
```

## Running the app
Make sure that `.env` file is added. It will have all the configurations to run the application. Copy contents for .env.example file and replace with your credentials.

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev


## Test

```bash
# unit tests
$ npm run test

# test coverage
$ npm run test:cov
```

## Extensibility of the service to handle multiple EVM chains depend on 

- To enable airdrops for a new chain, three configuration updates are required:
   First, add EVM Chain name in `SUPPORTED_EVM_CHAINS_FOR_AIRDROP` in `src/domains/constants/evm.constants.ts`
   Second, add the EVM chain name and URL to the `evmChainUrlMap` in `src/domains/wallet/wallet.config.ts`. 
   Next, add the airdrop configuration for the EVM chain in `domains/wallet/airdrop.config.ts`.


## Design practices

In this project, Dependency Injection (DI) is used through interfaces in certain cases, such as with services. 

The primary reasons for this choice are to facilitate Test-Driven Development (TDD) and to promote loose coupling in services or any other components that depend on third parties.

This approach aligns [ISP](https://en.wikipedia.org/wiki/Interface_segregation_principle) aka `Interface Segregation principle` from SOLID principles.

## License

Nest is [MIT licensed](LICENSE).
