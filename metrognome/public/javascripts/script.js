/*
  The code for finding out the BPM / tempo is taken from this post:
  http://tech.beatport.com/2014/web-audio/beat-detection-using-web-audio/
 */
var spotifyApi = new SpotifyWebApi();

/**
 * Shuffles array in place.
 * @param {Array} a items The array containing the items.
 * @return {Array} a The shuffled array
 */
function shuffle(a) {
    var j, x, i;
    for (i = a.length; i; i -= 1) {
        j = Math.floor(Math.random() * i);
        x = a[i - 1];
        a[i - 1] = a[j];
        a[j] = x;
    }
    return a;
}

var songs = [
  "mos def",
  "rakim eric",
  "dj shadow organ",
  "apache sugar hill gang"
  // "a tribe called quest",
  // "the roots",
  // "bombs over baghdad",
  // "ghostpoet",
  // "ghostface killah",
  // "the rza",
  // "ugly duckling",
  // "dj format abdominal"
]

var queryInput = document.querySelector('#query'),
    result = document.querySelector('#result'),
    text = document.querySelector('#text'),
    audioTag = document.querySelector('#audio');

var requestAnimFrame = (function(){
  return  window.requestAnimationFrame       ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          window.oRequestAnimationFrame      ||
          window.msRequestAnimationFrame     ||
          function(callback, element){
            window.setTimeout(callback, 1000 / 60);
          };
})();

function updateProgressBar() {
  var progressIndicator = document.getElementById('scrubber');
  if (progressIndicator && audioTag && audioTag.duration) {
    var percentage = (audioTag.currentTime * 100.0 / audioTag.duration);
    if (audioTag.currentTime < 1) {
      audioTag.volume = [0,audioTag.currentTime - 0.2, 1].sort()[1];
    } else if (audioTag.duration - audioTag.currentTime < 1) {
      audioTag.volume = [0,audioTag.duration - audioTag.currentTime - 0.2, 1].sort()[1];
    }
    progressIndicator.setAttribute('x', percentage + '%');
  }
}

setInterval(updateProgressBar, 50);

// playButton.addEventListener('click', function() {
//   // audioTag.volume = 0;
//   audioTag.play();
// });

audioTag.onended = function() {
  searchFor( shuffle(songs).pop() );
};

