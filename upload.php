<?php

    $filename = str_replace(" ", "-", $_POST["filename"]) . "_" . time() . "." . $_POST["extension"] . ".js";

    file_put_contents("user/" . $filename, $_POST["data"]);

    echo $filename;

?>