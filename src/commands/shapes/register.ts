import * as cube from "./cube";
import * as walls from "./walls";
import * as cylinder from "./cylinder";
import * as ellipsoid from "./ellipsoid";
import * as dome from "./dome";
import * as pyramid from "./pyramid";
import * as cone from "./cone";

export function register() {
    cube.register();
    walls.register();
    cylinder.register();
    ellipsoid.register();
    dome.register();
    pyramid.register();
    cone.register();
}