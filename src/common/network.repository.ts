import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { SupportedNetwork } from "./supported-network";

@Injectable({ providedIn: 'root' })
export class NetworkRepository {
    private _networks: SupportedNetwork[] = [];
    private networks$!: BehaviorSubject<SupportedNetwork[]>;

    private _selectedNetwork: SupportedNetwork;
    private selectedNetwork$!: BehaviorSubject<SupportedNetwork>;

    constructor(
    ) {
    }

    public init() {
        if (!this.networks$) {
            this._networks = environment.networks;
            this.networks$ = <BehaviorSubject<SupportedNetwork[]>>new BehaviorSubject(this._networks);
        }
        if (!this.selectedNetwork$) {
            this._selectedNetwork = environment.defaultNetwork;
            this.selectedNetwork$ = <BehaviorSubject<SupportedNetwork>>new BehaviorSubject(this._selectedNetwork);
        }
    }

    public get networks(): Observable<SupportedNetwork[]> {
        if (!this.networks$) {
            this._networks = environment.networks;
            this.networks$ = <BehaviorSubject<SupportedNetwork[]>>new BehaviorSubject(this._networks);
        }
        return this.networks$.asObservable();
    }

    public get networksPromise(): Promise<SupportedNetwork[]> {
        return Promise.resolve(this._networks);
    }

    public get selectedNetwork(): Observable<SupportedNetwork> {
        if (!this.selectedNetwork$) {
            this._selectedNetwork = environment.defaultNetwork;
            this.selectedNetwork$ = <BehaviorSubject<SupportedNetwork>>new BehaviorSubject(this._selectedNetwork);
        }
        return this.selectedNetwork$.asObservable();
    }

    public get selectedNetworkPromise(): Promise<SupportedNetwork> {
        return Promise.resolve(this._selectedNetwork);
    }

    public get selectedNetworkSync(): SupportedNetwork {
        return this._selectedNetwork;
    }
}