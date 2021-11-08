import { Component } from '@angular/core';
import { combineLatest } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BaseWeb3Component } from 'src/common/base-web3.component';
import { Erc20Service } from 'src/common/erc20.service';
import { NetworkRepository } from 'src/common/network.repository';
import { TransactionEvent, TransactionEventType } from 'src/common/transaction-event';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent extends BaseWeb3Component {

  tokenAddress: string = '0xed45532F78ee65dFaCEA9eC2447B81c007181c61';
  balance: number = 0;
  amount: number = 1;
  reciever: string = '0x17FA5ffb5de3397dc1Fd3683CfcFc74Bc23e8c8E';
  processing: boolean = false;

  constructor(
    private networkRepository: NetworkRepository,
    private erc20Service: Erc20Service
  ) {
    super();
    this.networkRepository.init();
  }

  ngOnInit() {
    super.ngOnInit();
    this.connectWallet();
  }

  loadEtherumAccount(): void {
    combineLatest(
      [
        this.ethereumService.account,
        this.ethereumService.networkId,
      ])
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(([account, networkId]) => {
        this.ngZone.run(async () => {
          if (!account || !networkId) return;

          this.ethereumAccount = account;

          this.balance = await this.erc20Service.balanceOf(this.tokenAddress, account);
        });
      });
  }


  connectWallet() {
    this.ethereumService.enableMetaMask();
  }

  async sendToken() {
    if (!this.amount || this.amount < 0) {
      alert('Amount must be uint and > 0');
      return;
    }

    if (!this.reciever) {
      alert('Reciever is invalid');
      return;
    }

    this.processing = true;
    const obser = await this.erc20Service.transfer(this.tokenAddress, this.ethereumAccount, this.reciever, this.amount);

    obser.pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((event: TransactionEvent) => {
        this.ngZone.run(() => {
          if (event.event === TransactionEventType.error) {
            this.processing = false;
            return;
          }

          if (event.event === TransactionEventType.transactionHash) {
            return;
          }

          if (
            event.event === TransactionEventType.confirmation
            && event.data.confirmationNumber === 1
            && event.data.receipt) {
            console.log(event);
            const to = event.data.receipt.events?.Transfer?.returnValues?.to;

            this.processing = false;

            this.erc20Service.balanceOf(this.tokenAddress, this.ethereumAccount).then(response => {
              this.balance = response;
            });
            return;
          }
        });
      });
  }
}
