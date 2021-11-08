// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.6;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockERC20Token is ERC20 {
    constructor() ERC20("Netpower Token", "NPT") {
        // a million
        // 1 token 1000000000000000000
        // 10 token 10000000000000000000
        // 100 token 100000000000000000000
        // 1 000 token 1000000000000000000000
        // 1 000 000 token 1000000000000000000000000
        // 10 000 000 token 10000000000000000000000000
        // 100 000 000 token 100000000000000000000000000
        // 1 000 000 000 token 1000000000000000000000000000
        _mint(msg.sender, 1000000000000000000000000000);
    }
    
      /**
     * Everyone can mint
     */       
    function mintForMe(uint256 amount) public {
        _mint(msg.sender, amount);
    }
}