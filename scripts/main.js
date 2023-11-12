import { world, system } from "@minecraft/server";
import { commands, pos1, pos2 } from "commands";
import { compareVector3, tellError } from "utils";
export const PREFIX = "./";
export let pos1Map = new Map(); // <playerName, position>
export let pos2Map = new Map(); // <playerName, position>
export let relPosMap = new Map();
export let clipMap = new Map(); // <playerName, x<y<z<data>>>>
export let historyIndexMap = new Map();
export let historyMap = new Map();
export let scoreboard;
export let wand = "minecraft:wooden_axe";
world.afterEvents.worldInitialize.subscribe(() => {
    scoreboard = world.scoreboard.getObjective("_beData");
    if (scoreboard == null) {
        scoreboard = world.scoreboard.addObjective("_beData", "_beData");
        scoreboard.setScore("wand.wooden_axe", 0);
    }
    scoreboard.getParticipants().forEach((e) => {
        if (e.displayName.substring(0, 5) == "wand.") {
            wand = "minecraft:" + e.displayName.substring(5);
        }
    });
});
world.beforeEvents.chatSend.subscribe((data) => {
    const player = data.sender;
    const msg = data.message;
    if (msg.substring(0, PREFIX.length) != PREFIX || !player.hasTag("BEAdmin")) {
        return;
    }
    data.cancel = true;
    system.run(() => {
        const cmd = msg.split(" ")[0].substring(PREFIX.length);
        const args = msg.split(" ").slice(1);
        let found = false;
        commands.forEach((c) => {
            if (cmd == c.name || cmd == c.alias) {
                found = true;
                c.function(args, player);
            }
        });
        if (!found) {
            tellError(player, `§cERROR: Command '${cmd}' not found`);
        }
    });
});
world.beforeEvents.playerBreakBlock.subscribe((data) => {
    if (data.player.hasTag("BEAdmin") && data.player.getComponent("minecraft:inventory").container.getItem(data.player.selectedSlot)?.typeId == wand) {
        system.run(() => { pos1(['facing'], data.player); });
        data.cancel = true;
    }
});
world.afterEvents.entityHitBlock.subscribe((data) => {
    if (data.damagingEntity.typeId == 'minecraft:player') {
        let player = data.damagingEntity;
        if (player.hasTag("BEAdmin") && player.getComponent("minecraft:inventory").container.getItem(player.selectedSlot)?.typeId == wand) {
            pos1(['facing'], player);
        }
    }
});
world.afterEvents.playerInteractWithBlock.subscribe((data) => {
    if (data.player.hasTag("BEAdmin") && data.itemStack?.typeId == wand && !compareVector3(data.block.location, pos2Map.get(data.player.name))) {
        pos2(['facing'], data.player);
    }
});
