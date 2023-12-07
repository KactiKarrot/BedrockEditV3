import { commands } from "commands";
import { historyMap, historyIndexMap } from "main";
import { tellMessage } from "utils";
commands.set('clearhistory', {
    alias: "clear",
    function: clearHistory,
    description: "Clears the players edit history",
    extDescription: "Clears the players edit history",
    usage: [
        ""
    ]
});
function clearHistory(args, player) {
    let name = player.name;
    if (args.length >= 1 && args[0] != '') {
        name = args[0];
    }
    historyMap.delete(name);
    historyIndexMap.delete(name);
    tellMessage(player, `§aEdit history cleared`);
}
