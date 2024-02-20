import { Player } from "@minecraft/server"
import { commands } from "commands"
import { historyEnabled, setHistoryEnabled, setWandEnabled, wandEnabled } from "main"
import { tellMessage } from "utils"

commands.set('togglehistory', {
    alias: "togglehistory",
    function: toggleHistory,
    description: "Toggles whether new edits get saved to history",
    extDescription: "Toggles whether new edits get saved to history",
    usage: [
        ""
    ]
})

function toggleHistory(args: string[], player: Player) {
    setHistoryEnabled()
    if (historyEnabled) {
        tellMessage(player, '§aHistory enabled')
    } else {
        tellMessage(player, '§aHistory disabled')
    }
}