// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {ICrossDomainMessenger} from "@eth-optimism/contracts/libraries/bridge/ICrossDomainMessenger.sol";

// todo: optimize contract (Eg visibility, gas, natspec)
contract TelfordDestination {
    address owner;
    address contractAddr;
    address public bonder;

    // L2 -> L1 messaging
    address public l2CrossDomainMessenger;
    address public l1Relayer;

    constructor(
        address _bonder,
        address _l2CrossDomainMessenger,
        address _l1Relayer
    )
    {
        owner = msg.sender;
        contractAddr = address(this);
        bonder = _bonder;
        l2CrossDomainMessenger = _l2CrossDomainMessenger;
        l1Relayer = _l1Relayer;
    }

    /** modifiers */
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owners can perform this operation!");
        _;
    }

    modifier onlyBonder() {
        require(msg.sender == bonder, "You must be a bonder to initiate withdrawAndDistribute!");
        _;
    }

    /** events */
    // format: transferId, amount, sender_address, receiver_address, other_addresses
    event TransferFromBonder(uint256 transferId, uint256 amount, address bonder, address contractAddr, address user);
    event TransferToUser(uint256 transferId, uint256 amount, address contractAddr, address user, address bonder);
    event RelayTransferConfirmation(uint256 transferId, uint256 amount, address bonder, address user, address contractAddr);

    function depositAndDistribute(
        address _user,
        uint256 _transferId
    )
        external
        payable
        onlyBonder
    {   
        // readability
        // address _bonder = msg.sender;
        // uint256 _amount = msg.value;        
        emit TransferFromBonder(
            _transferId,
            msg.value,
            msg.sender,
            contractAddr,
            _user
        );

        _distribute(_transferId, msg.value, msg.sender, _user);

        _relayTransferConfirmation(_transferId, msg.value, msg.sender, _user, contractAddr);
    }

    /* private functions */

    function _distribute(
        uint256 _transferId,
        uint256 _amount,
        address _bonder,
        address _user
    )
        private
    {
        (bool success, ) = _user.call{value: _amount, gas: 35000}("");
        require(success, "Transfer from TelfordDestination to User failed!");

        emit TransferToUser(
            _transferId,
            _amount,
            contractAddr,
            _user,
            _bonder
        );
    }

    function _relayTransferConfirmation(
        uint256 _transferId,
        uint256 _amount,
        address _bonder,
        address _user,
        address _contract
    ) 
    private
    {
        ICrossDomainMessenger(l2CrossDomainMessenger).sendMessage(
            l1Relayer,
            abi.encodeWithSignature(
                "receiveDestinationTransferConfirmation(address,address,string,uint256,uint256)",
                _transferId,
                _amount,
                _bonder,
                _user
            ),
            100000
        );

            emit RelayTransferConfirmation(
                _transferId,
                _amount,
                _bonder,
                _user,
                _contract
            );
    }

    /* helper functions */
    function setBonder(address _bonder) external onlyOwner {
        bonder = _bonder;
    }

    function setl2CrossDomainMessenger(address _l2CrossDomainMessenger) external onlyOwner {
        l2CrossDomainMessenger = _l2CrossDomainMessenger;
    }
    
    function setL1Relayer(address _l1Relayer) external onlyOwner {
        l1Relayer = _l1Relayer;
    }
}

// Future Work
// - Support bonder registry (vs single bonder)
// - Support ERC20 tokens
// - Multiple chains will require chainId, interface/lib for x-chain calls, etc