var Global = {

    Prefs: {

        CRT: true,
        MapAnimation: true,
        ShowInfoOnStart: true,
        AssumeTwoWayConnections: true,
        LightMode: false
    },

    SavePrefs: () => {

        localStorage.setItem("PM_Prefs", JSON.stringify(Global.Prefs));
    },

    LoadPrefs: () => {

        if (localStorage.getItem("PM_Prefs")) {

            try {

                var prefs = JSON.parse(localStorage.getItem("PM_Prefs"));
                Global.Prefs = prefs;

                if (Global.Prefs.LightMode) Global.ToggleTheme();
            }
            catch(e) {}
        }

        /*
        if (!Parchmap.Prefs.MapAnimation) Parchmap.ToggleMapAnim();
        if (!Parchmap.Prefs.ShowInfoOnStart) Parchmap.ToggleShowInfo();
        if (!Parchmap.Prefs.AssumeTwoWayConnections) Parchmap.ToggleMap2Way();
        */
    },

    ToggleTheme: () => {

        $("body").toggleClass("light");

        Global.Prefs.LightMode = $("body").hasClass("light");
        Global.SavePrefs();
    },

    TrackEvent: (name, params) => {

        if (!GA_TRACK) return;

        if (params)
            gtag('event', name, params);
        else
            gtag('event', name);

        // $.post("log.php", { text: name + ": " + JSON.stringify(params) });
    },

    GetUrlParameter: (name, url) => {

        if (!url) url = window.location.href;
        name = name.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    }
}