import { Player, EntityInventoryComponent, ItemTypes, world } from "@minecraft/server";
import { commands } from "commands";
import { currentWand, WAND_NAME, setWand } from "main";
import { tellMessage, tellError } from "utils";

export function register() {
    commands.set('wand', {
        alias: "",
        function: wand,
        description: "Sets or gives the wand item",
        extDescription: "Sets or gives the wand item\nitemName: Name of the item to set as the wand. Use 'default' to reset. If not given the player is given the current wand item.",
        usage: [
            "[itemName: Item]"
        ]
    })
}

function wand(args: string[], player: Player) {
    if (args.length < 1) {
        (player.getComponent('minecraft:inventory') as EntityInventoryComponent).container.addItem(currentWand.clone());
        tellMessage(player, `You have been given ${WAND_NAME}`)
        return;
    }
    if (args[0] == 'default') {
        args[0] = 'minecraft:wooden_axe'
    }
    let itemType = ItemTypes.get(args[0]);
    if (itemType == undefined) {
        tellError(player, `Item ${args[0]} not found`);
        return;
    }
    // scoreboard.removeParticipant('wand.' + currentWand.typeId);
    // scoreboard.setScore("wand." + itemType.id, 0);
    world.setDynamicProperty('wand', itemType.id);
    setWand();
    tellMessage(player, `§aSet wand item to ${currentWand.typeId}`)
}