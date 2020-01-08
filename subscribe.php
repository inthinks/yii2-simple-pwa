<?php

function subscribeYoutubeChannel($channel_id = null, $subscribe = true) {
    $subscribe_url = 'https://pubsubhubbub.appspot.com/subscribe';
    $topic_url = 'https://www.youtube.com/xml/feeds/videos.xml?channel_id=UCNMg6XDhRZI2QzL4pWOvP_w';
    $callback_url = 'http://' . $_SERVER['SERVER_NAME'] . str_replace(basename($_SERVER['REQUEST_URI']), '', $_SERVER['REQUEST_URI']) . 'youtube_subscribe_callback.php';

    $data = array(
        'hub.mode' => $subscribe ? 'subscribe' : 'unsubscribe',
        'hub.callback' => $callback_url,
        'hub.lease_seconds'=>60*60*24*365,
        'hub.topic'=> str_replace(array(
            '{CHANNEL_ID}'
        ), array(
            $channel_id
        ), $topic_url)
    );

    $opts = array('http' =>
        array(
            'method'  => 'POST',
            'header'  => 'Content-type: application/x-www-form-urlencoded',
            'content' => http_build_query($data)
        )
    );

    $context  = stream_context_create($opts);

    @file_get_contents($subscribe_url, false, $context);

    return preg_match('200', $http_response_header[0]) === 1;
}
