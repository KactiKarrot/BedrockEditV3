import { Player } from "@minecraft/server"
import { commands } from "commands"
import { setShowParticles, showParticles } from "main"
import { tellMessage } from "utils"

commands.set('toggleoutline', {
    alias: "toggleparticles",
    function: toggleOutline,
    description: "Toggles whether selection outline particles are rendered",
    extDescription: "Toggles whether selection outline particles are rendered (WARNING: Large selections can can cause cause performance issues with this on, use your own risk)",
    usage: [
        ""
    ]
})

function toggleOutline(args: string[], player: Player) {
    setShowParticles()
    if (showParticles) {
        tellMessage(player, '§aOutline particles enabled')
    } else {
        tellMessage(player, '§aOutline particles disabled')
    }
}