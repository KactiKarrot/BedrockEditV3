import * as help from './help';
import * as version from './version';
import * as welcome from './welcome';
import * as wand from './wand';
import * as toggleeditwand from './toggleeditwand';
import * as toggleoutline from './toggleoutline';
export function register() {
    help.register();
    version.register();
    welcome.register();
    wand.register();
    toggleeditwand.register();
    toggleoutline.register();
}
