import { commands } from "commands";
commands.set('remove', {
    alias: "rm",
    function: remove,
    description: "Removes the selected region",
    extDescription: "Removes the selected region",
    usage: [
        ""
    ]
});
function remove(args, player) {
    commands.get('set').function(['minecraft:air'], player);
}
