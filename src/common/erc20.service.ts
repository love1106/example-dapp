import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MockERC20TokenABI } from 'src/abi/MockERC20TokenABI';
import { EthereumService } from '../common/ethereum.service';
import { TransactionEvent } from '../common/transaction-event';

// The minimum ABI required to get the ERC20 Token balance
const minERC20ABI = [{ "inputs": [], "payable": false, "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "owner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "spender", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }], "name": "Approval", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "previousOwner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "newOwner", "type": "address" }], "name": "OwnershipTransferred", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "from", "type": "address" }, { "indexed": true, "internalType": "address", "name": "to", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }], "name": "Transfer", "type": "event" }, { "constant": true, "inputs": [], "name": "_decimals", "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "_name", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "_symbol", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "address", "name": "spender", "type": "address" }], "name": "allowance", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "approve", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [{ "internalType": "address", "name": "account", "type": "address" }], "name": "balanceOf", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "burn", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "decimals", "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "subtractedValue", "type": "uint256" }], "name": "decreaseAllowance", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "getOwner", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "addedValue", "type": "uint256" }], "name": "increaseAllowance", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "mint", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "name", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "owner", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [], "name": "renounceOwnership", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "symbol", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "totalSupply", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "address", "name": "recipient", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "transfer", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "address", "name": "sender", "type": "address" }, { "internalType": "address", "name": "recipient", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "transferFrom", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "address", "name": "newOwner", "type": "address" }], "name": "transferOwnership", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }];

@Injectable({ providedIn: 'root' })
export class Erc20Service {
  constructor(
    private ethereumService: EthereumService
  ) {

  }

  balanceOf(ercTokenAddress: string, ownerAddress): Promise<number> {
    const appWeb3 = this.ethereumService.appWeb3ManualWebHost;
    const contract = new appWeb3.eth.Contract(minERC20ABI, ercTokenAddress);
    return contract.methods.balanceOf(ownerAddress).call().then(response => {
      return appWeb3.utils.fromWei(response);
    });
  }

  allowance(ercTokenAddress: string, owner: string, spender: string): Promise<number> {
    const appWeb3 = this.ethereumService.appWeb3ManualWebHost;
    const contract = new appWeb3.eth.Contract(minERC20ABI, ercTokenAddress);
    return contract.methods.allowance(owner, spender).call().then(response => {
      return appWeb3.utils.fromWei(response);
    });
  }

  approve(ercTokenAddress: string, owner: string, spender: string, amount: string): Promise<Observable<TransactionEvent>> {
    const appWeb3 = this.ethereumService.appWeb3;
    const contract = new appWeb3.eth.Contract(minERC20ABI, ercTokenAddress);
    const method = contract.methods.approve(spender, amount);
    return this.ethereumService.sendTransactionByMethodWithEvent(owner, method);
  }

  transfer(ercTokenAddress: string, owner: string, receiver: string, amount: number): Promise<Observable<TransactionEvent>> {
    const appWeb3 = this.ethereumService.appWeb3;
    const contract = new appWeb3.eth.Contract(minERC20ABI, ercTokenAddress);
    const method = contract.methods.transfer(receiver, appWeb3.utils.toWei(amount.toString()));
    return this.ethereumService.sendTransactionByMethodWithEvent(owner, method);
  }

  transferSigned(ercTokenAddress: string, owner: string, receiver: string, amount: number, privateKey: string, networkId: number): Promise<Observable<TransactionEvent>> {
    const appWeb3 = this.ethereumService.appWeb3;
    const contract = new appWeb3.eth.Contract(minERC20ABI, ercTokenAddress);
    const method = contract.methods.transfer(receiver, appWeb3.utils.toWei(amount.toString()));
    return this.ethereumService.sendSignedTransactionByMethodWithEvent(owner, ercTokenAddress, method, privateKey, networkId);
  }

  mintForMe(senderAddress: string, erc20Address: string, amount: number): Promise<any> {
    const appWeb3 = this.ethereumService.appWeb3;
    const contract = new appWeb3.eth.Contract(MockERC20TokenABI, erc20Address);
    const method = contract.methods.mintForMe(appWeb3.utils.toWei(amount.toString()));
    return this.ethereumService.sendTransactionByMethodWithEvent(senderAddress, method);
  }
}
