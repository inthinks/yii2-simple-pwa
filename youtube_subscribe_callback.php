<?php
    if (isset($_GET['hub_challenge'])) {
        echo $_REQUEST['hub_challenge'];
    } else {

        $video = parseYoutubeUpdate(file_get_contents('php://input'));

    }

    function parseYoutubeUpdate($data) {
        $xml = simplexml_load_string($data, 'SimpleXMLElement', LIBXML_NOCDATA);
        $video_id = substr((string)$xml->entry->id, 9);
        $channel_id = substr((string)$xml->entry->author->uri, 32);
        $published = (string)$xml->entry->published;

        return array(
            'video_id'=>$video_id,
            'channel_id'=>$channel_id,
            'published'=>$published
        );
    }
