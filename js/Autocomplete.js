var Autocomplete = {

    Words: [],
    CurrentWord: "",
    CurrentToggleWord: "",
    Strip: [ "\n", ")", "(", "\"", "'", ",", ".", "!", "?", ";" ],

    UpdateWords: () => {

        // Get the 100 most recent words
        Autocomplete.Words = [];

        $("#windowport .BufferWindow .BufferLine").each(function() {

            var words = $(this).text();

            Autocomplete.Strip.forEach(symbol => {
                    
                while (words.indexOf(symbol) != -1) words = words.replace(symbol, " ");
            });
    
            words = words.split(" ");
    
            words.reverse().forEach(word => {
    
                word = word.trim();
    
                if (Autocomplete.Words.length < 100 && word.length > 1) {
    
                    if (!Autocomplete.Words.find(e => e.toLowerCase() == word.toLowerCase())) Autocomplete.Words.push(word);
                }
            });
        });
    },

    ToggleSuggestions: (text) => {

        text = text.trim();
        var wordsInInput = text.split(" ");

        if (Autocomplete.CurrentToggleWord == "") {

            Autocomplete.CurrentToggleWord = wordsInInput[wordsInInput.length - 1];
        }

        var collection = Autocomplete.Words;

        if (text.indexOf("/goto") == 0 || text.indexOf("/room-notes") == 0 || text.indexOf("/see") == 0) {

            collection = [];
            Map.Rooms.forEach(r => collection.push(r.Name));
        }

        var list = Autocomplete.GetSuggestions(Autocomplete.CurrentToggleWord, collection);

        if (list.length == 0) return;

        var pos = list.indexOf(wordsInInput[wordsInInput.length - 1]);
        pos++;

        if (pos >= list.length) pos = 0;

        var str = "";

        for (var i = 0; i < wordsInInput.length - 1; i++) {
            str += wordsInInput[i] + " ";
        }

        str += list[pos] + " "

        Input.Clear();
        Input.Inject(str);
    },

    Suggest: (text) => {

        if (text[text.length - 1] == " ") {

            Autocomplete.Clear();
            return;
        }

        var words = text.trim().split(" ");
        var lastWord = words[words.length - 1];

        if (lastWord != Autocomplete.CurrentWord && lastWord.length > 0) {

            var originalLastWord = lastWord;
            lastWord = lastWord.replace("\\", "").replace("/", "");

            Autocomplete.Clear();

            Autocomplete.CurrentWord = lastWord;

            var suggestions = [];

            if (text.indexOf("/goto") == 0 || text.indexOf("/room-notes") == 0 || text.indexOf("/see") == 0) {
                
                // When using special commands that allow for room names as parameters, show room name suggestions instead of suggestions from the story text
                var rooms = [];
                Map.Rooms.forEach(r => rooms.push(r.Name));

                suggestions = Autocomplete.GetSuggestions(lastWord, rooms);
            }
            else if (originalLastWord[0] == "/") {

                suggestions = Autocomplete.GetSuggestions(originalLastWord, Input.GetAllSpecialCommands());
            }
            else {

                suggestions = Autocomplete.GetSuggestions(lastWord);
            }

            var link = null;

            suggestions.forEach(e => {

                var title = "Click to inject '" + e + "' into the prompt, ctrl+click to inject and hit Enter";
                if (suggestions.length == 1) title = "As this is the only match, type \\ to inject '" + e + "' plus Enter into the prompt, or / to inject without Enter";

                link = $("<div>").text(e).appendTo("#autocomplete").attr("title", title).click(Autocomplete.WordClicked);
            });

            // If there is exactly one match and the user typed \ or /, select the suggestion
            if (text.length > 1 && text[text.length - 1] == "\\" && suggestions.length == 1 && link) Autocomplete.InjectWord(link.text(), true);
            if (text.length > 1 && text[text.length - 1] == "/" && suggestions.length == 1 && link) Autocomplete.InjectWord(link.text());
        }
    },

    Clear: () => {

        $("#autocomplete").empty();
        Autocomplete.CurrentWord = "";
    },

    GetSuggestions: (word, collection) => {

        if (!word) return [];

        collection = collection || Autocomplete.Words;

        return collection.filter(e => e.toLowerCase().indexOf(word.toLowerCase()) == 0).reverse();
    },

    InjectWord: (word, hitEnter) => {

        var value = $(".Input.LineInput").val();

        Input.Clear();

        var words = value.split(" ");
        for (var i = 0; i < words.length; i++) {

            if (i < words.length - 1) 
                Input.Inject(words[i] + " ");
            else {

                if (value[0] == "/") {

                    if (hitEnter)
                        Input.Inject(word + ";");
                    else
                        Input.Inject(word + " ");
                }
                else {

                    Input.Inject(word + " ", hitEnter);
                }
            }
        }
    },

    WordClicked: function(e) {

        var word = $(this).text();
        
        Autocomplete.InjectWord(word, e.ctrlKey);
    }
}