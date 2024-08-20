import { BlockPermutation, Player } from "@minecraft/server";
import { commands } from "commands";
import { clipMap, relPosMap } from "main";
import { getClipSize, rotatePerm, tellError, tellMessage } from "utils";

commands.set('mirror', {
    alias: "flip",
    function: mirror,
    description: "Mirrors the clipboard",
    extDescription: "Mirrors the clipboard\naxis: Axis to mirror clipboard over",
    usage: [
        "<mirrorAxis: x | z>"
    ]
})

function mirror(args, player: Player) {
    if (args.length < 1) {
        tellError(player, 'No axis given');
        return;
    }
    let axis = args[0].toLowerCase();
    if (axis != 'x' && axis != 'z') {
        tellError(player, `Invalid axis: '${args[0]}'`)
        return;
    }
    if (!clipMap.has(player.name)) {
        tellError(player, `Nothing in clipboard`);
        return;
    }
    let oldClip = clipMap.get(player.name);
    let clipSize = getClipSize(player.name);
    let newClip: Array<Array<Array<BlockPermutation>>> = Array(clipSize.x).fill(null).map(
        () => Array(clipSize.y).fill(null).map(
            () => Array(clipSize.z).fill(null)
        )
    )
    for (let i = 0; i < clipSize.x; i++) {
        for (let j = 0; j < clipSize.y; j++) {
            for (let k = 0; k < clipSize.z; k++) {
                if ((axis == 'x' && oldClip[clipSize.x - 1 - i][j][k] != undefined) || oldClip[i][j][clipSize.z - 1 - k] != undefined) {
                    if (axis == 'x') {
                        newClip[i][j][k] = oldClip[clipSize.x - 1 - i][j][k]/*.clone()*/;
                    } else {
                        newClip[i][j][k] = oldClip[i][j][clipSize.z - 1 - k]/*.clone()*/;
                    }
                    
                    //Doesnt work to everything (stairs)
                    newClip[i][j][k] = rotatePerm(newClip[i][j][k]);
                    newClip[i][j][k] = rotatePerm(newClip[i][j][k]);
                }
            }
        }
    }

    if (axis == 'x') {
        relPosMap.set(player.name, {
            x: relPosMap.get(player.name).x * -1 - clipSize.x + 1,
            y: relPosMap.get(player.name).y,
            z: relPosMap.get(player.name).z
        });
    } else {
        relPosMap.set(player.name, {
            x: relPosMap.get(player.name).x,
            y: relPosMap.get(player.name).y,
            z: relPosMap.get(player.name).z * -1 - clipSize.z + 1
        });
    }
    clipMap.set(player.name, newClip);
    tellMessage(player, `§aMirrored clipboard over the ${axis} axis`);
}