function searchFor(trackName) {
  // result.style.display = 'none';
  spotifyApi.searchTracks(
    trackName.trim(), {limit: 1})
    .then(function(results) {
      var track = results.tracks.items[0];
      var previewUrl = track.preview_url;
      audioTag.src = track.preview_url;

      var context = new (window.AudioContext || window.AudioContext) ();
      var request = new XMLHttpRequest();
      request.open('GET', previewUrl, true);
      request.responseType = 'arraybuffer';
      request.onload = function() {

        // Create offline context
        var OfflineContext = window.OfflineAudioContext || window.webkitOfflineAudioContext;
        var offlineContext = new OfflineContext(1, 2, 44100);

        offlineContext.decodeAudioData(request.response, function(buffer) {

          // Create buffer source
          var source = offlineContext.createBufferSource();
          source.buffer = buffer;

          // Create filter
          var filter = offlineContext.createBiquadFilter();
          filter.type = "lowpass";

          // Pipe the song into the filter, and the filter into the offline context
          source.connect(filter);
          filter.connect(offlineContext.destination);

          // Schedule the song to start playing at time:0
          source.start(0);

          var peaks,
              initialThresold = 0.98,
              thresold = initialThresold,
              minThresold = 0.4,
              minPeaks = 35;

          do {
            peaks = getPeaksAtThreshold(buffer.getChannelData(0), thresold);
            thresold -= 0.02;
          } while (peaks.length < minPeaks && thresold >= minThresold);

          var svg = document.querySelector('#svg');
          svg.innerHTML = '';
          var svgNS = 'http://www.w3.org/2000/svg';

          // var c= document.getElementById('test');
          // var ctx=c.getContext("2d");
          // var scale = 1.0;
          // ctx.fillRect(0,100,1000*scale,10);
          // ctx.fillStyle = 'white';

          var windowpeaks = [];
          peaks.forEach(function(peak) {
            var rect = document.createElementNS(svgNS, 'rect');
            var percentage = (100 * peak / buffer.length);
            if (percentage > 3 && percentage < 97) { windowpeaks.push(percentage * 10); }
            rect.setAttributeNS(null, 'x', percentage + '%');
            rect.setAttributeNS(null, 'y', 0);
            rect.setAttributeNS(null, 'width', 1);
            rect.setAttributeNS(null, 'height', '100%');
            svg.appendChild(rect);

            // ctx.fillRect((percentage*10)*scale,100,scale,10);
          });

          addStars(windowpeaks);

          var rect = document.createElementNS(svgNS, 'rect');
          rect.setAttributeNS(null, 'id', 'scrubber');
          rect.setAttributeNS(null, 'y', 0);
          rect.setAttributeNS(null, 'width', 1);
          rect.setAttributeNS(null, 'height', '100%');
          svg.appendChild(rect);
      
          svg.innerHTML = svg.innerHTML;  // force repaint in some browsers

          var intervals = countIntervalsBetweenNearbyPeaks(peaks);

          var groups = groupNeighborsByTempo(intervals, buffer.sampleRate);

          var top = groups.sort(function(intA, intB) {
            return intB.count - intA.count;
          }).splice(0,5);

          text.innerHTML = track.name + ' by ' +
            '<strong>' + track.artists[0].name;

          result.style.display = 'block';

          audioTag.play();
          updateProgressBar();
        });
      };
      request.send();
    });
}

// result.style.display = 'none';

document.querySelector('form').addEventListener('submit', function(e) {
  e.preventDefault();
  searchFor(queryInput.value);
});

// Function to identify peaks
function getPeaksAtThreshold(data, threshold) {
  var peaksArray = [];
  var length = data.length;
  for(var i = 0; i < length;) {
    if (data[i] > threshold) {
      peaksArray.push(i);
      // Skip forward ~ 1/4s to get past this peak.
      // i += 10000;
      i += 12000;
    }
    i++;
  }
  return peaksArray;
}

// Function used to return a histogram of peak intervals
function countIntervalsBetweenNearbyPeaks(peaks) {
  var intervalCounts = [];
  peaks.forEach(function(peak, index) {
    for(var i = 0; i < 10; i++) {
      var interval = peaks[index + i] - peak;
      var foundInterval = intervalCounts.some(function(intervalCount) {
        if (intervalCount.interval === interval)
          return intervalCount.count++;
      });
      if (!foundInterval) {
        intervalCounts.push({
          interval: interval,
          count: 1
        });
      }
    }
  });
  return intervalCounts;
}

// Function used to return a histogram of tempo candidates.
function groupNeighborsByTempo(intervalCounts, sampleRate) {
  var tempoCounts = [];
  intervalCounts.forEach(function(intervalCount, i) {
    if (intervalCount.interval !== 0) {
      // Convert an interval to tempo
      var theoreticalTempo = 60 / (intervalCount.interval / sampleRate );

      // Adjust the tempo to fit within the 90-180 BPM range
      while (theoreticalTempo < 90) theoreticalTempo *= 2;
      while (theoreticalTempo > 180) theoreticalTempo /= 2;

      theoreticalTempo = Math.round(theoreticalTempo);
      var foundTempo = tempoCounts.some(function(tempoCount) {
        if (tempoCount.tempo === theoreticalTempo)
          return tempoCount.count += intervalCount.count;
      });
      if (!foundTempo) {
        tempoCounts.push({
          tempo: theoreticalTempo,
          count: intervalCount.count
        });
      }
    }
  });
  return tempoCounts;
}
