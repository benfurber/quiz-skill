// There are three sections, Text Strings, Skill Code, and Helper Function(s).
// This code includes helper functions for compatibility with versions of the SDK prior to 1.0.9, which includes the dialog directives.

var content = require('./quiz-content.js');
var script = require('./quiz-script.js');

 // 1. Text strings =====================================================================================================
 //    Modify these strings and messages to change the behavior of your Lambda function

var speechOutput;
var reprompt;

 // 2. Skill Code =======================================================================================================
"use strict";
var Alexa = require('alexa-sdk');
var APP_ID = 'amzn1.ask.skill.71b5b8bd-87a5-48f4-a840-d467f28a92d5';
var handlers = {
    'LaunchRequest': function () {

      // Called if this is the first time the skill has been opened by the user.
      if(Object.keys(this.attributes).length === 0) {
        this.attributes['quizID'] = 1;
        this.attributes['progress'] = {};
        this.attributes['progress']['round'] = 0;
        this.attributes['progress']['question'] = 0;
      }

      // Main question progressing loop
      if (this.attributes['progress']['round'] == 0) { // If this is the user's first time.
          speechOutput = script['quizWelcome'];
          this.attributes['progress']['round']++;
      } else { // If the user has been here before.
          if (5 >= this.attributes['progress']['question'] ) { // The normal question progression
              this.attributes['progress']['question']++;
          } else { // If it's the end of a round
              this.attributes['progress']['round']++;
              this.attributes['progress']['question'] = 1;
          }
          speechOutput = questionAsker(this.attributes['quizID'],this.attributes['progress']['round'],this.attributes['progress']['question']);
      }

      this.emit(':tell', speechOutput);
  },
	'AMAZON.RepeatIntent': function () {
    	speechOutput = questionAsker(this.attributes['quizID'],this.attributes['progress']['round'],this.attributes['progress']['question']);
      this.emit(":tell", speechOutput);
  },
	'AMAZON.StartOverIntent': function () {
      this.attributes['progress']['round'] = 0;
      this.attributes['progress']['question'] = 0;

		  var speechOutput = script['HelpIntent'];
      this.emit(":tell", speechOutput, speechOutput);
  },
  'SessionEndedRequest': function () {
      this.emit(':saveState', true);
      this.emit(':tell', script['sessionEndedRequest']);
  },
  'NotUsingIntent':       function () { this.emit(':tell', script['notUsingIntent']); },
  'AMAZON.CancelIntent':  function () { this.emit(':tell', script['cancelIntent']); },
  'AMAZON.StopIntent':    function () { this.emit(':tell', script['stopIntent']); },
  'AMAZON.HelpIntent':    function () { this.emit(':ask', script['helpIntent'], script['helpIntent']); },
	'Unhandled':            function () { this.emit(':ask', script['unhandled'], script['unhandled']); }
};

exports.handler = (event, context) => {
    var alexa = Alexa.handler(event, context);
    alexa.appId = APP_ID;
    //alexa.resources = languageStrings; // To enable string internationalization (i18n) features, set a resources object.
    alexa.registerHandlers(handlers);
	  alexa.dynamoDBTableName = 'QuizSkill';
    alexa.execute();
};

//    END of Intent Handlers {} ========================================================================================
// 3. Functions  =================================================================================================

function questionAsker(quizID,roundID,questionID) {

    // Creat an array for the output
    var text = [];

    // The question saying bit.
    // Finding out the total number of questions in the round.
    var questionsInRound = 5;

    // If it's time to ask a question
    if (questionsInRound >= questionID) {

      // Say that this is the last question in the round, if it is.
      if (questionID == questionsInRound) {
        text.push(script['endofRound']);
      }

      // Introduce the question.
      text.push('Question ' + questionID + ' -');

      // The question.
      text.push(content[quizID][roundID][questionID]['question']);
      // text.push('<break time="3s"/>');
      // text.push(content[quizID][roundID][questionID]['question']);

    } else { // Time to read the answers

      text.push(script['answersIntro']);
      text.push('This round was ' + content[quizID][roundID]['0']['question']);

      for (var i = 1; i < 6; i++) {
        text.push('Question ' + i + ' was, \'' + content[quizID][roundID][i]['question'] + '\'');
        text.push(content[quizID][roundID][i]['answer']);
        text.push('<break time="1s"/>');
      }

    }

    return text.join(' ');
}


//These functions are here to allow dialog directives to work with SDK versions prior to 1.0.9
//will be removed once Lambda templates are updated with the latest SDK

function createSpeechObject(optionsParam) {
    if (optionsParam && optionsParam.type === 'SSML') {
        return {
            type: optionsParam.type,
            ssml: optionsParam['speech']
        };
    } else {
        return {
            type: optionsParam.type || 'PlainText',
            text: optionsParam['speech'] || optionsParam
        };
    }
}

function buildSpeechletResponse(options) {
    var alexaResponse = {
        shouldEndSession: options.shouldEndSession
    };

    if (options.output) {
        alexaResponse.outputSpeech = createSpeechObject(options.output);
    }

    if (options.reprompt) {
        alexaResponse.reprompt = {
            outputSpeech: createSpeechObject(options.reprompt)
        };
    }

    if (options.directives) {
        alexaResponse.directives = options.directives;
    }

    if (options.cardTitle && options.cardContent) {
        alexaResponse.card = {
            type: 'Simple',
            title: options.cardTitle,
            content: options.cardContent
        };

        if(options.cardImage && (options.cardImage.smallImageUrl || options.cardImage.largeImageUrl)) {
            alexaResponse.card.type = 'Standard';
            alexaResponse.card['image'] = {};

            delete alexaResponse.card.content;
            alexaResponse.card.text = options.cardContent;

            if(options.cardImage.smallImageUrl) {
                alexaResponse.card.image['smallImageUrl'] = options.cardImage.smallImageUrl;
            }

            if(options.cardImage.largeImageUrl) {
                alexaResponse.card.image['largeImageUrl'] = options.cardImage.largeImageUrl;
            }
        }
    } else if (options.cardType === 'LinkAccount') {
        alexaResponse.card = {
            type: 'LinkAccount'
        };
    } else if (options.cardType === 'AskForPermissionsConsent') {
        alexaResponse.card = {
            type: 'AskForPermissionsConsent',
            permissions: options.permissions
        };
    }

    var returnResult = {
        version: '1.0',
        response: alexaResponse
    };

    if (options.sessionAttributes) {
        returnResult.sessionAttributes = options.sessionAttributes;
    }
    return returnResult;
}

function getDialogDirectives(dialogType, updatedIntent, slotName) {
    let directive = {
        type: dialogType
    };

    if (dialogType === 'Dialog.ElicitSlot') {
        directive.slotToElicit = slotName;
    } else if (dialogType === 'Dialog.ConfirmSlot') {
        directive.slotToConfirm = slotName;
    }

    if (updatedIntent) {
        directive.updatedIntent = updatedIntent;
    }
    return [directive];
}
