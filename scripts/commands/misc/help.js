import { commands } from "commands";
import { PREFIX } from "main";
import { getByAlias, tellError, tellMessage } from "utils";
export function register() {
    commands.set('help', {
        alias: "?",
        function: help,
        description: "Lists all commands and what they do",
        extDescription: "Lists all commands and what they do",
        usage: [
            "",
            "[page: int]",
            "[command: CommandName]"
        ]
    });
}
function help(args, player) {
    if (args.length > 0 && isNaN(parseInt(args[0]))) {
        let cmd = args[0];
        if (!commands.has(cmd)) {
            cmd = getByAlias(cmd);
            if (cmd == undefined) {
                tellError(player, `Command '${args[0]}' not found`);
                return;
            }
        }
        let cData = commands.get(cmd);
        let msg = `§e${cmd}`;
        if (cData.alias != undefined) {
            msg += ` (also ${cData.alias})`;
        }
        msg += ':';
        msg += `\n§e${cData.extDescription}\n§rUsage`;
        cData.usage.forEach((e) => {
            msg += `\n- ${PREFIX}${cmd} ${e}`;
        });
        tellMessage(player, msg);
        return;
    }
    let startPage = 0;
    if (args.length > 0 && !isNaN(parseInt(args[0]))) {
        startPage = parseInt(args[0]) - 1;
        if (startPage >= Math.ceil(commands.size / 7)) {
            startPage = Math.ceil(commands.size / 7) - 1;
        }
    }
    let msg = `§2--- Showing help page ${startPage + 1} of ${Math.ceil(commands.size / 7)} (${PREFIX}help <page>) ---`;
    let i = 0;
    for (let [name, c] of commands.entries()) {
        msg += `\n§r- ${PREFIX}${name}: §b${c.description}`;
        if (i >= startPage * 7 + 6) {
            break;
        }
        i++;
    }
    tellMessage(player, msg);
}
