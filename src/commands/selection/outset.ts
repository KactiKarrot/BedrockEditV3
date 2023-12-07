import { Player } from "@minecraft/server";
import { commands } from "commands";
import { pos1Map, pos2Map } from "main";
import { tellError, tellMessage } from "utils";

commands.set('outset', {
    function: outset,
    description: "Expands the selection in all directions",
    extDescription: "Expands the selection in all directions\namount: Amount to outset selection (defaults to 1)\n-h: Only outset horizontally\n-v: Only outset vertically",
    usage: [
        "[amount: int] [-hv]"
    ]
})

function outset(args: string[], player: Player) {
    if (!pos1Map.has(player.name) || pos1Map.get(player.name) == undefined) {
        tellError(player, "Position 1 not set!");
        return;
    }
    if (!pos2Map.has(player.name) || pos2Map.get(player.name) == undefined) {
        tellError(player, "Position 2 not set!");
        return;
    }
    let amount = 1
    if (args.length >= 1) {
        if (Number.isNaN(parseInt(args[0]))) {
            tellError(player, `Invalid amount: '${args[0]}'`)
            return
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
    let p1 = pos1Map.get(player.name);
    let p2 = pos2Map.get(player.name);
    for (let i = 0; i < amount; i++) {
        if (h) {
            if (pos1Map.get(player.name).x >= pos2Map.get(player.name).x) {
                p1.x++;
                p2.x--;
            } else if (pos1Map.get(player.name).x < pos2Map.get(player.name).x) {
                p1.x--;
                p2.x++;
            }
            if (pos1Map.get(player.name).z >= pos2Map.get(player.name).z) {
                p1.z++;
                p2.z--;
            } else if (pos1Map.get(player.name).z < pos2Map.get(player.name).z) {
                p1.z--;
                p2.z++;
            }
        }
        if (v) {
            if (pos1Map.get(player.name).y >= pos2Map.get(player.name).y) {
                p1.y++;
                p2.y--;
            } else if (pos1Map.get(player.name).y < pos2Map.get(player.name).y) {
                p1.y--;
                p2.y++;
            }
        }
    }
    pos1Map.set(player.name, p1);
    pos2Map.set(player.name, p2);
    tellMessage(player, `§aSelection outset ${amount} blocks`);
}