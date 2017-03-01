declare let window:any;

export class WindowRef {
    constructor() {}

    static getNativeWindow() {
        return window;
    }
}