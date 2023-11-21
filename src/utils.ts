import {Player, Vector3, BlockPermutation, Direction, BlockTypes, EntityInventoryComponent, Vector2} from "@minecraft/server"
import { historyMap, clipMap, HistoryEntry, historyIndexMap } from "main"


export function tellError(player: Player, msg) {
    player.sendMessage(`§cError: ${msg}`)
}

export function getPermFromHand(player: Player): BlockPermutation {
    let typeId = (player.getComponent("minecraft:inventory") as EntityInventoryComponent).container.getItem(player.selectedSlot)?.typeId;

    // For some reason, regular wood planks are the only items to still use data values?
    if (typeId == 'minecraft:planks') {
        let ids = ['oak', 'spruce', 'birch', 'jungle', 'acacia', 'dark_oak'];
        let perm = BlockPermutation.resolve(typeId);
        ids.forEach((e) => {
            if (perm.withState('wood_type', e).getItemStack().isStackableWith((player.getComponent("minecraft:inventory") as EntityInventoryComponent).container.getItem(player.selectedSlot)).valueOf() == true) {
                perm =  perm.withState('wood_type', e);
            }
        })
        return perm;
    }

    if (typeId == 'minecraft:water_bucket') {
        typeId = 'minecraft:water';
    }
    if (typeId == 'minecraft:lava_bucket') {
        typeId = 'minecraft:lava';
    }
    if (typeId == 'minecraft:powder_snow_bucket') {
        typeId = 'minecraft:powder_snow';
    }
    if (typeId == undefined || BlockTypes.get(typeId) == undefined) {
        typeId = "minecraft:air";
    }
    
    return BlockPermutation.resolve(typeId);
}

export function getPermFromStr(str: string, player: Player): BlockPermutation {
    
    try {
        if (BlockPermutation.resolve(str) == undefined) {
            return null;
        }
    } catch {
        return null;
    }

    if (str.indexOf('[') < 0) {
        return BlockPermutation.resolve(str)
    }
    player.sendMessage(str.split('[')[0])
    try {
        
        let states = str.split('[')[1].substring(0, str.split('[')[1].length - 1).split(',');
        let perm = BlockPermutation.resolve(str.split('[')[0]);

        

        states.forEach((e) => {
            player.sendMessage(e)
            if (e.indexOf('=') < 0 || e.split('=').length < 2) {
                return null;
            }
            let state = e.split('=');
            state[0] = state[0].substring(1, state[0].length - 1)
            
            if (state[1] == 'true') {
                perm = perm.withState(state[0], true);
            } else if (state[1] == 'false') {
                perm = perm.withState(state[0], false);
            } else if (!isNaN(parseInt(state[1]))) {
                perm = perm.withState(state[0], parseInt(state[1]));
            } else {
                state[1] = state[1].substring(1, state[1].length - 1)
                perm = perm.withState(state[0], state[1]);
            }
        })

        return perm;
    } catch {
        return null;
    }    
}

export function setBlockAt(player: Player, pos: Vector3, perm: BlockPermutation) {
    addToHistoryEntry(player.name, {
        pos: pos,
        pre: player.dimension.getBlock(pos).permutation.clone(),
        post: perm.clone()
    });
    player.dimension.getBlock(pos).setPermutation(perm);
}

