import { world, system, ItemStack } from "@minecraft/server";
import { commands } from "commands";
import { addVector3, compareVector3, getByAlias, tellError } from "utils";
import * as tool from "./tool";
import "commands/misc/register";
import "commands/history/register";
import "commands/selection/register";
import "commands/selection/advanced/register";
import "commands/region/register";
import "commands/clipboard/register";
import "commands/shapes/register";
import { compSelMap, selMap } from "selectionUtils";
export const PREFIX = "./";
export const VERSION = "3.0.1-beta1";
export let relPosMap = new Map();
export let clipMap = new Map(); // <playerName, x<y<z<data>>>>
export let showParticles = false;
export let historyIndexMap = new Map();
export let historyMap = new Map();
// export let scoreboard: ScoreboardObjective;
export let currentWand = new ItemStack('minecraft:wooden_axe', 1);
export const WAND_NAME = '§bBedrockEdit Wand';
export const WAND_LORE = ['Sets Position 1 and Position 2 without commands', "Press 'Attack/Destroy' to set Position 1", "Press 'Use' to set Position 2"];
export let wandEnabled = true;
export let toolEnabled = true;
export let welcomeMessage = true;
export let historyEnabled = true;
export let changeLimit = -1;
// ADD BOOLEAN OPERATIONS (AND) (Minecraft Cad)
function parseArgs(s) {
    let split = s.split(' ');
    split.forEach((e, i) => {
        if (e.startsWith('"')) {
            let x;
            for (let j = i; j < split.length; j++) {
                if (split[j].endsWith('"')) {
                    x = j;
                    break;
                }
            }
            if (x == undefined) {
                return { failed: true, result: `Unclosed string at ${e}` };
            }
            else {
                split.splice(i, x - i + 1, split.slice(i, x + 1).join(' ').slice(1, -1));
            }
        }
    });
    return { failed: false, result: split };
}
system.beforeEvents.watchdogTerminate.subscribe((event) => {
    event.cancel = true;
});
// Add history enabled dynamic property
world.afterEvents.worldInitialize.subscribe(() => {
    // scoreboard = world.scoreboard.getObjective("_beData")
    // if (scoreboard == null || scoreboard == undefined) {
    //     scoreboard = world.scoreboard.addObjective("_beData", "_beData");
    //     scoreboard.setScore("wand.minecraft:wooden_axe", 0);
    // }
    if (world.getDynamicProperty('wand') == undefined) {
        world.setDynamicProperty('wand', 'minecraft:wooden_axe');
    }
    setWand();
    if (world.getDynamicProperty('welcomeMsg') == undefined) {
        world.setDynamicProperty('welcomeMsg', true);
    }
    welcomeMessage = world.getDynamicProperty('welcomeMsg');
    if (world.getDynamicProperty('wandEnabled') == undefined) {
        world.setDynamicProperty('wandEnabled', true);
    }
    wandEnabled = world.getDynamicProperty('wandEnabled');
    if (world.getDynamicProperty('showParticles') == undefined) {
        world.setDynamicProperty('showParticles', false);
    }
    showParticles = world.getDynamicProperty('showParticles');
    if (world.getDynamicProperty('historyEnabled') == undefined) {
        world.setDynamicProperty('historyEnabled', false);
    }
    historyEnabled = world.getDynamicProperty('historyEnabled');
    // if (scoreboard.hasParticipant('welcomeMsg')) {
    //     welcomeMessage = false;
    // }
});
export function setWand() {
    // scoreboard.getParticipants().forEach((e) => {
    //     if (e.displayName.substring(0, 5) == "wand.") {
    //         currentWand = new ItemStack(e.displayName.substring(5));
    //         currentWand.nameTag = WAND_NAME;
    //         currentWand.setLore(WAND_LORE);
    //     }
    // })
    currentWand = new ItemStack(world.getDynamicProperty('wand'));
    currentWand.nameTag = WAND_NAME;
    currentWand.setLore(WAND_LORE);
}
export function setWelcome() {
    welcomeMessage = !welcomeMessage;
    world.setDynamicProperty('welcomeMsg', welcomeMessage);
    // if (welcomeMessage && scoreboard.hasParticipant('welcomeMsg')) {
    //     scoreboard.removeParticipant('welcomeMsg')
    // } else if (!welcomeMessage) {
    //     scoreboard.setScore('welcomeMsg', 0)
    // }
}
export function setWandEnabled() {
    wandEnabled = !wandEnabled;
    world.setDynamicProperty('wandEnabled', wandEnabled);
}
export function setHistoryEnabled() {
    historyEnabled = !historyEnabled;
    world.setDynamicProperty('historyEnabled', historyEnabled);
}
export function setShowParticles() {
    showParticles = !showParticles;
    world.setDynamicProperty('showParticles', showParticles);
}
system.runInterval(() => {
    if (toolEnabled) {
        tool.tick();
    }
});
// Temporary until fix particles for new selection mode
system.runInterval(() => {
    if (!showParticles) {
        return;
    }
    world.getAllPlayers().forEach(p => {
        if (compSelMap.has(p.name) || !selMap.has(p.name) || (selMap.get(p.name).from == undefined || selMap.get(p.name).to == undefined)) {
            return;
        }
        let sel = selMap.get(p.name);
        let min = sel.getMin();
        let diff = sel.getSpan();
        for (let x = 0; x < diff.x; x++) {
            for (let y = 0; y < diff.y; y++) {
                for (let z = 0; z < diff.z; z++) {
                    if (compareVector3(selMap.get(p.name).from, addVector3({ x: x, y: y, z: z }, min)) || compareVector3(selMap.get(p.name).to, addVector3({ x: x, y: y, z: z }, min)) == true) {
                        p.runCommand(`particle be:outline-purple ${min.x + x + 1}.0 ${min.y + y}.0 ${min.z + z + 1}.0`);
                        p.runCommand(`particle be:outline-purple ${min.x + x + 1}.0 ${min.y + y}.0 ${min.z + z}.0`);
                        p.runCommand(`particle be:outline-purple ${min.x + x + 1}.0 ${min.y + y + 1}.0 ${min.z + z + 1}.0`);
                        p.runCommand(`particle be:outline-purple ${min.x + x + 1}.0 ${min.y + y + 1}.0 ${min.z + z}.0`);
                        p.runCommand(`particle be:outline-purple ${min.x + x}.0 ${min.y + y}.0 ${min.z + z + 1}.0`);
                        p.runCommand(`particle be:outline-purple ${min.x + x}.0 ${min.y + y}.0 ${min.z + z}.0`);
                        p.runCommand(`particle be:outline-purple ${min.x + x}.0 ${min.y + y + 1}.0 ${min.z + z + 1}.0`);
                        p.runCommand(`particle be:outline-purple ${min.x + x}.0 ${min.y + y + 1}.0 ${min.z + z}.0`);
                    }
                    else if (((x == 0 || x == diff.x - 1) && (y == 0 || y == diff.y - 1)) ||
                        ((x == 0 || x == diff.x - 1) && (z == 0 || z == diff.z - 1)) ||
                        ((z == 0 || z == diff.z - 1) && (y == 0 || y == diff.y - 1))) {
                        p.runCommand(`particle be:outline-red ${min.x + x + 0.5} ${min.y + y + 0.5} ${min.z + z + 0.0}.0`);
                        p.runCommand(`particle be:outline-red ${min.x + x + 0.5} ${min.y + y + 0.5} ${min.z + z + 1.0}.0`);
                        p.runCommand(`particle be:outline-red ${min.x + x + 0.5} ${min.y + y + 0.0}.0 ${min.z + z + 0.5}`);
                        p.runCommand(`particle be:outline-red ${min.x + x + 0.5} ${min.y + y + 1.0}.0 ${min.z + z + 0.5}`);
                        p.runCommand(`particle be:outline-red ${min.x + x + 0.0}.0 ${min.y + y + 0.5} ${min.z + z + 0.5}`);
                        p.runCommand(`particle be:outline-red ${min.x + x + 1.0}.0 ${min.y + y + 0.5} ${min.z + z + 0.5}`);
                        // p.runCommand(`particle be:outline-red ${min.x + x + 0.0}.0 ${min.y + y + 0.0} ${min.z + z + 0.0}`)
                    }
                }
            }
        }
    });
}, 15);
// system.runInterval(() => {
//     if (!showParticles) {
//         return;
//     }
//     world.getAllPlayers().forEach((p) => {
//         if (!pos1Map.has(p.name) || !pos2Map.has(p.name)) {
//             return;
//         }
//         let min = minVector3(pos1Map.get(p.name), pos2Map.get(p.name));
//         let diff = addVector3({x: 1, y: 1, z: 1}, diffVector3(pos1Map.get(p.name), pos2Map.get(p.name)))
//         for (let x = 0; x < diff.x; x++) {
//             for (let y = 0; y < diff.y; y++) {
//                 for (let z = 0; z < diff.z; z++) {
//                     if (compareVector3(pos1Map.get(p.name), addVector3({x: x, y: y, z: z}, min)) || compareVector3(pos2Map.get(p.name), addVector3({x: x, y: y, z: z}, min)).valueOf() == true) {
//                         p.runCommand(`particle be:outline-purple ${min.x + x + 1}.0 ${min.y + y}.0 ${min.z + z + 1}.0`)
//                         p.runCommand(`particle be:outline-purple ${min.x + x + 1}.0 ${min.y + y}.0 ${min.z + z}.0`)
//                         p.runCommand(`particle be:outline-purple ${min.x + x + 1}.0 ${min.y + y + 1}.0 ${min.z + z + 1}.0`)
//                         p.runCommand(`particle be:outline-purple ${min.x + x + 1}.0 ${min.y + y + 1}.0 ${min.z + z}.0`)
//                         p.runCommand(`particle be:outline-purple ${min.x + x}.0 ${min.y + y}.0 ${min.z + z + 1}.0`)
//                         p.runCommand(`particle be:outline-purple ${min.x + x}.0 ${min.y + y}.0 ${min.z + z}.0`)
//                         p.runCommand(`particle be:outline-purple ${min.x + x}.0 ${min.y + y+ 1}.0 ${min.z + z + 1}.0`)
//                         p.runCommand(`particle be:outline-purple ${min.x + x}.0 ${min.y + y + 1}.0 ${min.z + z}.0`)
//                     } else if (
//                         ((x == 0 || x == diff.x - 1) && (y == 0 || y == diff.y - 1)) ||
//                         ((x == 0 || x == diff.x - 1) && (z == 0 || z == diff.z - 1)) || 
//                         ((z == 0 || z == diff.z - 1) && (y == 0 || y == diff.y - 1))
//                     ) {
//                         p.runCommand(`particle be:outline-red ${min.x + x + 0.5} ${min.y + y + 0.5} ${min.z + z + 0.0}.0`)
//                         p.runCommand(`particle be:outline-red ${min.x + x + 0.5} ${min.y + y + 0.5} ${min.z + z + 1.0}.0`)
//                         p.runCommand(`particle be:outline-red ${min.x + x + 0.5} ${min.y + y + 0.0}.0 ${min.z + z + 0.5}`)
//                         p.runCommand(`particle be:outline-red ${min.x + x + 0.5} ${min.y + y + 1.0}.0 ${min.z + z + 0.5}`)
//                         p.runCommand(`particle be:outline-red ${min.x + x + 0.0}.0 ${min.y + y + 0.5} ${min.z + z + 0.5}`)
//                         p.runCommand(`particle be:outline-red ${min.x + x + 1.0}.0 ${min.y + y + 0.5} ${min.z + z + 0.5}`)
//                         // p.runCommand(`particle be:outline-red ${min.x + x + 0.0}.0 ${min.y + y + 0.0} ${min.z + z + 0.0}`)
//                     }
//                 }
//             }
//         }
//     })
// }, 15)
world.beforeEvents.chatSend.subscribe((data) => {
    const player = data.sender;
    const msg = data.message;
    if (msg.substring(0, PREFIX.length) != PREFIX || !player.hasTag("BEUser")) {
        return;
    }
    data.cancel = true;
    system.run(() => {
        let cmd = msg.substring(PREFIX.length).split(" ")[0];
        // const args = msg.substring(PREFIX.length).split(" ").slice(1);
        const args = parseArgs(msg.substring(PREFIX.length));
        let found = false;
        if (args.failed == true) {
            tellError(player, args.result);
            return;
        }
        if (!commands.has(cmd)) {
            cmd = getByAlias(cmd);
            if (cmd == undefined) {
                tellError(player, `Command '${msg.substring(PREFIX.length).split(" ")[0]}' not found`);
                return;
            }
        }
        commands.get(cmd).function(args.result.slice(1), player);
    });
});
system.afterEvents.scriptEventReceive.subscribe((data) => {
    commands.forEach((c) => {
        if (data.sourceType != 'Entity' || data.sourceEntity.typeId != 'minecraft:player') {
            return;
        }
        let player = data.sourceEntity;
        const args = parseArgs(data.message.substring(PREFIX.length));
        if (args.failed == true) {
            tellError(player, args.result);
            return;
        }
        let cmd = data.id.substring(3);
        if (!commands.has(cmd)) {
            cmd = getByAlias(cmd);
            if (cmd == undefined) {
                tellError(player, `Command '${data.id.substring(3)}' not found`);
                return;
            }
        }
        commands.get(cmd).function(args.result.slice(1), player);
    });
}, { namespaces: ['be'] });
world.beforeEvents.playerBreakBlock.subscribe((data) => {
    if (data.player.hasTag("BEUser") && data.player.getComponent("minecraft:inventory").container.getItem(data.player.selectedSlotIndex)?.typeId == currentWand.typeId) {
        system.run(() => { commands.get('pos1').function(['facing'], data.player); });
        data.cancel = true;
    }
});
world.afterEvents.entityHitBlock.subscribe((data) => {
    if (data.damagingEntity.typeId == 'minecraft:player') {
        let player = data.damagingEntity;
        if (player.hasTag("BEUser") && player.getComponent("minecraft:inventory").container.getItem(player.selectedSlotIndex)?.typeId == currentWand.typeId) {
            commands.get('pos1').function(['facing'], player);
        }
    }
});
world.beforeEvents.playerInteractWithBlock.subscribe((data) => {
    if (data.player.hasTag("BEUser") && data.itemStack?.typeId == currentWand.typeId) {
        system.run(() => { commands.get('pos2').function(['facing'], data.player); });
        data.cancel = true;
    }
});
world.afterEvents.playerSpawn.subscribe((data) => {
    if (welcomeMessage && data.initialSpawn) {
        data.player.sendMessage(`<§bBedrockEdit§r> §aBedrockEdit §5v${VERSION}§a is installed!`);
        data.player.sendMessage(`<§bBedrockEdit§r> §aTo get started, run ${PREFIX}help`);
    }
});
world.afterEvents.playerLeave.subscribe((data) => {
    selMap.delete(data.playerName);
    compSelMap.delete(data.playerName);
    relPosMap.delete(data.playerName);
    clipMap.delete(data.playerName);
});
