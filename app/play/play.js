'use strict';

app.controller('playCtrl', ['$scope', '$location','ScoreBoard','RequestSpotify', '$timeout', function($scope, $location, ScoreBoard, RequestSpotify, $timeout){
  var vm = this;

  vm.letter = ScoreBoard.randomLetter();
  vm.answer = "";
  vm.score = ScoreBoard.getScore();
  vm.valid = false;
  vm.invalid = false;

  vm.album = {
    correct : false
  };


  vm.submitAnswer = function(artist) {
    //validation
    if (vm.answerForm.$valid) {
      //if the first letter and the first letter of the answer match
      if(vm.answer[0].toLowerCase() === vm.letter.toLowerCase()) {
        //if the answer was repeated or wrong
        RequestSpotify.searchArtist(artist);
      } else {
        alert('you submitted an answer that does not use the first letter');
        console.log('wrong letter');
        ScoreBoard.inputAnimation('invalid', vm);
        $timeout(function () {
          RequestSpotify.gameover();
        }, 1100);
      }
    }
    //no answer submitted
    else {
      alert('you did not try to answer');
      console.log('no answer');
      //invalid animation
      ScoreBoard.inputAnimation('invalid', vm);
      $timeout(function () {
        RequestSpotify.gameover();
      }, 1100);
    }
  };
  // watch the score keeping it updated
  $scope.$watch(
    function(){
    return ScoreBoard.getScore();
    },
    function(newScore,oldScore) {
      vm.score = newScore;
      vm.letter = ScoreBoard.randomLetter();
      vm.answer = "";
      vm.album.image = RequestSpotify.getArtistImage();
      vm.album.correct = true;
     // $timeout(function(){vm.album.correct = false}, 5000);
      //add validation
  });
  $scope.$watch(function(){
    return RequestSpotify.getWrongState();
  },function(newValue, oldValue){
    //console.log('Wrong State newValue');
    //console.log(newValue);
    //console.log('Wrong State oldValue');
    //console.log(oldValue);
    vm.invalid = newValue;
  });
  $scope.$watch(function(){
    return RequestSpotify.getCorrectState();
  },function(newValue, oldValue){
   // console.log('Wrong State newValue');
    //console.log(newValue);
    //console.log('Wrong State oldValue');
    //console.log(oldValue);
    vm.valid = newValue;
  });
}])


.factory('ScoreBoard', ScoreBoard)
.factory('RequestSpotify', RequestSpotify);

function ScoreBoard (Spotify, $cookieStore, $timeout, $location){
  var data = {
    getScore : getScore,
    getHighScore : getHighScore,
    updateScore : updateScore,
    startOver : startOver,
    randomLetter : randomLetter,
    inputAnimation : inputAnimation
  };

  var currentScore = 0;
  var highScore = parseInt($cookieStore.get('highScore')) || 0;

  function getScore(){
    return currentScore;
  }
  function getHighScore(){
    return parseInt($cookieStore.get('highScore')) || 0;
  }

  function inputAnimation (validation, vm){
    vm[validation] = true;
    $timeout(function(){
      vm[validation] = false;
    },1000);
  }

  function updateScore(){
    currentScore++;
    if (currentScore > highScore) {
      highScore = currentScore;
      // Set on the cookie
      $cookieStore.put('highScore', highScore);
    }
  }

  function randomLetter(){
    var chars = "ABCDEFGHIJKLMNOPQRSTUVWXTZ";
    var rnum = Math.floor(Math.random() * chars.length);
    return chars.substring(rnum,rnum+1);
  }

  function startOver(){
    currentScore = 0;
  }

  return data;
};

function RequestSpotify(Spotify, ScoreBoard, $location, $timeout){
  var obj = {
    searchArtist : searchArtist,
    getPrevArtist : getPrevArtist,
    previousAnswer : previousAnswer,
    getList : getList,
    gameover : gameover,
    getCorrectState : getCorrectState,
    getWrongState : getWrongState,
    updateState : updateState,
    getArtistImage : getArtistImage

   // searchTopTrack : searchTopTrack
  };

  var queryNameList = [];
  var list = [];
  var correct = false;
  var wrong;
  var artistImage;

  var prevArtist = null;

  function getCorrectState(){
    return correct;
  }

  function getWrongState(){
    return wrong;
  }

  function updateState(state){
    state = true;
    $timeout(function(){
      state = false;
    }, 1100)
  }

  function getArtistImage(){
    return artistImage;
  }
  function previousAnswer(artist, list) {
    for(var i = 0, ii = list.length;  i < ii; i++) {
      if(artist === list[i]) {
        prevArtist = true;
        return prevArtist;
      }
    }
    prevArtist = false;
    return prevArtist;
  }

  function getList () {
    return list;
  }
  function getPrevArtist () {
      return prevArtist;
  }


  function gameover (){
    list = [];
    $location.path('/gameover');
  }


  function searchArtist(artist) {
    var artist = artist.toLowerCase();

    //console.log(list);
    previousAnswer(artist, list);
    //console.log(prevArtist);
    //console.log(!prevArtist);
    //queries spotify for artist to return the first 10 object that match the query
    Spotify.search(artist, 'artist', {limit: 10}).then(function (data) {
      //console the output
      //console.log(data);
      //loop through the collection to pushing the names of the artists into an array
      angular.forEach(data.artists.items, function (value, key) {
        queryNameList.push(value.name.toLowerCase());
      });
      //console name of artist
      console.log(queryNameList);
      //query through the queryNameList to check if your query matches the results from Spotify
      for (var i = 0, ii = queryNameList.length; i < ii; i++) {
        if (artist === queryNameList[i] && !prevArtist) {
          alert('correct answer');
          //update Score
          ScoreBoard.updateScore();
          console.log('It exists');
          //reset Names from the Query
          list.push(queryNameList[i]);
          console.log(list);
          queryNameList = [];
          console.log(data.artists.items[0].id);
          var artistID = data.artists.items[0].id;
          artistImage = data.artists.items[0].images[0].url;
          //console.log( queryNameList);
            //valid
          correct = true;
          $timeout(function () {
            correct = false;
          }, 1100);

          Spotify.getArtistTopTracks(artistID, 'US').then(function (data) {
            console.log(data.tracks[0].preview_url);
            var audioObject = new Audio(data.tracks[0].preview_url);
            audioObject.play();
            $timeout(function(){
              audioObject.pause();
            }, 6000);
          });
          //console.log(queryList);

          return;
          }
      }
      if(prevArtist) {
        alert('wrong answer because of previous artist');
        console.log('previous answer');
        wrong = true;
        $timeout(function () {
          wrong = false;
          gameover();
        }, 1100);
      } else {
        alert('wrong answer because it wasnt spelled right or exists');
        console.log('wrong answer');
        wrong = true;
        $timeout(function () {
          wrong = false;
          gameover();
        }, 1100);
      }
      return;
    });
  }
  return obj;
};

