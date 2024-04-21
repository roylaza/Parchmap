const BUILD = 14;
const APPNAME = "Parchmap";
const GA_TRACK = true;

var story = Global.GetUrlParameter("story");

var parchment_options = {
    
    default_story: [ story ],
    lib_path: 'lib/',
    page_title: 0
};

console.log(APPNAME + " build " + BUILD + " by Roy Lazarovich");