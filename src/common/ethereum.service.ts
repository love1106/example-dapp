import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CommonService } from './common.service';
import { NetworkRepository } from './network.repository';
import { RegisterTokenRequest } from './registerTokenRequest';
import { TransactionEvent, TransactionEventType } from './transaction-event';
import { Web3State } from './web3-state';
const Web3 = require('web3');
const EthereumTx = require('ethereumjs-tx').Transaction;
const ethereumjs_common = require('ethereumjs-common').default;

@Injectable({ providedIn: 'root' })
export class EthereumService {
  private _appWeb3: any;
  private _appWeb3ManualWebHost: any;
  private account$!: BehaviorSubject<string>;
  private web3State$!: BehaviorSubject<Web3State>;
  private networkId$!: BehaviorSubject<number>;
  constructor(
    private commonService: CommonService,
    private networkRepository: NetworkRepository,
    private ngZone: NgZone
  ) {
    this.account$ = new BehaviorSubject<any>(null);
    this.networkId$ = new BehaviorSubject<number>(0);

    const deviceInfo = commonService.getDeviceInfo();
    let initalState = (deviceInfo.browser == 'Chrome' || deviceInfo.browser == 'Firefox') ? Web3State.NotInstalled : Web3State.BrowserUnsupport;
    if (initalState === Web3State.NotInstalled) {
      initalState = window['ethereum'] ? Web3State.Installed : Web3State.NotInstalled;
    }
    this.web3State$ = new BehaviorSubject<Web3State>(initalState);

  }

  enableMetaMask() {
    if (!window['ethereum']) return undefined;
    Promise.all([
      window['ethereum'].enable(),
      new Web3(window["ethereum"]).eth.net.getId()
    ]).then(([accounts, networkId]) => {
      this.account$.next(accounts[0].toLowerCase());
      this.inferWeb3State(networkId);
      this.networkId$.next(networkId);
    });

    window['ethereum'].on('accountsChanged', (accounts) => {
      this.account$.next(accounts[0].toLowerCase());
    });

    window['ethereum'].on('networkChanged', (networkId) => {
      this.inferWeb3State(networkId);
      this.networkId$.next(networkId);
    });

    return this.account$.asObservable();
  }

  async registerTokens(requests: RegisterTokenRequest[]): Promise<any> {
    if (!window['ethereum']) return Promise.reject(false);
    const appWeb3 = this.appWeb3;

    const registerRequests = requests.map(x => {
      return {
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20', // Initially only supports ERC20, but eventually more!
          options: {
            address: x.address, // The address that the token is at.
            symbol: x.symbol, // A ticker symbol or shorthand, up to 5 chars.
            decimals: x.decimals, // The number of decimals in the token
            image: x.imageUrl, // A string url of the token logo
          },
        },
      };
    })

    return appWeb3.currentProvider.sendAsync(registerRequests);
  }

  async sendTransactionByMethodWithEvent(sender: string, method: any): Promise<Observable<TransactionEvent>> {
    const appWeb3 = this.appWeb3;
    const gasPrice = await appWeb3.eth.getGasPrice();
    const nonce = await appWeb3.eth.getTransactionCount(sender);
    const gasLimit = await method.estimateGas({ from: sender });

    const config = {
      "from": sender,
      "gasPrice": appWeb3.utils.toHex(gasPrice),
      "gasLimit": appWeb3.utils.toHex(gasLimit),
      "value": '0x',
      "nonce": appWeb3.utils.toHex(nonce)
    };

    const subject = <Subject<TransactionEvent>>new Subject();

    method.send(config)
      .on("transactionHash", (hash) => {
        subject.next({
          event: TransactionEventType.transactionHash,
          data: hash
        });
      })
      .on("receipt", (receipt) => {
        subject.next({
          event: TransactionEventType.receipt,
          data: receipt
        });
      })
      .on("confirmation", (confirmationNumber, receipt) => {
        subject.next({
          event: TransactionEventType.confirmation,
          data: {
            confirmationNumber: confirmationNumber,
            receipt: receipt
          }
        });
      })
      .on("error", (error) => {
        subject.next({
          event: TransactionEventType.error,
          data: error.message || error
        });
      });

    return subject.asObservable();
  }

  async sendSignedTransactionByMethodWithEvent(sender: string, reciever: string, method: any, privateKey: string, networkId: number): Promise<any> {
    const appWeb3 = this.appWeb3;
    const gasPrice = await appWeb3.eth.getGasPrice();
    const nonce = await appWeb3.eth.getTransactionCount(sender);
    const gasLimit = await method.estimateGas({ from: sender });
    const encodedABI = method.encodeABI();

    const rawTransaction = {
      gasPrice: appWeb3.utils.toHex(gasPrice),
      gasLimit: appWeb3.utils.toHex(gasLimit),
      data: encodedABI,
      value: '0x00',
      nonce: appWeb3.utils.toHex(nonce),
      to: reciever
    };

    var senderPrivateKeyHex = Buffer.from(privateKey, 'hex');

    const common = ethereumjs_common.forCustomChain('mainnet', {
      name: 'bnb',
      networkId: networkId,
      chainId: networkId
    }, 'petersburg');

    var transaction = new EthereumTx(rawTransaction, { "common": common });
    transaction.sign(senderPrivateKeyHex);

    const serializedTransaction = transaction.serialize();

    return appWeb3.eth.sendSignedTransaction('0x' + serializedTransaction.toString('hex'), (err, hash) => {
      if (err) {
        Promise.reject(err);
        return;
      }

      // Log the tx, you can explore status manually with eth.getTransaction()
      Promise.resolve(hash);
    });
  }

  public get appWeb3() {
    if (this._appWeb3) return this._appWeb3;
    this._appWeb3 = window["ethereum"] ? new Web3(window["ethereum"]) : new Web3(new Web3.providers.HttpProvider(this.networkRepository.selectedNetworkSync.web3Host));
    return this._appWeb3;
  }

  public get appWeb3ManualWebHost() {
    if (this._appWeb3ManualWebHost) return this._appWeb3ManualWebHost;
    this._appWeb3ManualWebHost = new Web3(new Web3.providers.HttpProvider(this.networkRepository.selectedNetworkSync.web3Host));
    return this._appWeb3ManualWebHost;
  }

  public get account(): Observable<string> {
    return this.account$.asObservable();
  }

  public get networkId(): Observable<number> {
    return this.networkId$.asObservable();
  }


  public get web3State(): Observable<Web3State> {
    return this.web3State$.asObservable();
  }

  parseWeiNumber(source: string, weiDecimal: number): number {
    if (!source) return 0;
    const appWeb3 = this.appWeb3;
    return (weiDecimal === 1e18) ? appWeb3.utils.fromWei(source) : (BigInt(source) / BigInt(weiDecimal));
  }

  async getCurrentTimeStamp(): Promise<number> {
    const appWeb3 = this.appWeb3;
    const latestBlock = await appWeb3.eth.getBlockNumber() as number;
    var timestamp = (await appWeb3.eth.getBlock(latestBlock)).timestamp;
    return timestamp;
  }

  private inferWeb3State(networkId: number) {
    const network = this.networkRepository.selectedNetworkSync;
    if (network.networkId == networkId) {
      this.web3State$.next(Web3State.Connected);
      return;
    }
    this.web3State$.next(Web3State.NetworkUnsupport);
  }
}
