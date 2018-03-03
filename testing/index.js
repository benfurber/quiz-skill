var content = require('./quiz-content.js');
var script = require('./quiz-script.js');

var quizID = 1;

var progress = {
  'round': 0,
  'question': 0
};

function progressController() {

  var text = [];

  // Work out where the user is

    // The user has just starting of the quiz
    if (progress['round'] == 0 && progress['question'] == 0) {
      text.push(script['quizIntro']);
      text.push(content[quizID]['Description']);
      progress['round']++;
    }

    // The user is about to start a new round
    if (progress['round'] > 0 && progress['question'] == 0) {
      text.push(script['startOfRound']);
      text.push(content[quizID][progress['round']]['Description']);
      progress['question']++;
    };

    // The user needs a question
    if (progress['round'] > 0 && progress['question'] > 0) {

      // Finding out the total number of questions in the round
      var questionsInRound = content[quizID][progress['round']]['Total'];

      // The user will finish the round on this question
      if (progress['question'] == questionsInRound) {
        text.push(script['endofRound']);
      };

      // Say what question the user is on
      text.push('Question ' + progress['question']);

      // Say the question
      text.push(content[quizID][progress['round']][progress['question']]['question']);


      // The user will finish the round on this question
      if (progress['question'] == questionsInRound) {

        // Progress to the next round
        progress['round']++;

        // Reset the question count
        progress['question'] = 0

      } else {
        progress['question']++;
      };

    };

  // Action

    // Call the text
    console.log(text.join(' \n'));
    console.log('\r');

};

progressController()
progressController()
progressController()
progressController()
progressController()
progressController()
progressController()
