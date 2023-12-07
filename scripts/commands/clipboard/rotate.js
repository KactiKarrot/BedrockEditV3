import { commands } from "commands";
import { clipMap, relPosMap } from "main";
import { tellError, getClipSize, rotatePerm, tellMessage } from "utils";
commands.set('rotate', {
    function: rotate,
    description: "Rotates the clipboard",
    extDescription: "Rotates the clipboard\nangle: Angle to rotate clipboard (must be 90, 180, or 270)",
    usage: [
        "<rotationAngle: angle>"
    ]
});
function rotate(args, player) {
    if (args.length < 1) {
        tellError(player, 'No angle given');
        return;
    }
    let angle = 0;
    switch (args[0]) {
        case '90': {
            angle = 90;
            break;
        }
        case '180': {
            angle = 180;
            break;
        }
        case '270': {
            angle = 270;
            break;
        }
        default: {
            tellError(player, `Invalid angle: '${args[0]}'`);
            return;
            break;
        }
    }
    if (!clipMap.has(player.name)) {
        tellError(player, `Nothing in clipboard`);
        return;
    }
    for (let a = 0; a < angle / 90; a++) {
        let oldClip = clipMap.get(player.name);
        let clipSize = getClipSize(player.name);
        clipSize = {
            x: clipSize.z,
            y: clipSize.y,
            z: clipSize.x
        };
        let newClip = Array(clipSize.x).fill(null).map(() => Array(clipSize.y).fill(null).map(() => Array(clipSize.z).fill(null)));
        for (let i = 0; i < clipSize.z; i++) {
            for (let j = 0; j < clipSize.y; j++) {
                for (let k = 0; k < clipSize.x; k++) {
                    if (oldClip[i][j][clipSize.x - 1 - k] != undefined) {
                        newClip[k][j][i] = oldClip[0 + i][j][clipSize.x - 1 - k].clone();
                        newClip[k][j][i] = rotatePerm(newClip[k][j][i]);
                    }
                }
            }
        }
        // relPosMap.set(player.name, subVector3(minVector3(pos1Map.get(player.name), pos2Map.get(player.name)), floorVector3(player.location)));
        relPosMap.set(player.name, {
            x: -(relPosMap.get(player.name).z + clipSize.x - 1),
            y: relPosMap.get(player.name).y,
            z: relPosMap.get(player.name).x
        });
        clipMap.set(player.name, newClip);
    }
    tellMessage(player, `§aRotated clipboard ${angle} degrees`);
}
