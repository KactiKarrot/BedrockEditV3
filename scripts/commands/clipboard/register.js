import * as copy from "./copy";
import * as cut from "./cut";
import * as paste from "./paste";
import * as rotate from "./rotate";
import * as mirror from "./mirror";
export function register() {
    copy.register();
    cut.register();
    paste.register();
    rotate.register();
    mirror.register();
}
