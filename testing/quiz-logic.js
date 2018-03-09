module.exports = {

  progressController: function(content,script,quizID,progress,repeat=false) {

    var text = [];

    function progressCounter(type) {
      if (repeat == false) {
        progress[type]++;
      }
    }

    // Work out where the user is

      // The user has just starting of the quiz
      if (progress['round'] == 0) {
        text.push();
        text.push('This is a ' + content[quizID]['Description'] + ' quiz.');
        progressCounter('round');
      }

      // The user is about to start a new round
      if (progress['round'] > 0 && progress['question'] == 0) {
        text.push(script['startOfRound'] + ' - ' + content[quizID][progress['round']]['Description'] + '.');
        progressCounter('question');
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
        text.push('Question ' + progress['question'] + ' -');

        // Say the question
        text.push(content[quizID][progress['round']][progress['question']]['question']);

        // Progress addition
        if (progress['question'] == questionsInRound) {

          // Progress to the next round
          progressCounter('round');
          // Reset the question count
          progress['question'] = 0

        } else {
          progressCounter('question');
        };

      };

    // Action

      // Call the text
      return text.join(' ');

  }

}
