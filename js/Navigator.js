var Navigator = {

    FindRoute: (fromRoom, toRoom) => {
        
        // An incredibly smart (not really) algorithm for calculating the shortest route from room A to room B

        // Let's not waste our time if the origin and target rooms are the same, right?
        if (fromRoom == toRoom) {

            Message.Show("Congratulations! You're already there", `You've taken quite a trip around the world and finally came back to <u>${fromRoom}</u> feeling like you've grown quite a bit as a person since you've left <u>${fromRoom}</u> all those years ago.`);

            return "";
        }

        var originRoom = Map.GetRoom(fromRoom);
        var targetRoom = Map.GetRoom(toRoom);

        // We'll store a successful route with the shortest number of moves here
        var shortestRoute = [];

        // We'll store the route we are currently working on here
        var currentRoute = [];
        
        // The number of times we'll try to find a route before returning the shortest route we found
        var ITERATIONS = 1000;

        // The number of moves we'll take per iteration trying to get to the destination room
        const MOVES_PER_ITERATION = 100;

        var currentRoomId = -1;
        var pervRoomId = -1;

        for (var it = 1; it < ITERATIONS; it++) {

            // We are setting out on another adventure, move back to the starting room and clear the route
            currentRoomId = originRoom.Id;
            pervRoomId = -1;
            currentRoute = [];
            var stop = false;
            var moves = 0;

            while (!stop && moves < MOVES_PER_ITERATION) {

                moves++;
                
                var here = Map.Rooms[currentRoomId];

                var moved = false;

                if (here && here.Exits) {

                    // Let's see if one of the exits from the room we're in leads to the target room
                    var foundIt = false;

                    for (var exit in here.Exits) {

                        if (here.Exits[exit] == targetRoom.Id) {

                            foundIt = true;
                            moved = true;
                            pervRoomId = currentRoomId;
                            currentRoomId = targetRoom.Id;
                            currentRoute.push(exit);
                        }
                    }

                    if (!foundIt) {

                        if (Object.keys(here.Exits).length == 1) {
                            
                            // If there is only one possible exit, there's no choice but to pick it
                            var dir = Object.keys(here.Exits)[0];
                            currentRoute.push(dir);

                            var roomId = here.Exits[dir];

                            pervRoomId = currentRoomId;
                            currentRoomId = roomId;
                            moved = true;
                        }
                        else {

                            // If there is more than one exit, let's pick a random one that does not lead back to the room we came from
                            var possibleExits = [];

                            for (var exit in here.Exits) {

                                if (here.Exits[exit] != pervRoomId.Id) possibleExits.push(exit);
                            }

                            var selectedExit = possibleExits[Math.floor(Math.random() * possibleExits.length)];
                            currentRoute.push(selectedExit);

                            var roomId = here.Exits[selectedExit];

                            pervRoomId = currentRoomId;
                            currentRoomId = roomId;
                            moved = true;
                        }
                    }
                }

                if (!moved) {

                    // Looks like we came to a dead end as we couldn't find any possible move, let's end this iteration
                    stop = true;
                }

                if (currentRoomId == targetRoom.Id) {
    
                    // We did it!
                    stop = true;

                    // Store this route only if it's shorter than a previously found successful route (or if it's the first one we've found)
                    if (shortestRoute.length == 0 || currentRoute.length < shortestRoute.length) {
                        
                        shortestRoute = currentRoute;

                        // At this point we have found a valid route, let's give the algorithm 20 more iterations to try and find a shorter route
                        ITERATIONS = it + 20;
                    }
                }
            }
        }

        if (shortestRoute.length == 0) {

            Message.Show("No way!", `I've tried to find a way to get to <u>${targetRoom.Name}</u> from <u>${originRoom.Name}</u> but couldn't find a valid route, this probably means that one of the rooms is in a different, unconnected region in the game or that the map is not yet complete.`);
        }
        else {

            // Temporarily prevent the map from updating
            Map.AllowUpdate = false;
    
            setTimeout(() => {
                
                Map.AllowUpdate = true;
    
                if (Map.CurrentRoom != targetRoom.Name) {
    
                    Message.Show("Oh, boy!", `It appears you didn't end up where you wanted to be. This can happen if the game changes the state of one or more exits (which ${APPNAME} can't be aware of), for instance a room gets locked up or something (or someone) blocks you from moving in or out of a room. Refer to the story text to see what's holding you back and try again.`);
                }
            
            }, 300);
        }

        return shortestRoute.join(",");
    }
}
