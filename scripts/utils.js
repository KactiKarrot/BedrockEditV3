import { Direction } from "@minecraft/server";
import { commands } from "commands";
import { PREFIX, historyMap, clipMap, historyIndexMap } from "main";
export function tell(player, msg) {
    player.dimension.runCommand(`tellraw "${player.nameTag}" {"rawtext":[{"text":"${msg}"}]}`);
}
export function tellError(player, msg) {
    tell(player, `§cError: ${msg}`);
}
export function getHelp(commandName) {
    let cmd = commands[commands.map(function (e) { return e.name; }).indexOf(commandName)];
    let msg = `copy\\n${cmd.description}`;
    if (cmd.usage.length > 0) {
        msg += `\\nUsage:`;
        cmd.usage.forEach((e) => {
            msg += `\\n${PREFIX + cmd.name} ${e}`;
        });
    }
    return msg;
}
// Return east is default case
export function getPrimaryDirection(a) {
    if (a.y <= -0.75) {
        return Direction.Down;
    }
    else if (a.y >= 0.75) {
        return Direction.Up;
    }
    else if (a.z <= -0.66) {
        return Direction.North;
    }
    else if (a.z >= 0.66) {
        return Direction.South;
    }
    else if (a.x <= -0.66) {
        return Direction.West;
    }
    else {
        return Direction.East;
    }
}
export function rotateDirection(d, a) {
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
export function addVector3(a, b) {
    let sum = {
        x: a.x + b.x,
        y: a.y + b.y,
        z: a.z + b.z
    };
    return sum;
}
// Subtracts two vectors and returns the output
export function subVector3(a, b) {
    let diff = {
        x: a.x - b.x,
        y: a.y - b.y,
        z: a.z - b.z
    };
    return diff;
}
// Gets the difference between two vectors and returns the output
export function diffVector3(a, b) {
    let sum = {
        x: Math.abs(a.x - b.x),
        y: Math.abs(a.y - b.y),
        z: Math.abs(a.z - b.z)
    };
    return sum;
}
export function compareVector3(a, b) {
    if (a != undefined && b != undefined && a.x == b.x && a.y == b.y && a.z == b.z) {
        return true;
    }
    else {
        return false;
    }
}
export function minVector3(a, b) {
    let min = {
        x: Math.min(a.x, b.x),
        y: Math.min(a.y, b.y),
        z: Math.min(a.z, b.z)
    };
    return min;
}
export function maxVector3(a, b) {
    let max = {
        x: Math.max(a.x, b.x),
        y: Math.max(a.y, b.y),
        z: Math.max(a.z, b.z)
    };
    return max;
}
export function ceilVector3(a) {
    let ceil = {
        x: Math.ceil(a.x),
        y: Math.ceil(a.y),
        z: Math.ceil(a.z)
    };
    return ceil;
}
export function floorVector3(a) {
    let floor = {
        x: Math.floor(a.x),
        y: Math.floor(a.y),
        z: Math.floor(a.z)
    };
    return floor;
}
export function shiftVector3(a, direction, amount = 1) {
    let result = {
        x: a.x,
        y: a.y,
        z: a.z
    };
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
    return result;
}
// Sets new clipboard size and clears the selection
export function setClipSize(player, size) {
    clipMap.set(player, Array(size.x).fill(null).map(() => Array(size.y).fill(null).map(() => Array(size.z).fill(null))));
}
export function getClipSize(player) {
    let size = {
        x: clipMap.get(player).length,
        y: clipMap.get(player)[0].length,
        z: clipMap.get(player)[0][0].length
    };
    return size;
}
export function setClipAt(player, pos, block) {
    clipMap.get(player)[pos.x][pos.y][pos.z] = block;
}
export function getClipAt(player, pos) {
    return clipMap.get(player)[pos.x][pos.y][pos.z];
}
export function getHistory(player, index) {
    return historyMap.get(player)[index];
}
export function addHistoryEntry(player) {
    if (historyMap.get(player) == undefined) {
        historyMap.set(player, Array(0));
        historyIndexMap.set(player, 0);
    }
    if (historyIndexMap.get(player) != 0) {
        historyMap.set(player, historyMap.get(player).slice(historyIndexMap.get(player)));
        historyIndexMap.set(player, 0);
    }
    historyMap.get(player).unshift(Array(0));
}
//Precondition, entry exists
export function addToHistoryEntry(player, entry) {
    let index = -1;
    let result = false;
    historyMap.get(player)[0].forEach((e, i) => {
        if (compareVector3(e.pos, entry.pos)) {
            result = true;
            index = i;
        }
    });
    if (result) {
        historyMap.get(player)[0][index].post = entry.post;
    }
    else {
        historyMap.get(player)[0].unshift(entry);
    }
}
