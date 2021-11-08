import { Directive, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AppInjector } from './AppInjector';
import { CommonService } from './common.service';

@Directive()
export abstract class BaseComponent implements OnDestroy {
    protected injector;
    public commonService: CommonService;
    public isPlatformBrowser: boolean;

    constructor() {
        this.injector = AppInjector.getInjector();
        this.commonService = this.injector.get(CommonService);
        this.isPlatformBrowser = this.commonService.isPlatformBrowser();
    }

    ngUnsubscribe = new Subject<void>();

    ngOnDestroy(): void {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }
    
    public get environment() {
        return environment;
    }
}
