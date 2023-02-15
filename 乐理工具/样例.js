// create environment -- audio context
// define variables

var AudioContext = window.AudioContext || window.webkitAudioContext;
var audioCtx;
var source;
var AudioURL;
try {
    audioCtx = new AudioContext();
    console.log('support');
    console.log(audioCtx)

} catch (e) {
    alert('Your browser does not support AudioContext!');
    console.log(e);
}

// use XHR to load an audio track, and
// decodeAudioData to decode it and stick it in a buffer.
// Then we put the buffer into the source

var getData = function() {
    // create audio node to play the audio in the buffer
    source = audioCtx.createBufferSource();
    console.log(source)

    // 请求
    var request = new XMLHttpRequest();

    //初始化 HTTP 请求参数, 配置请求类型，文件路径等
    request.open('GET', AudioURL, true);

    // 配置数据返回类型,从服务器取回二进制数据
    request.responseType = 'arraybuffer';

    // 获取完成，对音频进一步操作，解码
    request.onload = function() {
        var audioData = request.response;
        audioCtx.decodeAudioData(audioData, function(buffer) {
                source.buffer = buffer;

                source.connect(audioCtx.destination);
                source.loop = true;
            },
            function(e) { console.log("Error with decoding audio data" + e.err); });
    };

    // 发送一个 HTTP 请求
    request.send();
};

// play audio
AudioURL = "https://m801.music.126.net/20230214183151/5f2cc5224be8e0de789a03216eaf2d82/jdyyaac/obj/w5rDlsOJwrLDjj7CmsOj/11577594020/d595/011e/fe9e/f67004c7d498ea6d74134b8412372014.m4a"
getData();
source.start(0);