require("@nomicfoundation/hardhat-toolbox");

require('dotenv').config();

// Register tasks
require('./tasks');


/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.9",
  networks: {
    goerli: {
      url: 'https://eth-goerli.g.alchemy.com/v2/VsoymG3gh4unqMxKofZZ5LVdRRCRqcY-', // public infura endpoint
      chainId: 5,
      accounts: ["42cc6a7e9e9b6b5e3fca6d75ae4767a76cb9c216f1c30ee639e6037418d6f0cc"]
    },
  }
};
