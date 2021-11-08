import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { Inject, Injectable, Optional, PLATFORM_ID } from '@angular/core';
import { DeviceDetectorService } from 'ngx-device-detector';

@Injectable({ providedIn: 'root' })
export class CommonService {
    constructor(
        @Inject(PLATFORM_ID) private platformId: Object,
        private deviceService: DeviceDetectorService
    ) {

    }

    loadScript(url: string) {
        const body = <HTMLDivElement>document.body;
        const script = document.createElement('script');
        script.innerHTML = '';
        script.src = url;
        script.async = false;
        script.defer = true;
        body.appendChild(script);
    }

    isPlatformBrowser(): boolean {
        return isPlatformBrowser(this.platformId);
    }

    isPlatformServer(): boolean {
        return isPlatformServer(this.platformId);
    }

    isMobile(): boolean {
        return this.deviceService.isMobile();
    }

    isTablet(): boolean {
        return this.deviceService.isTablet();
    }

    isDesktop(): boolean {
        return this.deviceService.isDesktop();
    }

    getDeviceInfo(): any {
        return this.deviceService.getDeviceInfo();
    }

    localStorageGet(key: string, defaultValue: any) {
        var data = localStorage.getItem(key);
        if (!data) {
            return defaultValue;
        }
        return JSON.parse(data);
    }

    localStorageSet(key: string, value: any) {
        if (!value) {
            return;
        }

        var data = JSON.stringify(value);
        localStorage.setItem(key, data);
    }

    isEmptyObject(obj: any) {
        if (!obj) return true;
        return (obj && (Object.keys(obj).length === 0));
    }

    copy(obj: any) {
        return JSON.parse(JSON.stringify(obj));
    }

    compareArray(array1, array2): boolean {
        // if the other array is a falsy value, return
        if (!array2)
            return false;

        // compare lengths - can save a lot of time 
        if (array1.length != array2.length)
            return false;

        for (var i = 0, l = array1.length; i < l; i++) {
            // Check if we have nested arrays
            if (array1[i] instanceof Array && array2[i] instanceof Array) {
                // recurse into the nested arrays
                if (!array1[i].equals(array2[i]))
                    return false;
            }
            else if (array1[i] != array2[i]) {
                // Warning - two different object instances will never be equal: {x:20} != {x:20}
                return false;
            }
        }
        return true;
    }

    getCurrentUrl(): string {
        if (this.isPlatformBrowser()) {
            return window.location.href;
        } else {
            return "";
        }
    }

    parseDateToTimeStamp(date: Date): number {
        return Math.floor(date.getTime() / 1000);
    }

    parseTimeStampToDate(unixTimestamp: number): Date {
        return  new Date(unixTimestamp * 1000);
    }

    public buildLotteryKey(networkId: number, lotteryAddress: string, lotteryId: number): string {
        return `${networkId}_${lotteryAddress.toLowerCase()}_${lotteryId}`;
    }
    public buildTicketKey(networkId: number, ticketAddress: string, ticketId: number): string {
        return `${networkId}_${ticketAddress.toLowerCase()}_${ticketId}`;
    }
    public buildVendorKey(networkId: number, lotteryManagerAddress: string, lotteryId: number, vendorAddress: string): string {
        return `${networkId}_${lotteryManagerAddress.toLowerCase()}_${lotteryId}_${vendorAddress.toLowerCase()}`;
    }

    copyToClipboard(text) {
        // create hidden text element, if it doesn't already exist
        let targetId = "_hiddenCopyText_";
        // must use a temporary form element for the selection and copy
        var target = document.getElementById(targetId) as any;
        if (!target) {
            target = document.createElement("textarea");
            target.style.position = "absolute";
            target.style.left = "-9999px";
            target.style.top = `${window.pageYOffset}px`;
            target.style.opacity = "0";
            target.id = targetId;
            document.body.appendChild(target);
        }
        target.textContent = text;

        // select the content
        var currentFocus = document.activeElement as any;
        target.focus();
        target.setSelectionRange(0, target.value.length);

        // copy the selection
        var succeed;
        try {
            succeed = document.execCommand("copy");
        } catch (e) {
            succeed = false;
        }
        // restore original focus
        if (currentFocus && typeof currentFocus.focus === "function") {
            currentFocus.focus();
        }

        document.body.removeChild(target);

        return succeed;
    }
}