// WILL NOT ROTATE GLOW LICHEN OR SCULK VEIN
export function rotatePerm(perm: BlockPermutation) {
    switch(perm.getState('weirdo_direction')) {
        case 0: {
            return perm.withState('weirdo_direction', 2);
        }
        case 1: {
            return perm.withState('weirdo_direction', 3);
        }
        case 2: {
            return perm.withState('weirdo_direction', 1);
        }
        case 3: {
            return perm.withState('weirdo_direction', 0);
        }
    }
    switch(perm.getState('coral_direction')) {
        case 0: {
            return perm.withState('coral_direction', 2);
        }
        case 1: {
            return perm.withState('coral_direction', 3);
        }
        case 2: {
            return perm.withState('coral_direction', 1);
        }
        case 3: {
            return perm.withState('coral_direction', 0);
        }
    }
    switch(perm.getState('direction')) {
        case 0: {
            return perm.withState('direction', 1);
        }
        case 1: {
            return perm.withState('direction', 2);
        }
        case 2: {
            return perm.withState('direction', 3);
        }
        case 3: {
            return perm.withState('direction', 0);
        }
    }
    switch(perm.getState('facing_direction')) {
        case 'north': {
            return perm.withState('facing_direction', 'east');
        }
        case 'east': {
            return perm.withState('facing_direction', 'south');
        }
        case 'south': {
            return perm.withState('facing_direction', 'west');
        }
        case 'west': {
            return perm.withState('facing_direction', 'north');
        }
    }
    switch(perm.getState('lever_direction')) {
        case 'down_east_west': {
            return perm.withState('lever_direction', 'down_north_south');
        }
        case 'down_east_west': {
            return perm.withState('lever_direction', 'down_north_south');
        }
        case 'up_east_west': {
            return perm.withState('lever_direction', 'up_north_south');
        }
        case 'up_east_west': {
            return perm.withState('lever_direction', 'up_north_south');
        }
        case 'north': {
            return perm.withState('lever_direction', 'east');
        }
        case 'east': {
            return perm.withState('lever_direction', 'south');
        }
        case 'south': {
            return perm.withState('lever_direction', 'west');
        }
        case 'west': {
            return perm.withState('lever_direction', 'north');
        }
    }
    switch(perm.getState('rail_direction')) {
        case 0: {
            return perm.withState('rail_direction', 1);
        }
        case 1: {
            return perm.withState('rail_direction', 0);
        }
        case 2: {
            return perm.withState('rail_direction', 5);
        }
        case 3: {
            return perm.withState('rail_direction', 4);
        }
        case 4: {
            return perm.withState('rail_direction', 2);
        }
        case 5: {
            return perm.withState('rail_direction', 3);
        }
        case 6: {
            return perm.withState('rail_direction', 7);
        }
        case 7: {
            return perm.withState('rail_direction', 8);
        }
        case 8: {
            return perm.withState('rail_direction', 9);
        }
        case 9: {
            return perm.withState('rail_direction', 6);
        }
    }
    switch(perm.getState('torch_facing_direction')) {
        case 'north': {
            return perm.withState('torch_facing_direction', 'east');
        }
        case 'east': {
            return perm.withState('torch_facing_direction', 'south');
        }
        case 'south': {
            return perm.withState('torch_facing_direction', 'west');
        }
        case 'west': {
            return perm.withState('torch_facing_direction', 'north');
        }
    }
    return perm;
}

// Return east is default case
export function getPrimaryDirection(a: Vector3) {
    if (a.y <= -0.75) {
        return Direction.Down
    } else if (a.y >= 0.75) {
        return Direction.Up
    } else if (a.z <= -0.66) {
        return Direction.North
    } else if (a.z >= 0.66) {
        return Direction.South
    } else if (a.x <= -0.66) {
        return Direction.West
    } else {
        return Direction.East
    }
}

export function rotateDirection(d: Direction, a: number) {
    switch (d) {
        case Direction.North: {
            switch (a) {
                case 0: {
                    return Direction.North;
                }
                case 90: {
                    return Direction.East;
                }
                case 180: {
                    return Direction.South;
                }
                case 270: {
                    return Direction.West;
                }
            }
        }
        case Direction.East: {
            switch (a) {
                case 0: {
                    return Direction.East;
                }
                case 90: {
                    return Direction.South;
                }
                case 180: {
                    return Direction.West;
                }
                case 270: {
                    return Direction.North;
                }
            }
        }
        case Direction.South: {
            switch (a) {
                case 0: {
                    return Direction.South;
                }
                case 90: {
                    return Direction.West;
                }
                case 180: {
                    return Direction.North;
                }
                case 270: {
                    return Direction.East;
                }
            }
        }
        case Direction.West: {
            switch (a) {
                case 0: {
                    return Direction.West;
                }
                case 90: {
                    return Direction.North;
                }
                case 180: {
                    return Direction.East;
                }
                case 270: {
                    return Direction.South;
                }
            }
        }
    }
}

