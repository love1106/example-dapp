import { Directive, NgZone, OnDestroy } from '@angular/core';
import { combineLatest } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BaseComponent } from './base.component';
import { EthereumService } from './ethereum.service';
import { Web3State } from './web3-state';

@Directive()
export abstract class BaseWeb3Component extends BaseComponent {
    public ethereumAccount: string;
    public web3State: Web3State;
    public networkId: number = 0;
    protected ethereumService: EthereumService;
    protected ngZone: NgZone;
    deviceInfo: any;

    constructor(
    ) {
        super();
        this.deviceInfo = this.commonService.getDeviceInfo();
        this.ethereumService = this.injector.get(EthereumService);
        this.ngZone = this.injector.get(NgZone);
    }

    public get Web3State() {
        return Web3State;
    }

    ngOnInit(): void {
        this.loadState();
        this.loadEtherumAccount();
    }

    loadState(): void {
        this.ethereumService.web3State
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(state => {
                this.ngZone.run(() => {
                    this.web3State = state;
                });
            });
    }

    loadEtherumAccount(): void {
        combineLatest(
            [
                this.ethereumService.account,
                this.ethereumService.networkId
            ])
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(([account, networkId]) => {
                this.ngZone.run(() => {
                    if (!account || !networkId) return;
                    this.ethereumAccount = account;
                    this.networkId = networkId;
                });
            });
    }

    installMetamask(): void {
        const metamaskExtension = (this.deviceInfo.browser === 'Chrome') ? 'https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn?hl=en' : 'https://addons.mozilla.org/en-US/firefox/addon/ether-metamask/';
        window.open(metamaskExtension, '_blank').focus();
    }

    connectToWallet(): void {
        this.ethereumService.enableMetaMask();
    }
}
