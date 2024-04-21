<?php

    $fp = fopen('events.log', 'a');
    fwrite($fp, $_POST['text'] . "\r\n");
    fclose($fp);

?>