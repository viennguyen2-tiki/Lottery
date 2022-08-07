# The lottery game

## Try running some of the following tasks:
### - `Build localhost`
```shell
npx hardhat compile
npx hardhat node
npx hardhat run --network localhost scripts/deploy.js
```
Then, in another shell, run a script to testing game:
```shell
npx hardhat set-currency --network localhost
npx hardhat create-game --network localhost
npx hardhat bet --account 1 --number 10 --network localhost
npx hardhat stop-game --network localhost
```
`set-currency`, `create-game`, `bet`, `stop-game` are task of hardhat. Please get more detail at `tasks` folder.
### - `Build testnet network`

npx hardhat set-currency --network localhost
npx hardhat create-game --network localhost
npx hardhat bet --account 1 --number 10 --network localhost
npx hardhat stop-game --network localhost
```shell

npx hardhat help
npx hardhat test
gas_report=true npx hardhat test
npx hardhat node
npx hardhat run --network localhost scripts/deploy.js

```
