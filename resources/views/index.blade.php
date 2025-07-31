<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf8mb4">
        <meta name="viewport" content="width=device-width, user-scalable=0">
        <meta name="theme-color" content="#1c1c84">
        <meta property="og:description" content="{{ $description }}">
        <meta property="og:image" content="{{ $img['src'] }}">
        <meta property="og:image:height" content="{{ $img['height'] }}">
        <meta property="og:image:width" content="{{ $img['width'] }}">
        <meta property="og:site_name" content={{ $siteName }} />
        <meta property="og:title" content="{{ $title }}">
        <meta property="og:type" content="website" />
        <meta property="og:url" content="{{ $url }}">
        <meta name="description" content="{{ $description }}">
        <meta name="keywords" content="{{ $keywords }}">
        <meta name="title" content="{{ $title }}">
        <link rel="canonical" href="{{ $url }}" />
        <link rel="home" href="{{ $baseUrl }}" />
        <link rel="manifest" href="/manifest.json">
        <link rel="shortcut icon" href="/favicon.ico?v=1">
        <link rel="apple-touch-icon" sizes="128x128" href="/favicon.ico?v=1">
        <title>{{ $title }}</title>
    </head>
    <body>
        <noscript>
            You need to enable JavaScript to run this app.
        </noscript>
        <div id="root"></div>
    </body>
    <script>
        var sc_project=13154329;
        var sc_invisible=1; 
        var sc_security="cd76c3d0"; 
    </script>
    <script src="https://www.statcounter.com/counter/counter.js" async></script>
    <script src="/static/js/bundle.js?v=1"></script>
</html>
