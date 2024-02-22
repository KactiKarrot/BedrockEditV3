import { commands } from "commands";
import { selMap } from "selectionUtils";
import { tellError, tellMessage } from "utils";
commands.set('swap', {
    function: swap,
    description: "Swaps positions 1 and 2",
    extDescription: "Swaps positions 1 and 2",
    usage: [
        ""
    ]
});
function swap(args, player) {
    if ((selMap.get(player.name)?.from == undefined)) {
        tellError(player, "Position 1 not set!");
        return;
    }
    if ((selMap.get(player.name)?.to == undefined)) {
        tellError(player, "Position 2 not set!");
        return;
    }
    let tmp = selMap.get(player.name).from;
    selMap.get(player.name).to = selMap.get(player.name).from;
    selMap.get(player.name).from = tmp;
    tellMessage(player, "§aSwapped positions 1 and 2");
}
