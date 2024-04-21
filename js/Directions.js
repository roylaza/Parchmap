var Directions = {

    n: {

        Dir: "n",
        Name: "North"
    },

    s: {

        Dir: "s",
        Name: "South"
    },

    w: {

        Dir: "w",
        Name: "West"
    },

    e: {

        Dir: "e",
        Name: "East"
    },

    nw: {

        Dir: "nw",
        Name: "Northwest"
    },

    se: {

        Dir: "se",
        Name: "Southeast"
    },

    ne: {

        Dir: "ne",
        Name: "Northeast"
    },

    sw: {

        Dir: "sw",
        Name: "Southwest"
    },

    up: {

        Dir: "up",
        Name: "Up"
    },

    down: {

        Dir: "down",
        Name: "Down"
    },

    in: {

        Dir: "in",
        Name: "In"
    },

    out: {

        Dir: "out",
        Name: "Out"
    }
}

Directions.n.Opposite = Directions.s;
Directions.s.Opposite = Directions.n;
Directions.w.Opposite = Directions.e;
Directions.e.Opposite = Directions.w;
Directions.nw.Opposite = Directions.se;
Directions.se.Opposite = Directions.nw;
Directions.ne.Opposite = Directions.sw;
Directions.sw.Opposite = Directions.ne;
Directions.up.Opposite = Directions.down;
Directions.down.Opposite = Directions.up;
Directions.in.Opposite = Directions.out;
Directions.out.Opposite = Directions.in;

Directions.north = Directions.n;
Directions.south = Directions.s;
Directions.west = Directions.w;
Directions.east = Directions.e;
Directions.left = Directions.w;
Directions.right = Directions.e;
Directions.northwest = Directions.nw;
Directions.southeast = Directions.se;
Directions.northeast = Directions.ne;
Directions.southwest = Directions.sw;