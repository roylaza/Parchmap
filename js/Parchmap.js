var Parchmap = {

    GameFilename: "",
    GameId: "",
    LoopReference: null,
    ContentHeight: 0,
    ContentLength: 0,
    ScrollInit: false,

    Init: () => {

        Global.LoadPrefs();
        Parchmap.SetTitle();
        Message.Init();
        Input.BindKeyboard();

        setTimeout(() => {

            Parchmap.SetupUI();
            Parchmap.Loop();

        }, 100);

        $(window).resize(Parchmap.UpdateUI);

        /*
        var saveHash = localStorage.getItem("PM_Save_" + Parchmap.GameFilename);
        if (saveHash) location.hash = saveHash;
        */

        /*
        window.onerror = function(error, url, line) {

            Message.Show("A wild error has appeared!", "Looks like something went wrong, here is what we know:<br><br>" + error);
        };
        */
    },

    Loop: () => {

        clearTimeout(Parchmap.LoopReference);

        if (!Parchmap.ScrollInit && $("#windowport .BufferWindow").text().length > 0) {

            Parchmap.ScrollInit = true;
            
            // new SimpleBar($('#windowport .BufferWindow')[0]);
        }

        Input.Process();
        Parchmap.ScrollToBottom();

        // if (Global.Prefs.MapAnimation) Map.Draw(Map.DisplayedRoom);

        var contentLength = $("#windowport .BufferWindow").text().length;
        if (contentLength != Parchmap.ContentLength) {

            Parchmap.ContentLength = contentLength;
            Autocomplete.UpdateWords();
            Parchmap.GetRoom();
        }

        Parchmap.LoopReference = setTimeout(Parchmap.Loop, 200);
    },

    SetupUI: () => {

        $("#map footer").text(APPNAME + " build " + BUILD + " by Roy Lazarovich");
        $("#map #info-hide").click(Parchmap.HideInfo);
        $("#toggle-crt").click(Parchmap.ToggleCRT);
        $("#toggle-map-anim").click(Parchmap.ToggleMapAnim);
        $("#toggle-show-info").click(Parchmap.ToggleShowInfo);
        $("#toggle-map-2way").click(Parchmap.ToggleMap2Way);
        $("#control-panel .inject").click(Parchmap.InjectButtonClicked);
        $("#import-export").click(Parchmap.ImportExport);

        Map.Build();
        Map.Load();
    },

    ToggleMapAnim: (e) => {

        if (e) Global.Prefs.MapAnimation = !Global.Prefs.MapAnimation;

        if (Global.Prefs.MapAnimation) 
            $("#toggle-map-anim").addClass("on");
        else
            $("#toggle-map-anim").removeClass("on");

        Global.SavePrefs();
    },

    ToggleShowInfo: (e) => {

        if (e) Global.Prefs.ShowInfoOnStart = !Global.Prefs.ShowInfoOnStart;

        if (Global.Prefs.ShowInfoOnStart) 
            $("#toggle-show-info").addClass("on");
        else
            $("#toggle-show-info").removeClass("on");

        Global.SavePrefs();
    },

    ToggleMap2Way: (e) => {

        if (e) Global.Prefs.AssumeTwoWayConnections = !Global.Prefs.AssumeTwoWayConnections;

        if (Global.Prefs.AssumeTwoWayConnections) 
            $("#toggle-map-2way").addClass("on");
        else
            $("#toggle-map-2way").removeClass("on");

        Global.SavePrefs();
    },

    SetTitle: () => {

        Parchmap.GameFilename = window.location.search.split("games/")[1];
        var game = GameList.find(e => e.Filename == Parchmap.GameFilename);

        if (game) {
            
            $("#map h1").text(game.Title);

            $("#loadingpane > div").text("Loading " + game.Title + "...");

            if (game.Subtitle) $("#map h2").text(game.Subtitle);
            if (game.Author) $("#map h3").text("By " + game.Author);

            $("title").text(game.Title + " - " + APPNAME);
        }
        else {
            
            $("#map h1").text($("title").text().replace("- Parchment", ""));
        }
    },

    ScrollToBottom: () => {

        var p = $("#parchment .simplebar-content-wrapper")[0];

        if (p) {

            if (p.scrollHeight != Parchmap.ContentHeight) {

                Parchmap.ContentHeight = p.scrollHeight;
                $("#parchment .simplebar-content-wrapper").animate( { scrollTop: p.scrollHeight }, 0 );
            }
        }
    },

    GetRoom: () => {

        var roomName = "";

        $("#windowport .GridLine span").each(function() {

            var text = $(this).text().trim().split("  ")[0].trim();
            if (!roomName && text.length > 0) roomName = text;
        });

        /*
        var rooms = $("#windowport .Style_subheader");
        roomName = rooms.last().text();
        */

        if (!roomName || roomName.length > 50) return;

        if (roomName != Map.CurrentRoom) {

            Map.EnteredRoom(roomName, Input.GetLastDirection());
        }
    },

    InjectButtonClicked: function() {

        var inject = $(this).data("inject");
        if (inject) {
         
            Input.Clear();
            Input.Inject(inject, true);
        }
    },

    ImportExport: () => {

        if (!Parchmap.GameId) {

            Input.Clear();
            Input.Inject("restore", true);

            $("#dialog_buttonrow #dialog_cancel").trigger("click");

            Parchmap.ImportExport();
            return;
        }

        var title = "Import\\Export";

        var body = "On this screen you'll be able to grab your saved game and map data and transfer them by e-mail to be later imported on another computer, and you'll be able to import saved game and map data previously exported.";
        body += "<h3>What would you like to do today?</h3>";
        
        body += "<button id='button-import' class='large-button' style='margin-right: 20px'>Import</button>";
        body += "<button id='button-export' class='large-button'>Export</button>";

        Message.Show(title, body);

        $("#button-import").unbind().click(Parchmap.Import);
        $("#button-export").unbind().click(Parchmap.Export);
    },

    Import: () => {

        var title = "Import";

        body = "<h3>How to Import</h3>"

        body += "<ol><li>Paste the entire text you've copied in a previous export operation into the box below.</li>";
        body += "<li>Click <span class='code'>Import</span>.</li>";
        body += "<li>The restore game screen will automatically display.</li>";
        body += "<li>Select your newly imported saved game, the map will also be updated.</li></ol>";

        body += "<textarea id='the-box'></textarea>";

        body += "<button id='button-import' class='large-button'>Import</button>";

        Message.Show(title, body, true);

        $("#button-import").unbind().click(Parchmap.ImportData);

    },

    ImportData: () => {

        var data = JSON.parse($("#the-box").val());

        if (data.Map) Map.Rooms = data.Map;
        if (data.Save) {

            data.Save.forEach(k => {

                localStorage.setItem(k.Key, k.Data);
            });
        }

        Map.Save();
        Map.Draw();

        Message.Hide();

        Input.Clear();
        Input.Inject("restore", true);
    },

    Export: () => {

        var title = "Export";

        body = "<h3>How to Export</h3>"

        body += "<ol><li>Click inside the box below to automatically select all text.</li>";
        body += "<li>Press <span class='code'>CTRL+C</span> to copy the text to your clipboard.</li>";
        body += "<li>Paste the text in an e-mail message or any other way you can think of to transfer text.</li>";
        body += "<li>Click <span class='code'>Import\\Export</span> in the PC you wish to import to and follow the instructions.</li></ol>";

        body += "<textarea id='the-box' onclick='this.focus();this.select()'></textarea>";

        setTimeout(() => {

            $("#the-box").val(Parchmap.GetSaveData());

        }, 100);

        Message.Show(title, body, true);
    },

    GetSaveData: () => {

        var s = [];

        Object.keys(localStorage).forEach(k => {

            if (k.indexOf(Parchmap.GameId) != -1) {

                s.push({Key: k, Data: localStorage.getItem(k)});
            }

        });

        var o = {

            Map: Map.Rooms,
            Save: s
        };

        return JSON.stringify(o);
    }
}

$(document).ready(Parchmap.Init);
