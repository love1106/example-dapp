import { APP_INITIALIZER, Injector, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { environment } from '../environments/environment';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { SupportedNetwork } from 'src/common/supported-network';
import { AppInjector } from 'src/common/AppInjector';
import { FormsModule } from '@angular/forms';

export function StartupServiceFactory(http: HttpClient) {
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  return () => {
    return getServerConfigs(http);
  };
}

function getServerConfigs(http: HttpClient): any {
  return Promise.resolve<SupportedNetwork[]>([
    {
      networkId: 97,
      name: "BSC Test-Net",
      networkSite: "https://testnet.bscscan.com/",
      web3Host: "https://data-seed-prebsc-1-s1.binance.org:8545/",
      isTest: true
    },
  ]).then(networks => {
    environment.networks = networks || [];
    environment.defaultNetwork = environment.networks.find(x => x.networkId == environment.defaultNetworkId);
  });
}

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: StartupServiceFactory,
      deps: [HttpClient],
      multi: true
    },
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(injector: Injector) {
    AppInjector.setInjector(injector);
  }
}
