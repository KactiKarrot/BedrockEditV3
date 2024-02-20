import { commands } from "commands";
import { historyEnabled, setHistoryEnabled } from "main";
import { tellMessage } from "utils";
commands.set('togglehistory', {
    alias: "togglehistory",
    function: toggleHistory,
    description: "Toggles whether new edits get saved to history",
    extDescription: "Toggles whether new edits get saved to history",
    usage: [
        ""
    ]
});
function toggleHistory(args, player) {
    setHistoryEnabled();
    if (historyEnabled) {
        tellMessage(player, '§aHistory enabled');
    }
    else {
        tellMessage(player, '§aHistory disabled');
    }
}
