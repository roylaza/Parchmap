var Message = {

    IsOpen: false,
    NoTypeToClose: false,

    Init: () => {

        $("#message #close").click(Message.Hide);

        if (!Global.GetUrlParameter("story")) {

            Message.Show("No story selected", "Please <a href='index.html'>click here</a> to select a story to play");
            $("#parchment .panel, #map").hide();
            $("#message footer, #message #close").hide();
        }
        else {

            if (!location.hash && !localStorage.getItem("PM_Save_" + Parchmap.GameFilename) && Global.Prefs.ShowInfoOnStart) Message.ShowHelp();
        }
    },

    Show: (title, body, disabledTypeToClose) => {

        Message.NoTypeToClose = disabledTypeToClose || false;

        if (disabledTypeToClose)
            $("#message footer").hide();
        else
            $("#message footer").show();

        Input.Clear();

        setTimeout(() => {
            
            Message.IsOpen = true;
            Input.Focus();

        }, 300);

        $("#message").find("h2").empty().html(title);
        $("#message").find("> div").empty().html(body);

        $("#message").addClass("show");
    },

    Hide: () => {

        Input.Clear();
        Message.IsOpen = false;

        $("#message").removeClass("show");
    },

    RoomNotFound: (roomName) => {

        Message.Show("404 Room not found", "Whoops!, we couldn't find a room named <u>" + roomName + "</u>");
    },

    ShowHelp: () => {

        var title = "Welcome to " + APPNAME;
        var body = "";

        body += "<a class='watch-video' href='https://youtu.be/xB-8oJiFzEs' target='_blank'><div>Watch Video</div></a>";
        body += "<p>" + APPNAME + " is an awesome program built around the <i>Parchment</i> interactive fiction interpreter that offers some quality of life improvements such as automatic mapping, note taking, quick navigation to known rooms, and auto complete.</p>";

        body += "<p>Here is a list of special commands you can type at the prompt, simply type the command without pressing Enter, " + APPNAME + " is always watching the prompt and will pick it up.</p>";

        body += "<ul>";
        body += "<li>Type <span class='code'>/help</span> to show this screen again.</li>";
        body += "<li>Type <span class='code'>/map</span> (or press `) to show the map, press Escape or ` to hide the map.</li>";
        body += "<li>Type <span class='code'>/clear map</span> to erase the map and start over starting from the room you're in.</li>";
        body += "<li>Type <span class='code' title='Example: /note locked room here;'>/note [text];</span> (note the semi-colon) to add a note about something important or interesting in the room.</li>";
        body += "<li>Type <span class='code'>/notes</span> to read all the notes you kept in the room you're in.</li>";
        body += "<ul><li>Type <span class='code' title='Example: /room-notes the kitchen;'>/room-notes [room name];</span> (note the semi-colon) to read all the notes in a different room.</li></ul>";
        body += "<li>Type <span class='code'>/clear notes</span> to erase all the notes in the room you're in.</li>";
        body += "<li>Type <span class='code' title='Example: /goto the kitchen;'>/goto [room name];</span> (note the semi-colon) to have " + APPNAME + " automatically navigate you to a known room using an incredibly smart (not really) algorithm.</li>";
        body += "<li>Type <span class='code' title='Example: /see the kitchen;'>/see [room name];</span> (note the semi-colon) to center the map on a particular room.</li>"; 
        body += "<ul><li>Type <span class='code'>/see me;</span> (note the semi-colon) to center the map back on the room you're in.</li></ul>"; 
        body += "<li>Type <span class='code'>/theme</span> to toggle between light and dark color themes.</li>";
        body += "<li>Type <span class='code'>/quit</span> to go back to the games list.</li>";
        body += "<li>Enter <span class='code'>save</span> or <span class='code'>restore</span> to save or restore your game.</li>";
        body += "<li>Start typing to see auto complete suggestions. When you type special commands that accept room names as parameters (such as /goto and /room-notes) you'll get room names as suggestions.</li>";
        body += "<ul><li>Click a suggestion to inject it into the prompt.</li>";
        body += "<li>Ctrl+click to inject it and automatically hit Enter.</li>";
        body += "<li>If there is exactly one suggestion, type \\ to inject it and hit Enter, and / to inject it without Enter.</li></ul>";
        body += "<li>Press <span class='code'>Shift</span> + one of the keys on the numeric keypad to inject directions, substitute <span class='code'>/</span> or <span class='code'>*</span> for the up arrow and <span class='code'>Del</span> for the down arrow.</li>";
        body += "</ul>";

        if (Global.Prefs.ShowInfoOnStart) {

            body += "<p><button id='dont-show'>Don't show this message anymore</button></p>";
        }
        else {

            body += "<p><button id='do-show'>Show this message at startup</button></p>";
        }

        // body += "<p>This message will not appear automatically if the 'Show help at start' preference is turned off.</p>";

        Message.Show(title, body);

        $("#dont-show").click(() => {

            Global.Prefs.ShowInfoOnStart = false;
            Global.SavePrefs();

            Message.Show("Ok, help screen hidden", "Remember, you can always display the help screen, and set it to show at startup again, by typing <span class='code'>/help</span>")
        });

        $("#do-show").click(() => {

            Global.Prefs.ShowInfoOnStart = true;
            Global.SavePrefs();

            Message.Show("Ok, help screen restored", "You'll see the help screen at startup")
        });
    }
}