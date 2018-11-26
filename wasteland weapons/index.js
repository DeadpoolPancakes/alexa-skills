/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk-core');
const recipes = require('./recipes');
const welcomeMessage = 'Welcome to Wasteland Weapons! I can tell you some basic stats about weapons in the wasteland. What would you like to know about? ';
const exitSkillMessage = 'Safe travels!';
const recipenotfound = 'I could not find that weapon';
const repromptOutput = 'What would you like to know about?';
const helpMessage = 'I can tell you some basic stats about weapons in the wasteland. What would you like to know about?';
const templatetype = 'BodyTemplate2';
const skillname = 'Wasteland Weapons';


/* INTENT HANDLERS */
const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
    
  },
  handle(handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    console.log(requestAttributes);
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    const responseBuilder = handlerInput.responseBuilder;
    const speakOutput = (welcomeMessage);

    handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

    if (supportsDisplay(handlerInput)) {
        responseBuilder.addRenderTemplateDirective({
        type: templatetype,
        token: 'listToken',
        backButton: 'visibile',
        title: skillname,
        backgroundImage: {
          'contentDescription' : 'Terminal Background',
           'sources': [
            {
             'url': 'background.jpg'
            }
            ]
        },
        image: {
          "contentDescription": "ammotype",
          "sources": [
            {
            "url": ""
            }
        ]
        },
      textContent: {
        "primaryText": {
          "text": welcomeMessage,
          "type": "PlainText"
        },
        "secondaryText": {
          "text": helpMessage,
          "type": "RichText"
        },
      }
      });
    }
    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(repromptOutput)
      .getResponse();
  },
};

const RecipeHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'weaponinfo';
  },
  handle(handlerInput) {
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    const templatetype = 'BodyTemplate2';

    const itemSlot = handlerInput.requestEnvelope.request.intent.slots.weapon;
    let itemName;
    if (itemSlot && itemSlot.value) {
      itemName = itemSlot.value.toLowerCase();
    }
    console.log(itemName);
    console.log(recipes.RECIPES[itemName]);
    const recipe = recipes.RECIPES[itemName];
    console.log(recipe);
    let speakOutput = "";

    if (recipe) {
      sessionAttributes.speakOutput = recipe;
      const responseBuilder = handlerInput.responseBuilder;
      handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
      if (supportsDisplay(handlerInput)) {
        responseBuilder.addRenderTemplateDirective({
        type: templatetype,
        token: itemName,
        backButton: 'visibile',
        title: recipe.name,
        backgroundImage: {
          'contentDescription' : 'Terminal Background',
           'sources': [
            {
             'url': 'background.jpg'
            }
            ]
        },
        image: {
          "contentDescription": "ammotype",
          "sources": [
            {
            "url": recipe.image
            }
        ]
        },
      textContent: {
        "primaryText": {
          "text": recipe.name,
          "type": "RichText"
        },
        "secondaryText": {
          "text": recipe.recipe,
          "type": "RichText"
        },
      }
      });
    }
      return handlerInput.responseBuilder
        .speak(`the base stats of a ${recipe.name} are ${recipe.speech}`) // .reprompt(sessionAttributes.repromptSpeech)
        .getResponse();
    }
    else{
      console.log('item not found')
      speakOutput = recipenotfound + '. ' + repromptOutput;
      sessionAttributes.speakOutput = speakOutput; //saving speakOutput to attributes, so we can use it to repeat
      sessionAttributes.repromptSpeech = repromptOutput;
      handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
      return handlerInput.responseBuilder
        .speak(sessionAttributes.speakOutput)
        .reprompt(sessionAttributes.repromptSpeech)
        .getResponse();
    }
  }
};

const HelpHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

    sessionAttributes.speakOutput = helpMessage;
    sessionAttributes.repromptSpeech = helpMessage;

    return handlerInput.responseBuilder
      .speak(sessionAttributes.speakOutput)
      .reprompt(sessionAttributes.repromptSpeech)
      .getResponse();
  },
};

const RepeatHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.RepeatIntent';
  },
  handle(handlerInput) {
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

    return handlerInput.responseBuilder
      .speak(sessionAttributes.speakOutput)
      .reprompt(sessionAttributes.repromptSpeech)
      .getResponse();
  },
};

const ExitHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent'
                || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent');
  },
  handle(handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    const speakOutput = exitSkillMessage;

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .withShouldEndSession(true)
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    console.log("Inside SessionEndedRequestHandler");
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${JSON.stringify(handlerInput.requestEnvelope)}`);
    return handlerInput.responseBuilder.getResponse();
  },
};


const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);

    return handlerInput.responseBuilder
      .speak('Sorry, I can\'t understand the command. Please say again.')
      .reprompt('Sorry, I can\'t understand the command. Please say again.')
      .getResponse();
  },
};

/* CONSTANTS */
const skillBuilder = Alexa.SkillBuilders.custom();

function supportsDisplay(handlerInput) {
  const hasDisplay =
    handlerInput.requestEnvelope.context &&
    handlerInput.requestEnvelope.context.System &&
    handlerInput.requestEnvelope.context.System.device &&
    handlerInput.requestEnvelope.context.System.device.supportedInterfaces &&
    handlerInput.requestEnvelope.context.System.device.supportedInterfaces.Display;
  return hasDisplay;
}

/* LAMBDA SETUP */
exports.handler = skillBuilder
  .addRequestHandlers(
    LaunchRequestHandler,
    RecipeHandler,
    HelpHandler,
    RepeatHandler,
    ExitHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();