// Adds two vectors and returns the output
export function addVector3(a: Vector3, b: Vector3) {
    let sum: Vector3 = {
        x: a.x + b.x,
        y: a.y + b.y,
        z: a.z + b.z
    }
    return sum
}

// Subtracts two vectors and returns the output
export function subVector3(a: Vector3, b: Vector3) {
    let diff: Vector3 = {
        x: a.x - b.x,
        y: a.y - b.y,
        z: a.z - b.z
    }
    return diff
}

// Gets the difference between two vectors and returns the output
export function diffVector3(a: Vector3, b: Vector3) {
    let sum: Vector3 = {
        x: Math.abs(a.x - b.x),
        y: Math.abs(a.y - b.y),
        z: Math.abs(a.z - b.z)
    }
    return sum
}

export function compareVector3(a: Vector3, b: Vector3) {
    if (a != undefined && b != undefined && a.x == b.x && a.y == b.y && a.z == b.z) {
        return true
    } else {
        return false;
    }
}

export function minVector3(a: Vector3, b: Vector3) {
    let min: Vector3 = {
        x: Math.min(a.x, b.x),
        y: Math.min(a.y, b.y),
        z: Math.min(a.z, b.z)
    }
    return min
}

export function maxVector3(a: Vector3, b: Vector3) {
    let max: Vector3 = {
        x: Math.max(a.x, b.x),
        y: Math.max(a.y, b.y),
        z: Math.max(a.z, b.z)
    }
    return max
}

export function ceilVector3(a: Vector3) {
    let ceil: Vector3 = {
        x: Math.ceil(a.x),
        y: Math.ceil(a.y),
        z: Math.ceil(a.z)
    }
    return ceil
}

export function floorVector3(a: Vector3) {
    let floor: Vector3 = {
        x: Math.floor(a.x),
        y: Math.floor(a.y),
        z: Math.floor(a.z)
    }
    return floor
}

export function shiftVector3(a: Vector3, direction: Direction, amount: number = 1) {
    let result = {
        x: a.x,
        y: a.y,
        z: a.z
    }
    switch (direction) {
        case Direction.North: {
            result.z -= amount;
            break;
        }
        case Direction.South: {
            result.z += amount;
            break;
        }
        case Direction.East: {
            result.x += amount;
            break;
        }
        case Direction.West: {
            result.x -= amount;
            break;
        }
        case Direction.Up: {
            result.y += amount;
            break;
        }
        case Direction.Down: {
            result.y -= amount;
            break;
        }
    }
    return result
}

// Sets new clipboard size and clears the selection
export function setClipSize(player: string, size: Vector3) {
    clipMap.set(player, Array(size.x).fill(null).map(
        () => Array(size.y).fill(null).map(
            () => Array(size.z).fill(null)
        )
    ));
}

export function getClipSize(player: string) {
    let size = {
        x: clipMap.get(player).length,
        y: clipMap.get(player)[0].length,
        z: clipMap.get(player)[0][0].length
    }
    return size;
}

export function setClipAt(player: string, pos: Vector3, block: BlockPermutation) {
    clipMap.get(player)[pos.x][pos.y][pos.z] = block;
}

export function getClipAt(player: string, pos: Vector3) {
    return clipMap.get(player)[pos.x][pos.y][pos.z]
}

export function getHistory(player: string, index: number) {
    return historyMap.get(player)[index];
}

export function addHistoryEntry(player: string) {
    if (historyMap.get(player) == undefined) {
        historyMap.set(player, Array(0));
        historyIndexMap.set(player, 0);
    }
    if (historyIndexMap.get(player) != 0) {
        historyMap.set(player, historyMap.get(player).slice(historyIndexMap.get(player)));
        historyIndexMap.set(player, 0);
    }
    historyMap.get(player).unshift(Array<HistoryEntry>(0));
}

//Precondition, entry exists
export function addToHistoryEntry(player: string, entry: HistoryEntry) {
    let index = -1;
    let result = false;
    historyMap.get(player)[0].forEach((e, i) => {
        if (compareVector3(e.pos, entry.pos)) {
            result =  true;
            index = i;
        }
    })
    if (result) {
        historyMap.get(player)[0][index].post = entry.post;
    } else {
        historyMap.get(player)[0].unshift(entry);
    }
}