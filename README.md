## Description

The wallet notifications service subscribes to open wallet transactions for specific users and processes those events, triggering airdrops if users have low balance.

## Prerequisites
Make sure that `.env` file is added. It will have all the configurations to run the application. Copy contents for .env.example file and replace with your credentials.

## Running containerised app
Make sure docker and docker-compose installed on your server. 

Build docker images by running
```shell
$ make init
```

Start the containers
```shell
$ make start  // Server will start at http://localhost:3000/
```
After running the `make start`, run db migrate command in a new terminal. It will initialise the db with entities. 
```shell
$ make migrate
```
**Note:** Server should be in running state while running this command.

## Other commands
To generate and create migrations, run:

```shell
$ make generate-migration
```

To revert a migration, run: 
```shell
$ make migrate-down
```

Stop the containers
```shell
$ make stop
```
##
To subscribe to events, you first need to add the Moralis Stream API, where you'll specify a webhook URL that points to your local system. 

To create a webhook for your local system, follow these steps:
- Use ngrok to expose your localhost to the internet.
- After obtaining the ngrok URL for your server, create a webhook URL in the format: `your-ngrok-url/webhooks/wallet-notifications`.
- Once you've created the stream with the webhook URL and added the relevant addresses, you'll start receiving Moralis events on your system.

## Running the app without containerization
"Ensure that the PostgreSQL database is installed and running on your system."

```bash
$ npm install
```

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev // Server will start at http://localhost:3000/
```

After running the `npm run start:dev`, run db migrate command in a new terminal. It will initialise the db with entities. 
```shell
$ npm run typeorm migration:run
```
**Note:** Server should be in the running state while running this command.


## Test

```bash
# unit tests
$ npm run test

# test coverage
$ npm run test:cov
```

## Extensibility of the service to handle multiple EVM chains depend on 

To enable airdrops for a new chain, three configuration updates are required:
- First, add EVM Chain name in `SUPPORTED_EVM_CHAINS_FOR_AIRDROP` in `src/domains/constants/evm.constants.ts`
- Second, add the EVM chain name and URL to the `evmChainUrlMap` in `src/domains/wallet/wallet.config.ts`. 
- Next, add the airdrop configuration for the EVM chain in `domains/wallet/airdrop.config.ts`.


## Design practices

In this project, Dependency Injection (DI) is used through interfaces in certain cases, such as with services. 

The primary reasons for this choice are to facilitate Test-Driven Development (TDD) and to promote loose coupling in services or any other components that depend on third parties.

This approach aligns [ISP](https://en.wikipedia.org/wiki/Interface_segregation_principle) aka `Interface Segregation principle` from SOLID principles.

## License

Nest is [MIT licensed](LICENSE).
