import { world, system, Vector3, BlockPermutation, Player, EntityInventoryComponent, ItemStack } from "@minecraft/server";
import { commands, pos1, pos2 } from "commands";
import { addVector3, compareVector3, diffVector3, maxVector3, minVector3, subVector3, tellError } from "utils";
import * as tool from "./tool";

export const PREFIX = "./";

export const VERSION = "3.0.0-beta1";

export let pos1Map = new Map<string, Vector3>(); // <playerName, position>
export let pos2Map = new Map<string, Vector3>(); // <playerName, position>
export let relPosMap = new Map<string, Vector3>();
export let clipMap = new Map<string, Array<Array<Array<BlockPermutation>>>>(); // <playerName, x<y<z<data>>>>

export let showParticles = false;

export interface HistoryEntry {
    pos: Vector3,
    pre: BlockPermutation,
    post: BlockPermutation
}

export let historyIndexMap = new Map<string, number>();
export let historyMap = new Map<string, Array<Array<HistoryEntry>>>();

// export let scoreboard: ScoreboardObjective;
export let currentWand = new ItemStack('minecraft:wooden_axe', 1);
export const WAND_NAME = '§bBedrockEdit Wand';
export const WAND_LORE = ['Sets Position 1 and Position 2 without commands', "Press 'Attack/Destroy' to set Position 1", "Press 'Use' to set Position 2"];
export let wandEnabled = true;

export let toolEnabled = true;

export let welcomeMessage = true;

export let historyEnabled = true;

// ADD BOOLEAN OPERATIONS (AND) (Minecraft Cad)

function parseArgs(s: string, ): {failed: boolean, result: string[]} {
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
                return {failed: true, result: `Unclosed string at ${e}`};
            } else {
                split.splice(i, x - i + 1, split.slice(i, x + 1).join(' ').slice(1, -1));
            }
        }
    })
    return {failed: false, result: split};
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
        world.setDynamicProperty('wand', 'minecraft:wooden_axe')
    }
    setWand();
    if (world.getDynamicProperty('welcomeMsg') == undefined) {
        world.setDynamicProperty('welcomeMsg', true)
        
    }
    welcomeMessage = world.getDynamicProperty('welcomeMsg') as boolean
    if (world.getDynamicProperty('wandEnabled') == undefined) {
        world.setDynamicProperty('wandEnabled', true);
    }
    wandEnabled = world.getDynamicProperty('wandEnabled') as boolean
    if (world.getDynamicProperty('showParticles') == undefined) {
        world.setDynamicProperty('showParticles', false);
    }
    showParticles = world.getDynamicProperty('showParticles') as boolean
    // if (scoreboard.hasParticipant('welcomeMsg')) {
    //     welcomeMessage = false;
    // }

    
})

export function setWand() {
    // scoreboard.getParticipants().forEach((e) => {
    //     if (e.displayName.substring(0, 5) == "wand.") {
    //         currentWand = new ItemStack(e.displayName.substring(5));
    //         currentWand.nameTag = WAND_NAME;
    //         currentWand.setLore(WAND_LORE);
    //     }
    // })
    currentWand = new ItemStack(world.getDynamicProperty('wand') as string);
    currentWand.nameTag = WAND_NAME;
    currentWand.setLore(WAND_LORE);
}

export function setWelcome() {
    welcomeMessage = !welcomeMessage
    world.setDynamicProperty('welcomeMsg', welcomeMessage)
    // if (welcomeMessage && scoreboard.hasParticipant('welcomeMsg')) {
    //     scoreboard.removeParticipant('welcomeMsg')
    // } else if (!welcomeMessage) {
    //     scoreboard.setScore('welcomeMsg', 0)
    // }

}

export function setWandEnabled() {
    wandEnabled = !wandEnabled
    world.setDynamicProperty('wandEnabled', wandEnabled)
}

export function setShowParticles() {
    showParticles = !showParticles
    world.setDynamicProperty('showParticles', showParticles)
}

system.runInterval(() => {
    if (toolEnabled) {
        tool.tick();
    }
})

