var Input = {

    KeyboardNavigation: {

        n: "/ or *",
        s: "Del",
        w: "Left Arrow",
        e: "Right Arrow",
        ne: "PageUp",
        se: "PageDown",
        sw: "End",
        nw: "Home"
    },

    Value: () => $(".Input.LineInput").val(),

    Inject: (text, hitEnter) => {

        $(".Input.LineInput").val($(".Input.LineInput").val() + text);
        if (hitEnter) {

            $(".Input.LineInput").trigger($.Event( "keypress", { which: 13 } ));
            setTimeout(() => Input.Clear(), 100);
        }
    },

    Clear: () => {

        $(".Input.LineInput").val("");
    },

    Focus: () => {

        $(".Input.LineInput").focus();
    },

    BindKeyboard: () => {

        $("body").unbind().keydown(Input.KeyPressed);
    },

    KeyPressed: (e) => {

        if (Message.IsOpen && !Message.NoTypeToClose) {
            
            Message.Hide();
            setTimeout(() => Input.Clear(), 100);
        }

        if (e.shiftKey) {

            switch(e.key) {

                case "/": Input.Clear(); Input.Inject("n", true); break;
                case "*": Input.Clear(); Input.Inject("n", true); break;
                case "ArrowUp": Input.Clear(); Input.Inject("n", true); break;
                case "ArrowDown": Input.Clear(); Input.Inject("s", true); break;
                case "Delete": Input.Clear(); Input.Inject("s", true); break;
                case "ArrowLeft": Input.Clear(); Input.Inject("w", true); break;
                case "ArrowRight": Input.Clear(); Input.Inject("e", true); break;
                case "PageUp": Input.Clear(); Input.Inject("ne", true); break;
                case "PageDown": Input.Clear(); Input.Inject("se", true); break;
                case "End": Input.Clear(); Input.Inject("sw", true); break;
                case "Home": Input.Clear(); Input.Inject("nw", true); break;
            }
        }
        else {
            
            switch(e.key) {
                
                case "`": 
                
                    setTimeout(() => {

                        if (Input.Value().length == 1) {
    
                            Input.Clear(); Map.Toggle(); 
                        }

                    }, 100);

                break;

                case "Escape": Input.Clear(); Map.Hide(); break;
            }
        }
    },

    Clear: () => {

        $(".Input.LineInput").val("");
    },

    GetLastDirection: () => {

        var dir = null;

        // Scan backwards and get the text that was added after the last input
        $($(".Style_input").get().reverse()).each(function() {

            var line = $(this);

            var text = line.text().trim().toLowerCase();
    
            if (Directions[text]) {

                dir = Directions[text];
                return false;
            }
        });

        return dir;
    },

    SpecialCommandDetected: (text) => {

        Input.Clear();
        Global.TrackEvent("entered_command", { command: text });
    },

    GetAllSpecialCommands: () => {

        return [ "/help", "/map", "/note", "/clear", "/goto", "/notes", "/room-notes", "/quit", "/see", "/theme" ].sort();
    },

    Process: () => {

        var value = $(".Input.LineInput").val();
        if (!value) {
         
            Autocomplete.Clear();
            return;
        }

        if (Message.IsOpen && !Message.NoTypeToClose) Message.Hide();

        var text = value.trim();
        var lastChar = text[text.length - 1];

        if (text.length > 1 && text[0] == "/") {

            if (text.toLowerCase() == "/help") {

                Input.SpecialCommandDetected(text);
                Message.ShowHelp();
            }
            if (text.toLowerCase() == "/map") {

                Input.SpecialCommandDetected(text);
                Map.Show();
            }
            else if (text.toLowerCase() == "/clear map") {

                Input.SpecialCommandDetected(text);
                Map.Clear();
            }
            else if (text.toLowerCase() == "/clear notes") {

                Input.SpecialCommandDetected(text);
                Map.ClearNotes();
            }
            else if (text.toLowerCase() == "/theme") {
                
                Input.SpecialCommandDetected(text);
                Global.ToggleTheme();
            }
            else if (text.toLowerCase() == "/notes") {

                Input.SpecialCommandDetected(text);
                Map.ShowNotes();
            }
            else if (text.toLowerCase() == "/quit") {

                Input.SpecialCommandDetected(text);
                location.href="index.html";
            }
            else if (text.toLowerCase().includes("/room-notes") && lastChar == ";") {

                Input.SpecialCommandDetected(text);
                var roomName = text.replace("/room-notes", "").replace(";", "").trim();
                Map.ShowNotes(null, roomName);
            }
            else if (text.toLowerCase().includes("/goto") && lastChar == ";") {

                Input.SpecialCommandDetected(text);
                var roomName = text.replace("/goto", "").replace(";", "").trim();
                var room = Map.GetRoom(roomName);

                if (room) {

                    var route = Navigator.FindRoute(Map.CurrentRoom, room.Name);
                    if (route) Input.Inject(route, true);
                }
                else {

                    Message.RoomNotFound(roomName);
                }
            }
            else if (text.toLowerCase().includes("/see") && lastChar == ";") {

                Input.SpecialCommandDetected(text);
                var roomName = text.replace("/see", "").replace(";", "").trim();

                if (roomName.toLowerCase() == "me") {

                    Map.Draw();
                }
                else {

                    var room = Map.GetRoom(roomName);
    
                    if (room) {
    
                        Map.Draw(roomName);
                    }
                    else {
    
                        Message.RoomNotFound(roomName);
                    }
                }
            }
            else if (text.toLowerCase().includes("/note") && lastChar == ";") {

                Input.SpecialCommandDetected(text);
                var note = text.replace("/note", "").replace(";", "");

                Map.AddNote(note);
            }
        }

        Autocomplete.Suggest(value);
    }
}