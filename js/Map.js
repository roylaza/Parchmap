var Map = {

    Rooms: [],
    CurrentRoom: "",
    DisplayedRoom: "",
    AllowUpdate: true,
    Visible: false,

    Build: () => {

        Map.CreateRooms(["in", "up"]);
        Map.CreateRooms(["nw", "n", "ne"]);
        Map.CreateRooms(["w", "here", "e"]);
        Map.CreateRooms(["sw", "s", "se"]);
        Map.CreateRooms(["down", "out"]);

        Map.CreateMiniMap("horizontal top", ["nw", "n", "ne"]);
        Map.CreateMiniMap("horizontal bottom", ["sw", "s", "se"]);
        Map.CreateMiniMap("vertical left", ["in", "w", "out"]);
        Map.CreateMiniMap("vertical right", ["up", "e", "down"]);

        $("#current-room-notes").click(() => Map.ShowNotes(null, Map.CurrentRoom));

        if ($(window).width() >= 850) Map.Toggle();
    },

    Toggle: () => {

        $("body").toggleClass("map-open");
    },

    CreateRooms: (rooms) => {

        var row = $("<div>").appendTo("#map #rooms");

        rooms.forEach(dir => {

            var room = $("<div>").addClass("room dir-" + dir).appendTo(row);
            $("<div>").addClass("dir").text(dir == "here" ? "" : dir).appendTo(room);

            if (Input.KeyboardNavigation[dir]) room.attr("title", "Shift+" + Input.KeyboardNavigation[dir]);

            if (dir != "here") {

                $("<div>").addClass("icon remove-room").attr("title", "Remove this connection").click(Map.RemoveRoom).appendTo(room);
            }

            $("<div>").addClass("name").appendTo(room);
            $("<div>").addClass("icon here").attr("title", "You are here").appendTo(room);
            $("<div>").addClass("icon back-to-room").attr("title", "Center map back on the room you're in").click(() => Map.Draw()).appendTo(room);
            $("<div>").addClass("icon go-to-room").attr("title", "Go to this room").click(Map.GotoRoom).appendTo(room);
            $("<div>").addClass("note").appendTo(room);
            $("<div>").addClass("icon all-notes").click(Map.ShowNotes).appendTo(room).hide();

            room.click(Map.RoomClicked);
        });
    },

    CreateMiniMap: (style, exits) => {

        var d = $("<div>").addClass("row").addClass(style).appendTo("#exits");

        exits.forEach(e => {

            var ex = $("<div>").addClass("exit").addClass("dir-" + e).appendTo(d);
            $("<span>").addClass("dir-name").text(e).appendTo(ex).click(() => Input.Inject(e.toLowerCase(), true));
            $("<div>").addClass("icon room-notes").click(function() {
                
                var roomName = $(this).parent().find(".room-name").text();
                Map.ShowNotes(null, roomName);

            }).appendTo(ex).hide();

            $("<span>").addClass("room-name").appendTo(ex).click(() => Input.Inject(e, true));
        });
    },

    GetRoom: (roomName) => {

        var room = Map.Rooms.find(e => e.Name.toLowerCase() == roomName.toLowerCase());
        return room;
    },

    GotoRoom: (e, roomName) => {

        if (e) {

            e.stopImmediatePropagation();
            var room = $(e.currentTarget);
            if (room.data("room")) {

                roomName = room.data("room").Name;
            }
            else {

                var room = $(e.currentTarget).parent();
                roomName = room.find(".name").text();
            }
        }

        var route = Navigator.FindRoute(Map.CurrentRoom, roomName);
        if (route) {
            
            Input.Inject(route, true);
            if ($(window).width() < 850) Map.Toggle();
        }
    },

    RemoveRoom: (e, roomName, removeRoomItself) => {

        if (e) {

            e.stopImmediatePropagation();
            var room = $(e.currentTarget);
            if (room.data("room")) {

                roomName = room.data("room").Name;
            }
            else {

                var room = $(e.currentTarget).parent();
                roomName = room.find(".name").text();
            }
        }

        var roomToRemove = Map.GetRoom(roomName);
        var currentRoom = Map.GetRoom(Map.CurrentRoom);

        for (var e in currentRoom.Exits) {

            if (currentRoom.Exits[e] == roomToRemove.Id) {

                delete currentRoom.Exits[e];
            }
        }

        if (removeRoomItself) {
            
            var temp = [];
            Map.Rooms.forEach(r => { if (r.Id != roomToRemove.Id) temp.push(r); });
            Map.Rooms = temp;
        }

        Map.Save();
        Map.Draw();
        Map.RebuildRoomsList();
    },

    RoomClicked: (e) => {

        var room = $(e.currentTarget);
        if (!room.hasClass("shown")) return;

        var roomName = room.find(".name").text();

        Map.Draw(roomName);
    },

    Draw: (roomName) => {

        $("#map .room").removeClass("shown");
        $("#exits .exit").removeClass("shown");

        roomName = roomName || Map.CurrentRoom;
        if (!roomName) return;

        Map.DisplayedRoom = roomName;

        var room = Map.GetRoom(roomName);
        if (!room) return;

        Map.DrawRoom("here", room.Name);

        for (var dir in room.Exits) {
      
            Map.DrawRoom(dir, Map.Rooms[room.Exits[dir]].Name);
        }
    },

    DrawRoom: (dir, roomName) => {

        var room = $("#map .room.dir-" + dir);
        room.find(".name").text(roomName);
        room.find(".note").empty();
        room.find(".all-notes").hide();
        room.addClass("shown");

        room.find(".back-to-room, .go-to-room").hide();
        room.removeClass("here");

        var miniMap = $("#exits .exit.dir-" + dir);
        miniMap.find(".dir-name").attr("title", "Go to " + roomName);
        miniMap.find(".room-name").text(roomName).attr("title", "Go to " + roomName);
        miniMap.find(".room-notes").hide();
        miniMap.addClass("shown");

        if (Map.IsCurrentRoom(roomName)) {
            
            room.addClass("here");
        }
        else if (!Map.IsDisplayingCurrentRoom() && Map.DisplayedRoom.toLowerCase() == roomName.toLowerCase()) {

            room.find(".back-to-room, .go-to-room").show();
        }

        var _room = Map.GetRoom(roomName);
        if (_room && _room.Notes && _room.Notes.length > 0) {
            
            var showIcon = _room.Notes.length > 1;
            room.find(".note").text(_room.Notes[0]);
            if (_room.Notes[0].length > 15) {
                room.find(".note").empty();
                showIcon = true;
            }
            miniMap.find(".room-notes").show().attr("title", "Show " + _room.Notes.length + " note(s)");;
            if (showIcon) room.find(".all-notes").show().attr("title", "Show " + _room.Notes.length + " note(s)");

            $("#current-room-notes").hide();

            if (Map.IsCurrentRoom(roomName) && _room.Notes.length) {

                $("#current-room-notes").attr("title", "Show " + _room.Notes.length + " note(s)").show();
            }
        }

        /*
        var rotation = ((Math.random() * 2) - 1) * 0.8;
        if (Global.Prefs.MapAnimation) room.css({ transform: "rotate(" + rotation + "deg)" });
        */
    },

    ShowNotes: (e, roomName) => {

        if (e) e.stopImmediatePropagation();
        
        roomName = roomName || (e && $(e.currentTarget).parent().find(".name").text()) || Map.CurrentRoom;
        
        var room = Map.GetRoom(roomName);

        if (room) {

            var str = "<ul>";

            if (room.Notes && room.Notes.length > 0) {
                
                room.Notes.forEach(n => {
        
                    str += "<li>" + n + "</li>";
        
                });

                str += "</ul>";
            }
            else {

                str = "There are no notes here yet.";
            }
    
            Message.Show("Notes in <u>" + room.Name + "</u>", str);
        }
        else {

            Message.RoomNotFound(roomName);
        }
    },

    IsDisplayingCurrentRoom: () => Map.CurrentRoom == Map.DisplayedRoom,

    IsCurrentRoom: (roomName) => Map.CurrentRoom == roomName,

    EnteredRoom: (roomName, fromDirection) => {

        if (!roomName) return;

        if (!Map.GetRoom(roomName)) {

            Map.Rooms.push({

                Id: Map.Rooms.length,
                Name: roomName,
                Exits: {}
            });
        }

        var enteredRoom = Map.GetRoom(roomName);

        if (fromDirection) {

            var prevRoom = Map.GetRoom(Map.CurrentRoom);

            if (prevRoom && Map.AllowUpdate) {
                
                prevRoom.Exits[fromDirection.Dir] = enteredRoom.Id;

                if (Global.Prefs.AssumeTwoWayConnections && fromDirection.Opposite) {

                    enteredRoom.Exits[fromDirection.Opposite.Dir] = prevRoom.Id;
                }
            }
        }

        Map.CurrentRoom = enteredRoom.Name;

        Map.Save();
        Map.Draw();
        Map.RebuildRoomsList();
    },

    AddNote: (note) => {

        if (!note) return;

        var room = Map.GetRoom(Map.CurrentRoom);
        if (room) {

            if (!room.Notes) room.Notes = [];
            room.Notes.push(note);
        }

        Map.Save();
        Map.Draw();
        Map.RebuildRoomsList();

        Global.TrackEvent("added_note", { note: note });
    },

    ClearNotes: () => {

        var room = Map.GetRoom(Map.CurrentRoom);
        if (room) room.Notes = [];

        Map.Save();
        Map.Draw();
        Map.RebuildRoomsList();
    },

    RebuildRoomsList: () => {

        $("#map #rooms-list #container").empty();

        Map.Rooms.forEach(room => {

            var d = $("<div>").appendTo("#map #rooms-list #container").data("room", room).attr("title", "Go to " + room.Name).click(Map.GotoRoom);
            $("<div>").addClass("icon icon-eye").attr("title", "Center map on " + room.Name).data("room", room).click(Map.ShowRoom).appendTo(d);
            $("<div>").addClass("icon icon-go-to-room").attr("title", "Go to " + room.Name).data("room", room).click(Map.GotoRoom).appendTo(d);

            if (Map.CurrentRoom != room.Name) {

                $("<div>").addClass("icon icon-remove-room").attr("title", "Remove " + room.Name).click((e) => Map.RemoveRoom(e, room.Name, true)).appendTo(d);
            }

            if (room.Notes && room.Notes.length > 0) $("<div>").addClass("icon icon-note").attr("title", "Show " + room.Notes.length + " note(s)").data("room", room).click(Map.ShowNotes).appendTo(d);

            $("<div>").addClass("name").text(room.Name).appendTo(d);


            if (room.Name == Map.CurrentRoom) d.addClass("here");

        });
    },

    ShowRoom: function(e, roomName) {

        if (e) e.stopImmediatePropagation();
        roomName = roomName || $(e.currentTarget).data("room").Name;

        Map.Draw(roomName);
    },

    Save: () => {

        var mapData = JSON.stringify(Map.Rooms);
        localStorage.setItem("PM_Map_" + Parchmap.GameFilename, mapData);
    },

    Load: () => {

        var mapData = localStorage.getItem("PM_Map_" + Parchmap.GameFilename);
        if (mapData) Map.Rooms = JSON.parse(mapData);
    },

    Clear: () => {

        Map.Rooms = [];
        if (Map.CurrentRoom) Map.EnteredRoom(Map.CurrentRoom);
    }
}