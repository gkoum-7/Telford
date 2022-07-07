// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.8.13;

import {ICrossDomainMessenger} from "@eth-optimism/contracts/libraries/bridge/ICrossDomainMessenger.sol";
import "arb-bridge-eth/contracts/bridge/Inbox.sol";
import "./TelfordSource.sol";

/**
 * @dev L1Relayer is responsible for accepting the message from the L2BridgeDest contract on Optimism
 * and sending (relaying) a message to the TelfordSource contract on Arbitrum
 */

contract L1Relayer {
    /* ========== State ========== */

    mapping(uint256 => uint256) public transfers;
    address private owner;
    address private telfordSource;
    TelfordSource public telfordSourceContract;
    address private telfordDestination;
    IInbox public inboxArbitrum;
    address public crossDomainMessengerOptimism;
    ICrossDomainMessenger public crossDomainMessenger =
        ICrossDomainMessenger(crossDomainMessenger);

    /* ========== Events ========== */

    event ReceivedDestinationTransfer(
        address indexed bonder,
        address user,
        uint256 indexed bridgeAmount,
        uint256 indexed transferId
    );
    event RetryableTicketCreated(uint256 indexed ticketId);

    /* ========== Modifier / Constructor ========== */

    constructor(
        address _telfordSouceAddress,
        address _telfordDestinationAddress
    ) public {
        owner = msg.sender;
        inboxArbitrum = IInbox(0x578BAde599406A8fE3d24Fd7f7211c0911F5B29e);
        crossDomainMessengerOptimism = 0x4361d0F75A0186C05f971c566dC6bEa5957483fD;
        telfordSourceContract = TelfordSource(_telfordSouceAddress);
        telfordSource = _telfordSouceAddress;
        telfordDestination = _telfordDestinationAddress;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owners can perform this operation!");
        _;
    }

    modifier onlyTelfordDestination() {
        require(
            msg.sender == crossDomainMessengerOptimism &&
                crossDomainMessenger.xDomainMessageSender() ==
                telfordDestination,
            "Only the Telford Destination Contract can perform this operation!"
        );
        _;
    }

    /* ========== Receiving Function ========== */

    /**
     * @dev Function that is called on by Optimism's messagers contract via Telford's destination contract
     * it's purpose is to emit the ReceivedDestinationTransfer event and call on the relayToArbitrum contract to forward the message
     * @param _bonder The address of the bonder who provided liquidity for the transaction
     * @param _user The address of the user who is bridging
     * @param _bridgeAmount The amount the user is bridging (sub fees for the bonder)
     * @param _transferId Number to keep track of the transfer in progress
     */

    function receiveDestinationTransferConfirmation(
        address _bonder,
        address _user,
        uint256 _bridgeAmount,
        uint256 _transferId
    ) public onlyTelfordDestination {
        transfers[_transferId] = _bridgeAmount;
        emit ReceivedDestinationTransfer(
            _bonder,
            _user,
            _bridgeAmount,
            _transferId
        );
        relayToArbitrum(_transferId, _bridgeAmount, 10000000000000000, 0, 0);
    }

    /* ========== Sending Function ========== */

    /*
     * @dev Function that is called on the final step of accepting the distribution from Telford's Optimism contract,
     * It's purpose is to send a Retryable Ticket which will call on Telford's Arbitrum fundsReceivedOnDestination function
     * @param _transferId Number to keep track of the transfer in progress, it's forwarded to Telford's Arbitrum fundsReceivedOnDestination function
     * @param _bridgeAmount The amount the user is bridging (sub fees for the bonder), it's forwarded to Telford's Arbitrum fundsReceivedOnDestination function
     * @param maxSubmissionCost Max gas deducted from user's L2 balance to cover base submission fee
     * @param maxGas Max gas deducted from user's L2 balance to cover L2 execution
     * @param gasPriceBid price bid for L2 execution
     */

    function relayToArbitrum(
        uint256 transferId,
        uint256 bridgeAmount,
        uint256 maxSubmissionCost,
        uint256 maxGas,
        uint256 gasPriceBid
    ) public payable returns (uint256) {
        bytes memory data = abi.encodeWithSelector(
            telfordSourceContract.fundsReceivedOnDestination.selector,
            transferId,
            bridgeAmount
        );
        uint256 ticketID = inboxArbitrum.createRetryableTicket{
            value: msg.value
        }(
            telfordSource,
            0,
            maxSubmissionCost,
            msg.sender,
            msg.sender,
            maxGas,
            gasPriceBid,
            data
        );

        emit RetryableTicketCreated(ticketID);
        return ticketID;
    }

    /* ========== Receive Fallback & Withdrawl Function ========== */

    // Functions are used so the owner can deposit / withdraw ETH for gas to pay for the retryable ticket creation

    receive() external payable {}

    function withdrawEther() public onlyOwner {
        (bool success, ) = msg.sender.call{
            value: address(this).balance,
            gas: 35000
        }("");
        require(success == true, "Withdrawal failed!");
    }

    /* ========== Setter Functions ========== */

    function setInboxArbitrum(address _inboxArbitrumAddress)
        external
        onlyOwner
    {
        inboxArbitrum = IInbox(_inboxArbitrumAddress);
    }

    function setCrossDomainMessengerOptimism(
        address _crossDomainMessengerOptimismAddress
    ) external onlyOwner {
        crossDomainMessengerOptimism = _crossDomainMessengerOptimismAddress;
    }

    function setTelfordSource(address _telfordSourceAddress)
        external
        onlyOwner
    {
        telfordSource = _telfordSourceAddress;
    }

    function setTelfordDestination(address _telfordDestinationAddress)
        external
        onlyOwner
    {
        telfordDestination = _telfordDestinationAddress;
    }
}
