var MainMenu = {

    CurrentFilterOptions: "",

    Init: () => {

        Global.LoadPrefs();
        MainMenu.UpdateUI();
        $("#message #close").click(Message.Hide);
        $("#show-all").hide();

        setTimeout(() => {

            MainMenu.SetupUI();
            MainMenu.LoadGameList();

        }, 100);

        $(window).resize(MainMenu.UpdateUI);

        window.onerror = function(error, url, line) {

            Message.Show("A wild error has appeared!", "Looks like something went wrong, here is what we know:<br><br>" + error);
        };

        $("a").each(function() { 
            if ($(this).attr("title") && $(this).attr("title").includes("000webhost.com")) {
                $(this).parent().remove();
            }
        });
    },

    SetupUI: () => {

        MainMenu.UpdateUI();
        $("footer").text("Parchmap build " + BUILD + " by Roy Lazarovich");
        $("#filter").on("input", MainMenu.FilterGameList);
        $("#filter-options div, #show-all").click(MainMenu.FilterOptionClicked);
        $("#toggle-theme").click(MainMenu.ToggleTheme);
        $("#import").click(MainMenu.Import);
    },

    ToggleTheme: () => {

        $("body").toggleClass("light");

        Global.Prefs.LightMode = $("body").hasClass("light");
        Global.SavePrefs();
    },

    UpdateUI: () => {

        $(".TextGrid.status").attr('style', 'width: ' + ($("#games-list").width() - 2) + 'px !important');
    },

    LoadGameList: () => {

        var starred = [];
        var done = [];
        
        var d = localStorage.getItem("PM_Games_Starred");
        if (d) starred = JSON.parse(d);

        var d = localStorage.getItem("PM_Games_Done");
        if (d) done = JSON.parse(d);

        $("#games-list").empty();

        // Add starred games at top of list
        GameList.filter(e => e.Filename && starred.includes(e.Filename)).forEach(game => MainMenu.AddGame(game, starred, done));

        // Add the rest of the games
        GameList.filter(e => e.Filename && !starred.includes(e.Filename)).forEach(game => MainMenu.AddGame(game, starred, done));

        MainMenu.FilterGameList();

        // $('#windowport').slimScroll({height: '100%'});
    },

    AddGame: (game, starred, done) => {

        // var g = $("<div>").addClass("game").data("game", game).click(() => MainMenu.LoadGame(game)).appendTo("#parchment #games-list");
        var g = $("<div>").addClass("game").data("game", game).appendTo("#windowport #games-list");

        var s = $("<div>").addClass("icon fav").attr("title", "Star\\Unstar " + game.Title).click(MainMenu.StarStory).appendTo(g);
        if (starred && starred.includes(game.Filename)) s.addClass("on");
        
        var c = $("<a>").attr("href", "play.html?story=games/" + game.Filename).appendTo(g);
        
        var title = $("<div>").addClass("title").appendTo(c);
        $("<div>").text(game.Title).appendTo(title);

        //if (localStorage.getItem("PM_Save_" + game.Filename)) $("<img>").addClass("save-icon").attr("src", "img/icon-save.svg").appendTo(title);

        if (game.Subtitle) $("<div>").text(game.Subtitle).addClass("subtitle").appendTo(c);
        if (game.Author) $("<div>").text("By " + game.Author).addClass("author").appendTo(c);

        var d = $("<div>").addClass("icon done").attr("title", "Mark\\Unmark " + game.Title + " as done").click(MainMenu.DoneStory).appendTo(g);
        if (done && done.includes(game.Filename)) d.addClass("on");
    },

    UpdateTitle: () => {

        var listing = $("#games-list .game").not(".filtered").length;
        var all = GameList.filter(e => e.Filename).length;

        var title = (listing == all) ? "Listing " + all + " stories" : "Listing " + listing + " of " + all + " stories";

        $(".status tt").text(title);
    },

    StarStory: function() {

        $(this).toggleClass("on");

        if ($(this).hasClass("on")) {

            var title = $(this).parent().find(".title").text();
            
            if (title) Global.TrackEvent("story_starred", { story: title });
        }

        MainMenu.SaveGameFlags();
    },

    DoneStory: function() {

        $(this).toggleClass("on");

        if ($(this).hasClass("on")) {

            var title = $(this).parent().find(".title").text();
            
            if (title) Global.TrackEvent("story_completed", { story: title });
        }

        MainMenu.SaveGameFlags();
    },

    SaveGameFlags: () => {

        var starred = [];
        var done = [];

        $("#games-list .game .fav.on").each(function() {

            starred.push($(this).parent().data("game").Filename);
        });

        $("#games-list .game .done.on").each(function() {

            done.push($(this).parent().data("game").Filename);
        });

        localStorage.setItem("PM_Games_Starred", JSON.stringify(starred));
        localStorage.setItem("PM_Games_Done", JSON.stringify(done));
    },

    FilterOptionClicked: function() {

        $("#show-all").hide();

        var filter = $(this).data("filter");

        if (filter == MainMenu.CurrentFilterOptions || filter == "all") {

            MainMenu.CurrentFilterOptions = "";
            $("#games-list .game").removeClass("filtered");
            MainMenu.UpdateTitle();
            return;
        }

        $("#filter").val("");

        MainMenu.CurrentFilterOptions = filter;

        $("#games-list .game").addClass("filtered");

        switch(filter) {

            case "fav":
                $("#games-list .game .fav.on").parent().removeClass("filtered");
            break;

            case "done-on":
                $("#games-list .game .done.on").parent().removeClass("filtered");
            break;

            case "done-off":
                $("#games-list .game .done").not(".on").parent().removeClass("filtered");
            break;
        }

        MainMenu.UpdateTitle();

        if ($("#games-list .game.filtered").length > 0) $("#show-all").show();
    },

    FilterGameList: () => {

        MainMenu.CurrentFilterOptions = "";
        $("#show-all").hide();

        var filter = $("#filter").val().toLowerCase();
        
        $("#games-list .game").removeClass("filtered").each(function() {

            var game = $(this).data("game");
    
            var f = {
    
                Title: game.Title || "",
                Subtitle: game.Subtitle || "",
                Author: game.Author || ""
            }

            if ((!f.Title.toLowerCase().includes(filter) && !f.Subtitle.toLowerCase().includes(filter) && !f.Author.toLowerCase().includes(filter))) $(this).addClass("filtered")
        });

        MainMenu.UpdateTitle();
    },

    Import: () => {
        
        var title = "Import your own story";
        var body = "<input id='file-upload' type='file' size='60' accept='.z3,.z5,.z8,.zblorb'><br><br>";
        body += "<div id='file-error' style='display: none'>Incompatible file selected!<br><br></div>";
        body += "click above and select a .z3, .z5, .z8, or .zblorb file from your computer, once your file has uploaded, your story will be processed and launched.<br><br>";
        body += "Bookmark the page that will launch to return to your story at a later date, notice that you will lose your game and map state if you re-upload your story instead of using the bookmark.<br><br>";
        body += "If this is your own story (or it's a story that is freely available), it performs well with Parchmap, and you'd like to add it to the supported games list, please e-mail me at roylaza(at)gmail.com (replace (at) with you know what), and let me know its filename, title, subtitle (optional) and author name.";

        Message.Show(title, body);

        $('#file-upload').change(async ev => {

            const file = $('#file-upload').get(0).files[0]

            var filename = file.name.split(".")[0];
            var extension = file.name.split(".")[1];

            if (!["z3","z5","z8","zblorb"].includes(extension)) {

                $("#file-error").show();
                return;
            }

            const data = new Uint8Array(await file.arrayBuffer())
            const textdata = Array.from(data).map(x => String.fromCharCode(x)).join('')
            const result = `processBase64Zcode('${btoa(textdata)}')`;

            Global.TrackEvent("story_imported", { filename: file.name });

            $.post("upload.php", { filename: filename, extension: extension, data: result }, (filename) => {

                location.href = "play.html?story=user/" + filename;
            });
        });
    }
}

$(document).ready(MainMenu.Init);