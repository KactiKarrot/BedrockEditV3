import { commands } from "commands";
import { selMap } from "selectionUtils";
import { tellError, tellMessage } from "utils";
commands.set('outset', {
    function: outset,
    description: "Expands the selection in all directions",
    extDescription: "Expands the selection in all directions\namount: Amount to outset selection (defaults to 1)\n-h: Only outset horizontally\n-v: Only outset vertically",
    usage: [
        "[amount: int] [-hv]"
    ]
});
function outset(args, player) {
    if ((selMap.get(player.name)?.from == undefined)) {
        tellError(player, "Position 1 not set!");
        return;
    }
    if ((selMap.get(player.name)?.to == undefined)) {
        tellError(player, "Position 2 not set!");
        return;
    }
    let amount = 1;
    if (args.length >= 1) {
        if (Number.isNaN(parseInt(args[0]))) {
            tellError(player, `Invalid amount: '${args[0]}'`);
            return;
        }
        amount = parseInt(args[0]);
    }
    let h = true;
    let v = true;
    if (args.length >= 2 && args[1] != '') {
        h = false;
        v = false;
        if (args[1].indexOf('h') >= 0) {
            h = true;
        }
        if (args[1].indexOf('v') >= 0) {
            v = true;
        }
    }
    for (let i = 0; i < amount; i++) {
        if (h) {
            if (selMap.get(player.name).from.x >= selMap.get(player.name).to.x) {
                selMap.get(player.name).from.x++;
                selMap.get(player.name).to.x--;
            }
            else if (selMap.get(player.name).from.x < selMap.get(player.name).to.x) {
                selMap.get(player.name).from.x--;
                selMap.get(player.name).to.x++;
            }
            if (selMap.get(player.name).from.z >= selMap.get(player.name).to.z) {
                selMap.get(player.name).from.z++;
                selMap.get(player.name).to.z--;
            }
            else if (selMap.get(player.name).from.z < selMap.get(player.name).to.z) {
                selMap.get(player.name).from.z--;
                selMap.get(player.name).to.z++;
            }
        }
        if (v) {
            if (selMap.get(player.name).from.y >= selMap.get(player.name).to.y) {
                selMap.get(player.name).from.y++;
                selMap.get(player.name).to.y--;
            }
            else if (selMap.get(player.name).from.y < selMap.get(player.name).to.y) {
                selMap.get(player.name).from.y--;
                selMap.get(player.name).to.y++;
            }
        }
    }
    tellMessage(player, `§aSelection outset ${amount} blocks`);
}