system.runInterval(() => {

    

    if (!showParticles) {
        return;
    }

    world.getAllPlayers().forEach((p) => {
        if (!pos1Map.has(p.name) || !pos2Map.has(p.name)) {
            return;
        }
        let min = minVector3(pos1Map.get(p.name), pos2Map.get(p.name));
        let diff = addVector3({x: 1, y: 1, z: 1}, diffVector3(pos1Map.get(p.name), pos2Map.get(p.name)))
        for (let x = 0; x < diff.x; x++) {
            for (let y = 0; y < diff.y; y++) {
                for (let z = 0; z < diff.z; z++) {
                    if (compareVector3(pos1Map.get(p.name), addVector3({x: x, y: y, z: z}, min)) || compareVector3(pos2Map.get(p.name), addVector3({x: x, y: y, z: z}, min)).valueOf() == true) {
                        p.runCommand(`particle be:outline-purple ${min.x + x + 1}.0 ${min.y + y}.0 ${min.z + z + 1}.0`)
                        p.runCommand(`particle be:outline-purple ${min.x + x + 1}.0 ${min.y + y}.0 ${min.z + z}.0`)
                        p.runCommand(`particle be:outline-purple ${min.x + x + 1}.0 ${min.y + y + 1}.0 ${min.z + z + 1}.0`)
                        p.runCommand(`particle be:outline-purple ${min.x + x + 1}.0 ${min.y + y + 1}.0 ${min.z + z}.0`)
                        p.runCommand(`particle be:outline-purple ${min.x + x}.0 ${min.y + y}.0 ${min.z + z + 1}.0`)
                        p.runCommand(`particle be:outline-purple ${min.x + x}.0 ${min.y + y}.0 ${min.z + z}.0`)
                        p.runCommand(`particle be:outline-purple ${min.x + x}.0 ${min.y + y+ 1}.0 ${min.z + z + 1}.0`)
                        p.runCommand(`particle be:outline-purple ${min.x + x}.0 ${min.y + y + 1}.0 ${min.z + z}.0`)
                    } else if (
                        ((x == 0 || x == diff.x - 1) && (y == 0 || y == diff.y - 1)) ||
                        ((x == 0 || x == diff.x - 1) && (z == 0 || z == diff.z - 1)) || 
                        ((z == 0 || z == diff.z - 1) && (y == 0 || y == diff.y - 1))
                    ) {
                        p.runCommand(`particle be:outline-red ${min.x + x + 0.5} ${min.y + y + 0.5} ${min.z + z + 0.0}.0`)
                        p.runCommand(`particle be:outline-red ${min.x + x + 0.5} ${min.y + y + 0.5} ${min.z + z + 1.0}.0`)

                        p.runCommand(`particle be:outline-red ${min.x + x + 0.5} ${min.y + y + 0.0}.0 ${min.z + z + 0.5}`)
                        p.runCommand(`particle be:outline-red ${min.x + x + 0.5} ${min.y + y + 1.0}.0 ${min.z + z + 0.5}`)

                        p.runCommand(`particle be:outline-red ${min.x + x + 0.0}.0 ${min.y + y + 0.5} ${min.z + z + 0.5}`)
                        p.runCommand(`particle be:outline-red ${min.x + x + 1.0}.0 ${min.y + y + 0.5} ${min.z + z + 0.5}`)


                        // p.runCommand(`particle be:outline-red ${min.x + x + 0.0}.0 ${min.y + y + 0.0} ${min.z + z + 0.0}`)
                    }
                }
            }
        }
    })
    
}, 15)

world.beforeEvents.chatSend.subscribe((data) => {
    const player = data.sender;
    const msg = data.message; 
    if (msg.substring(0, PREFIX.length) != PREFIX || !player.hasTag("BEUser")) {
        return;
    }

    data.cancel = true;
    
    system.run(() => {
        const cmd = msg.substring(PREFIX.length).split(" ")[0];
        // const args = msg.substring(PREFIX.length).split(" ").slice(1);
        const args = parseArgs(msg.substring(PREFIX.length));

        let found = false;
        if (args.failed == true) {
            tellError(player, args.result);
            return;
        }
        commands.forEach((c) => {
            if (cmd == c.name || cmd == c.alias) {
                found = true;
                // c.function(args, player)
                c.function(args.result.slice(1), player);
            }
        })
        if (!found) {
            tellError(player, `Command '${cmd}' not found`);
        }
    })
})

system.afterEvents.scriptEventReceive.subscribe((data) => {
    commands.forEach((c) => {
        if (data.sourceType != 'Entity' || data.sourceEntity.typeId != 'minecraft:player') {
            console.warn('BE scriptevent called from non-player, exiting');
            return;
        }
        let player = data.sourceEntity as Player;
        const args = parseArgs(data.message.substring(PREFIX.length));
        if (args.failed == true) {
            tellError(player, args.result);
            return;
        }
        let found = false;
        if ('be:' + data.id == c.name || 'be:' + data.id == c.alias) {
            found = true;
            c.function(args.result, player);
        }
        if (!found) {
            tellError(player, `Command '${data.id}' not found`);
        }
    })
}, {namespaces: ['be']})

world.beforeEvents.playerBreakBlock.subscribe((data) => {
    if (data.player.hasTag("BEUser") && (data.player.getComponent("minecraft:inventory") as EntityInventoryComponent).container.getItem(data.player.selectedSlot)?.typeId == currentWand.typeId) {
        system.run(() => {pos1(['facing'], data.player)});
        data.cancel = true;
    }
})

world.afterEvents.entityHitBlock.subscribe((data) => {
    if (data.damagingEntity.typeId == 'minecraft:player') {
        let player = data.damagingEntity as Player;
        if (player.hasTag("BEUser") && (player.getComponent("minecraft:inventory") as EntityInventoryComponent).container.getItem(player.selectedSlot)?.typeId == currentWand.typeId) {
            pos1(['facing'], player);
        }
    }
})

world.afterEvents.playerInteractWithBlock.subscribe((data) => {
    if(data.player.hasTag("BEUser") && data.itemStack?.typeId == currentWand.typeId && !compareVector3(data.block.location, pos2Map.get(data.player.name))) {
        pos2(['facing'], data.player);
    }
})

world.afterEvents.playerSpawn.subscribe((data) => {
    if (welcomeMessage && data.initialSpawn) {
        data.player.sendMessage(`<§bBedrockEdit§r> §aBedrockEdit §5v${VERSION}§a is installed!`)
        data.player.sendMessage(`<§bBedrockEdit§r> §aTo get started, run ${PREFIX}help`)
    }
})

world.afterEvents.playerLeave.subscribe((data) => {
    pos1Map.delete(data.playerName);
    pos2Map.delete(data.playerName);
    relPosMap.delete(data.playerName);
    clipMap.delete(data.playerName);
})
