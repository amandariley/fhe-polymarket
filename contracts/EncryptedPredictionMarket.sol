// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint32, externalEuint32} from "@fhevm/solidity/lib/FHE.sol";
import {ZamaEthereumConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

contract EncryptedPredictionMarket is ZamaEthereumConfig {
    uint32 public constant STARTING_POINTS = 100;
    uint32 public constant BET_COST = 10;
    uint8 public constant MAX_BETS = uint8(STARTING_POINTS / BET_COST);

    struct Prediction {
        string title;
        string[] options;
        address creator;
        uint256 createdAt;
        uint256 totalBets;
    }

    Prediction[] private _predictions;

    mapping(address => bool) private _registered;
    mapping(address => euint32) private _balances;
    mapping(address => uint8) private _remainingBets;

    mapping(uint256 => mapping(address => euint32)) private _userChoices;
    mapping(uint256 => mapping(address => euint32)) private _userBetAmounts;
    mapping(uint256 => mapping(address => bool)) private _userHasBet;

    event PredictionCreated(uint256 indexed predictionId, address indexed creator, string title);
    event Registered(address indexed user);
    event BetPlaced(uint256 indexed predictionId, address indexed user);

    modifier onlyRegistered() {
        require(_registered[msg.sender], "Not registered");
        _;
    }

    modifier validPrediction(uint256 predictionId) {
        require(predictionId < _predictions.length, "Invalid prediction");
        _;
    }

    function register() external {
        require(!_registered[msg.sender], "Already registered");

        _registered[msg.sender] = true;
        _remainingBets[msg.sender] = MAX_BETS;

        euint32 startingBalance = FHE.asEuint32(STARTING_POINTS);
        _updateBalance(msg.sender, startingBalance);

        emit Registered(msg.sender);
    }

    function createPrediction(string calldata title, string[] calldata options) external onlyRegistered returns (uint256) {
        require(bytes(title).length > 0, "Title required");
        require(options.length >= 1 && options.length <= 4, "Options 1-4");

        string[] memory optionCopies = new string[](options.length);
        for (uint256 i = 0; i < options.length; i++) {
            require(bytes(options[i]).length > 0, "Empty option");
            optionCopies[i] = options[i];
        }

        Prediction memory prediction = Prediction({
            title: title,
            options: optionCopies,
            creator: msg.sender,
            createdAt: block.timestamp,
            totalBets: 0
        });

        _predictions.push(prediction);
        uint256 predictionId = _predictions.length - 1;

        emit PredictionCreated(predictionId, msg.sender, title);
        return predictionId;
    }

    function placeBet(uint256 predictionId, externalEuint32 encryptedChoice, bytes calldata inputProof) external onlyRegistered validPrediction(predictionId) {
        require(!_userHasBet[predictionId][msg.sender], "Already bet");
        require(_remainingBets[msg.sender] > 0, "No balance");

        euint32 choice = FHE.fromExternal(encryptedChoice, inputProof);
        _userChoices[predictionId][msg.sender] = choice;
        FHE.allowThis(choice);
        FHE.allow(choice, msg.sender);

        euint32 betAmount = FHE.asEuint32(BET_COST);
        _userBetAmounts[predictionId][msg.sender] = betAmount;
        FHE.allowThis(betAmount);
        FHE.allow(betAmount, msg.sender);

        euint32 newBalance = FHE.sub(_balances[msg.sender], betAmount);
        _updateBalance(msg.sender, newBalance);

        _remainingBets[msg.sender] -= 1;
        _userHasBet[predictionId][msg.sender] = true;
        _predictions[predictionId].totalBets += 1;

        emit BetPlaced(predictionId, msg.sender);
    }

    function getPredictionCount() external view returns (uint256) {
        return _predictions.length;
    }

    function getPrediction(uint256 predictionId)
        external
        view
        validPrediction(predictionId)
        returns (string memory title, string[] memory options, address creator, uint256 createdAt, uint256 totalBets)
    {
        Prediction storage prediction = _predictions[predictionId];

        string[] memory optionCopies = new string[](prediction.options.length);
        for (uint256 i = 0; i < prediction.options.length; i++) {
            optionCopies[i] = prediction.options[i];
        }

        return (prediction.title, optionCopies, prediction.creator, prediction.createdAt, prediction.totalBets);
    }

    function isRegistered(address user) external view returns (bool) {
        return _registered[user];
    }

    function getEncryptedBalance(address user) external view returns (euint32) {
        return _balances[user];
    }

    function getRemainingBets(address user) external view returns (uint8) {
        return _remainingBets[user];
    }

    function hasUserBet(uint256 predictionId, address user) external view validPrediction(predictionId) returns (bool) {
        return _userHasBet[predictionId][user];
    }

    function getUserEncryptedChoice(uint256 predictionId, address user)
        external
        view
        validPrediction(predictionId)
        returns (euint32)
    {
        return _userChoices[predictionId][user];
    }

    function getUserEncryptedBetAmount(uint256 predictionId, address user)
        external
        view
        validPrediction(predictionId)
        returns (euint32)
    {
        return _userBetAmounts[predictionId][user];
    }

    function _updateBalance(address user, euint32 newBalance) private {
        _balances[user] = newBalance;
        FHE.allowThis(newBalance);
        FHE.allow(newBalance, user);
    }
}
