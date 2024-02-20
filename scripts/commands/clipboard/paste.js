import { system } from "@minecraft/server";
import { commands } from "commands";
import { clipMap, relPosMap } from "main";
import { selMap } from "selectionUtils";
import { addHistoryEntry, addVector3, floorVector3, getClipAt, getClipSize, setBlockAt, subVector3, tellError, tellMessage } from "utils";
commands.set('paste', {
    function: paste,
    description: "Pastes a region from the player's clipboard",
    extDescription: "Pastes a region from the player's clipboard\n-a: Doesn't paste air blocks\n-p: Pastes starting with the lowest coordinate at Position 1",
    usage: [
        "[-ap]"
    ]
});
async function paste(args, player) {
    if (!clipMap.has(player.name)) {
        tellError(player, `Nothing in clipboard`);
        return;
    }
    if ((args.length > 0 && (args[0] == '-ap' || args[0] == '-p'))) {
        if (!selMap.has(player.name) || selMap.get(player.name) == undefined || selMap.get(player.name).from == undefined) {
            tellError(player, "Position 1 not set!");
            return;
        }
        relPosMap.set(player.name, subVector3(selMap.get(player.name).from, floorVector3(player.location)));
    }
    tellMessage(player, `§aPasting...`);
    let clipSize = getClipSize(player.name);
    // Creates new entry in history map
    addHistoryEntry(player.name);
    let playerPos = floorVector3(player.location);
    let count = 0;
    function* pasteGen() {
        for (let x = 0; x < clipSize.x; x++) {
            for (let y = 0; y < clipSize.y; y++) {
                for (let z = 0; z < clipSize.z; z++) {
                    count++;
                    let pos = addVector3(addVector3(relPosMap.get(player.name), playerPos), { x: x, y: y, z: z });
                    // Adds current world position, blockstate before paste, and blockstate after paste to history map entry, can muse pre for undo, post for redo
                    if ((args != "-a" || !(getClipAt(player.name, { x: x, y: y, z: z }).type.id == 'minecraft:air')) && getClipAt(player.name, { x: x, y: y, z: z }) != undefined) {
                        setBlockAt(player, pos, getClipAt(player.name, { x: x, y: y, z: z }).clone());
                    }
                    yield;
                }
            }
        }
        tellMessage(player, `§aPasted ${count} blocks from clipboard`);
    }
    system.runJob(pasteGen());
}
