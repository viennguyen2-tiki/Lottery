// SPDX-License-Identifier: LGPL-3.0-only
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

import "hardhat/console.sol";

interface IERC20Extented is IERC20 {
    function decimals() external view returns (uint8);
    function symbol() external view returns (string memory);
}

contract Lottery{

    using SafeMath for uint;
    
    enum GameStatus {
        STARD,
        STOP
    }

    struct Player {
        address id;
        uint8   betNumber;
    }

    struct Game {
        uint id;
        Player[] players;
        address[] winners;
        uint8 winNumber;
        GameStatus status;
        uint startTime;
        uint endTime;
    }

    uint8 private MAX_PlAYER = 100;
    uint8 private MIN_PLAYER = 1;
    uint8 private MAX_BET_NUMBER = 99;
    uint8 private MIN_BET_NUMBER = 0;
    uint8 private NUMBER_VALUE_BET_ONE_GAME = 1;
    uint8 private GAME_FEE = 10; // 10%

    address private _dealer;
    // native coin/token ERC20 which use to bet
    IERC20Extented public _currency;

    Game[] public games;
    uint public nextGameId;
    
    uint public balance;


    constructor() {
        _dealer = msg.sender;
    }

    function setGameCurrency(address currency) external onlyDealer {
        _currency = IERC20Extented(currency);
        _currency.approve(address(this), 2**256 - 1);
    }

    function getCurrencyName() external view returns(string memory) {
        return _currency.symbol();
    }

    function balanceOf() external view returns(uint){
        return balance;
    }

    function currentTime() external view returns(uint){
        return block.timestamp;
    }

    function winnersOfGame(uint gameId) 
        external
        view 
        checkGameId(gameId)
        returns(address[] memory){
        // console.log("%s %s", games.length, gameId);
        return games[gameId].winners;
    }

    function playerOfGame(uint gameId, uint playerId) 
        external
        view
        checkGameId(gameId)
        returns(address, uint8){
        Player storage player = games[gameId].players[playerId];
        return (player.id, player.betNumber);
    }

    function numberOfPlayerInGame(uint gameId)
        external
        view
        checkGameId(gameId)
        returns(uint){
        return games[gameId].players.length;
    }

    function createGame() external onlyDealer notHaveNewGame {
        require(address(_currency) != address(0), 'set currency of game before create game');
        games.push();
        Game storage game = games[nextGameId];
        game.status = GameStatus.STARD;
        game.id = nextGameId;
        game.startTime = block.timestamp;
        nextGameId++;
    }

    function stopGame() external onlyDealer openGame {
        Game storage game = games[nextGameId - 1];
        game.status = GameStatus.STOP;
        game.winNumber = _getWinNumber();
        game.endTime = block.timestamp;
        _findWinners(game);
        _sendMoneyToWinners(game);
    }
    
    /*
        player call to join game
        @param number predict number
    */
    function bet(uint8 number) external openGame onlyPlayer {
        Game storage game = games[nextGameId - 1];

        if(_isPlayerReadyBet(game, msg.sender)){
            revert("you bet");
        }

        require(game.players.length <= MAX_PlAYER, "enough players");
        uint playerBalance = _currency.balanceOf(msg.sender);
        uint betValue = _getValueOfBet();
        require(playerBalance >= betValue, "not enough money");
        require(number >=0 && number <= 99, "bet number must be between from 0 to 99");
        _currency.transferFrom(msg.sender, address(this), betValue);
        balance += betValue;
        game.players.push(Player(msg.sender, number));
    }

    function _getValueOfBet() private view returns(uint){
        return uint(NUMBER_VALUE_BET_ONE_GAME).mul(10 ** _currency.decimals());
    }

    function _sendMoneyToWinners(Game storage game) private {
        if(balance > 0){
            address[] memory winners = game.winners;
            uint numberOfPlayer = winners.length;
            //console.log("winner %s, fee %s , balance %s", numberOfPlayer, GAME_FEE, balance);
            if(numberOfPlayer > 0) {
                uint fee = balance.mul(GAME_FEE).div(100);
                //console.log("fee %s", fee);
                uint remainBalance = balance - fee;
                uint realMoneyForWinner = remainBalance / numberOfPlayer;
                //console.log("shared %s", realMoneyForWinner);
                _currency.transfer(_dealer, fee);
                
                for(uint i = 0; i < numberOfPlayer; i++){
                    _currency.transfer(winners[i], realMoneyForWinner);
                }
            } else {
                _currency.transfer(_dealer, balance);
            }
        }
        //reset balance
        balance = 0;
    }

    function _findWinners(Game storage game) private {
        Player[] storage players = game.players;
        for(uint i = 0; i < players.length; i++){
            if(players[i].betNumber == game.winNumber){
                // console.log("win palyer %s", players[i].id);
                game.winners.push(players[i].id);
            }
        }
    }

    function _transferMoney(address to, uint amount) private {

    }

    function _getWinNumber() private view returns(uint8) {
        return uint8(block.timestamp.mod(100));
    }

    function _isPlayerReadyBet(Game storage game, address playerId) private view returns(bool) {
        for(uint i = 0; i < game.players.length; i++){
            if(game.players[i].id == playerId){
                return true;
            }
        }
        return false;
    }

    modifier checkGameId(uint gameId) {
        require(gameId >= 0 && gameId < nextGameId, "gameId not correct");
        _;
    }

    modifier openGame(){
        bool gameStarted = nextGameId > 0 && games[nextGameId - 1].status == GameStatus.STARD;
        require(gameStarted, "game hasn't started yet");
        _;
    }

    modifier notHaveNewGame(){
        bool noGameBefore = nextGameId == 0;
        bool gameStopped = nextGameId > 0 && games[nextGameId - 1].status == GameStatus.STOP;
        require(noGameBefore || gameStopped, "game has started");
        _;
    }

    modifier onlyDealer(){
        require(msg.sender == _dealer, "only Dealer");
        _;
    }

    modifier onlyPlayer(){
        require(msg.sender != _dealer, "Dealer cannot be a player");
        _;
    }
}