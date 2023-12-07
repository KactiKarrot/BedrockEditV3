import { commands } from "commands";
import { VERSION } from "main";
import { tellMessage } from "utils";
export function register() {
    commands.set('version', {
        alias: "ver",
        function: version,
        description: "Prints the current version",
        extDescription: "Prints the current version",
        usage: [
            ""
        ]
    });
}
function version(args, player) {
    tellMessage(player, `<§bBedrockEdit§r> §aBedrockEdit §5v${VERSION}§a is installed!`);
}
