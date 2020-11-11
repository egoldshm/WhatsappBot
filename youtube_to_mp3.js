var YoutubeMp3Downloader = require("youtube-mp3-downloader");

module.exports = youtube_mp4_downloader = async (url, func) => {
    if (url.includes("youtube.com/watch?v")) {
        var video_id = url.split('v=')[1];
        var ampersandPosition = video_id.indexOf('&');
        if (ampersandPosition != -1) {
            video_id = video_id.substring(0, ampersandPosition);
        }
    }
    //Configure YoutubeMp3Downloader with your settings
    var YD = new YoutubeMp3Downloader({
        "ffmpegPath": "/youtube_files/ffmp",        // FFmpeg binary location
        "outputPath": "/youtube_files/mp3",    // Output file location (default: the home directory)
        "youtubeVideoQuality": "highestaudio",  // Desired video quality (default: highestaudio)
        "queueParallelism": 2,                  // Download parallelism (default: 1)
        "progressTimeout": 2000,                // Interval in ms for the progress reports (default: 1000)
        "allowWebm": false                      // Enable download from WebM sources (default: false)
    });

    //Download video and save as MP3 file
    YD.download(video_id);

    YD.on("finished", func);

    /*YD.on("error", function (error) {
        console.log(error);
    });*/

    YD.on("progress", function (progress) {
        console.log(JSON.stringify(progress));
    });
}

youtube_mp4_downloader("https://www.youtube.com/watch?v=j5GCzFWWR9g", (err, data) => {
    console.log(JSON.stringify(data));
})