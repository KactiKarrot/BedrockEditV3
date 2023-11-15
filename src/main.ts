import { world, system, Vector3, BlockPermutation, Player, EntityInventoryComponent, ItemStack } from "@minecraft/server";
import { commands, pos1, pos2 } from "commands";
import { compareVector3, tellError } from "utils";

export const PREFIX = "./";

export const VERSION = "3.0.0-beta1";

export let pos1Map = new Map<string, Vector3>(); // <playerName, position>
export let pos2Map = new Map<string, Vector3>(); // <playerName, position>
export let relPosMap = new Map<string, Vector3>();
export let clipMap = new Map<string, Array<Array<Array<BlockPermutation>>>>(); // <playerName, x<y<z<data>>>>

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

export let welcomeMessage = true;

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
    world.setDynamicProperty('welcomeMsg', false)
    // if (welcomeMessage && scoreboard.hasParticipant('welcomeMsg')) {
    //     scoreboard.removeParticipant('welcomeMsg')
    // } else if (!welcomeMessage) {
    //     scoreboard.setScore('welcomeMsg', 0)
    // }

}

world.beforeEvents.chatSend.subscribe((data) => {
    const player = data.sender;
    const msg = data.message; 
    if (msg.substring(0, PREFIX.length) != PREFIX || !player.hasTag("BEAdmin")) {
        return;
    }

    data.cancel = true;
    
    system.run(() => {
        const cmd = msg.substring(PREFIX.length).split(" ")[0];
        const args = msg.substring(PREFIX.length).split(" ").slice(1);

        let found = false;
        commands.forEach((c) => {
            if (cmd == c.name || cmd == c.alias) {
                found = true;
                c.function(args, player)
            }
        })
        if (!found) {
            tellError(player, `§cERROR: Command '${cmd}' not found`);
        }
    })
})

world.beforeEvents.playerBreakBlock.subscribe((data) => {
    if (data.player.hasTag("BEAdmin") && (data.player.getComponent("minecraft:inventory") as EntityInventoryComponent).container.getItem(data.player.selectedSlot)?.typeId == currentWand.typeId) {
        system.run(() => {pos1(['facing'], data.player)});
        data.cancel = true;
    }
})

world.afterEvents.entityHitBlock.subscribe((data) => {
    if (data.damagingEntity.typeId == 'minecraft:player') {
        let player = data.damagingEntity as Player;
        if (player.hasTag("BEAdmin") && (player.getComponent("minecraft:inventory") as EntityInventoryComponent).container.getItem(player.selectedSlot)?.typeId == currentWand.typeId) {
            pos1(['facing'], player);
        }
    }
})

world.afterEvents.playerInteractWithBlock.subscribe((data) => {
    if(data.player.hasTag("BEAdmin") && data.itemStack?.typeId == currentWand.typeId && !compareVector3(data.block.location, pos2Map.get(data.player.name))) {
        pos2(['facing'], data.player);
    }
})

world.afterEvents.playerSpawn.subscribe((data) => {
    if (welcomeMessage) {
        data.player.sendMessage(`<§bBedrockEdit§r> §aBedrockEdit §5v${VERSION}§a is installed!`)
        data.player.sendMessage(`<§bBedrockEdit§r> §aTo get started, run ${PREFIX}help`)
    }
})