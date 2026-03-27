# Going Nuclear / False Escort

## Overview
A multiplayer, turn-based, hexagonal grid strategy game featuring fog of war. The primary objective is to safely escort your Nuclear Carrier to a goal tile in enemy territory, while simultaneously disrupting the enemy from doing the same.

## Map & Parameters
- **Grid Size**: Roughly an 8-10 radius hexagon map.
- **Generation**: Randomly generated hexagon tiles, mirrored symmetrically on both sides to ensure perfect fairness.
- **Fog of War**: Units reveal a default radius of `2-4` tiles.
- **Goal Tiles**: `1-3` goal tiles deliberately placed deep in enemy territory.
- **Starting Conditions**: Nuclear carriers must start at the absolute bottom/edge of their territory. Other units can be organized freely within the player's half of the map before the match begins.

## Units & Economy
Players start with `3-5` units alongside their Carrier. During the game, players can access a **Shop** to purchase reinforcements or replace destroyed units using an in-game currency (earned over time, per turn, or by securing specific territory). 

### Tile Stacking Mechanics
Multiple units **can** stack on the exact same hexagonal tile to combine their firepower or defense. However, doing so incurs a severe **Mobility Penalty**. A massive cluster of units on a single tile will have drastically reduced movement speed, preventing players from simply stacking an unstoppable, fast-moving "deathball". This forces tactical decision-making between concentrated power (stacked) vs. mobility and map control (spread out).

1. **Nuclear Carrier**
   - *Role*: The VIP. Moves slowly, but wins the game if it reaches the goal tile. When it arrives, it triggers a map-wide nuke destruction event for thematic victory.
   - *Attributes*: High HP, Low Move, Standard Vision.
2. **Decoy Carrier**
   - *Role*: Looks exactly like the Nuclear Carrier to the enemy. Its true nature is only revealed when destroyed.
   - *Attributes*: Same apparent stats as the Nuclear Carrier.
3. **Plane**
   - *Role*: Fast scout. Moves quickly and grants massive vision through the fog of war.
   - *Attributes*: Low HP, High Move, High Vision.
4. **Missile Launcher / Mortar**
   - *Role*: Long-range artillery. Can snipe from afar but has a minimum attack range (cannot attack adjacent units).
   - *Attributes*: High ATK, High ATK Range, Low Move.
5. **Foot Soldier / Tank**
   - *Role*: Standard front-line bruiser. Secures territory for the carrier with close/straight attacks.
   - *Attributes*: Balanced HP, ATK, Move.

## Tiles
- **Revealed Tile**: Contains active vision from an allied unit.
- **Fog of War Tile**: Unexplored or previously explored tile where enemies hidden within are invisible.
- **Goal Tile**: The destination for the Nuclear Carrier.
- **Checkpoint / Forward Base Tile**: Capturable tiles strategically placed across the map, with a highly contested one directly in the center. Capturing a checkpoint permanently expands your **Deployment Zone Radius**, allowing you to spawn newly purchased units far up the board instead of walking them from your home edge.
- *(Future)* **Obstacle Tile**: Unpassable mountains or terrain.

## Rules & Mechanics
- **Win Condition**: Reach the Goal Tile with the Nuclear Carrier, OR eliminate all enemy units.
- **Turn Order**: *(To be decided - either move all units then switch turns, OR alternate moving 1 unit)*.
- **Action Economy**: *(To be decided - Move then attack, attack then move, or choose one)*.
- **Vision Mechanics**: Can players attack blindly into the fog? Does attacking reveal your position? *(To be decided)*.
- **Shrinking Zone / Escalation**: Certain tiles or units may be revealed automatically as the game progresses to force a conclusion.

## Future Expansions
- Alternative win conditions.
- Additional terrain types and dynamic tiles.
- More unique unit classes and abilities.
