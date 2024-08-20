import { commands } from "commands";
import { historyMap, historyIndexMap } from "main";
import { tellError, getHistory, tellMessage } from "utils";
commands.set('redo', {
    function: redo,
    description: "Redoes an action",
    extDescription: "Redoes an action\ntimes: Number of actions to redo\nplayer: Player to redo actions for (useful for admins)",
    usage: [
        "[times: int] [player: Player]"
    ]
});
function redo(args, player) {
    let name = player.name;
    let times = 1;
    if (args.length >= 1 && isNaN(parseInt(args[0])) && args[0] != '') {
        times = parseInt(args[0]);
    }
    if (args.length >= 1 && isNaN(parseInt(args[0])) && args[0] != '') {
        tellError(player, `Invalid number: ${args[0]}`);
    }
    if (args.length >= 2 && args[1] != '') {
        name = args[1];
    }
    if (historyMap.get(name) == undefined || historyMap.get(name).length <= 0) {
        tellError(player, "Nothing to redo");
        return;
    }
    if (historyIndexMap.get(name) == 0) {
        tellError(player, "Nothing more to redo");
        return;
    }
    let changes = 0;
    let actions = 0;
    for (let i = 0; i < times; i++) {
        historyIndexMap.set(name, historyIndexMap.get(name) - 1);
        let entry = getHistory(name, historyIndexMap.get(name));
        for (let i = 0; i < entry.length; i++) {
            player.dimension.getBlock(entry[i].pos).setPermutation(entry[i].post /*.clone()*/);
            changes++;
        }
        actions++;
    }
    tellMessage(player, `§aRedid ${actions} actions (${changes} blocks)`);
}
