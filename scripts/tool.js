var ToolModes;
(function (ToolModes) {
    ToolModes[ToolModes["SELECTION"] = 0] = "SELECTION";
    ToolModes[ToolModes["VOXEL_SNIPER"] = 1] = "VOXEL_SNIPER";
    ToolModes[ToolModes["BRUSH"] = 2] = "BRUSH";
})(ToolModes || (ToolModes = {}));
let toolMode = ToolModes.SELECTION;
// Runs every tick
export function tick() {
    switch (toolMode) {
    }
}
