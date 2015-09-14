'use strict';

app.controller('gameoverCtrl',['ScoreBoard', '$location', function(ScoreBoard, $location){
  //set variables
  var vm = this;
  vm.whyYouLose = "";
  vm.score = ScoreBoard.getScore();
  vm.highScore = ScoreBoard.getHighScore();
  vm.startOver = function() {
    ScoreBoard.startOver();
    $location.path("/");
  };

}]) // end of gameoverCtrl

.factory('finalScore',function(){

}); // end of finalScore
