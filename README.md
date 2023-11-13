# BedrockEditV3
Minecraft Bedrock Edition interpretation of the Java Edition mod WorldEdit

I've started this project in the past, first with mcfunctions, then using BEAPI with the Gametest framework (now Scripting API) however both had issues, due to the limited nature of functions, and the fact that BEAPI is no longer being developed and is outdated. Now I've started again, just building from the ground up.

## Commands
### General
#### help (or ?)
<p> Provides help and lists all commands </p>
<p> Syntax: </p>

```
./help <page: int>
./help <command: CommandName>
```

#### welcome
<p> Toggles welcome message stating version </p>
<p> Syntax: </p>

```
./welcome
```

#### version
<p> Prints current running version </p>
<p> Syntax: </p>

```
./version
```

#### wand
<p> Gives selection wand or sets it </p>
<p> Syntax: </p>

```
./wand [itemName: Item]
```

### Selection

#### pos1 (or p1)
<p> Sets Position 1 </p>
<p> Syntax: </p>

```
./pos1
./pos1 facing [-lp]
./pos1 position <pos: x y z>
```

#### pos2 (or p2)
<p> Sets Position 2 </p>
<p> Syntax: </p>

```
./pos2
./pos2 facing [-lp]
./pos2 position <pos: x y z>
```

### Clipboard
### World Manipulation
