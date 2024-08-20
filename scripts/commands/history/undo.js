import { commands } from "commands";
import { historyMap, historyIndexMap } from "main";
import { tellError, getHistory, tellMessage } from "utils";
commands.set('undo', {
    function: undo,
    description: "Undoes an action",
    extDescription: "Undoes an action\ntimes: Number of actions to undo\nplayer: Player to undo actions for (useful for admins)",
    usage: [
        "[times: int] [player: Player]"
    ]
});
function undo(args, player) {
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
        tellError(player, "Nothing to undo");
        return;
    }
    if (historyIndexMap.get(name) == historyMap.get(name).length) {
        tellError(player, "Nothing more to undo");
        return;
    }
    let changes = 0;
    let actions = 0;
    for (let i = 0; i < times; i++) {
        if (historyIndexMap.get(name) == historyMap.get(name).length) {
            break;
        }
        let entry = getHistory(name, historyIndexMap.get(name));
        for (let i = entry.length - 1; i >= 0; i--) {
            player.dimension.getBlock(entry[i].pos).setPermutation(entry[i].pre /*.clone()*/);
            changes++;
        }
        historyIndexMap.set(name, historyIndexMap.get(name) + 1);
        actions++;
    }
    tellMessage(player, `§aUndid ${actions} actions (${changes} blocks)`);
}
