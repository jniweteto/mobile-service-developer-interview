/*
    File: exercise-2.js
    Description: contains reference code for Mobile Service Developer Exercise 2
*/

// load relevant functions
var msgs = require('./lib/msg-retrieve'); //global message handler
var admin_alert = require('./lib/admin-alert'); //global admin alerter
var get_menu_option = require('./lib/get-menu-option'); 
var populate_menu = require('./lib/populate-menu');


// initialize variables and constants
const lang = 'kinyarwanda';
const max_digits_for_account_number = 8;
const max_digits_for_input = 2;
const timeout_length = 60;

//maximu number of chacters for each description
const max_issue_description =180;

// main function; prompts client to enter their account number
global.main = function(){
    sayText(msgs('main_splash'));
    promptDigits('account_number_splash', { 'submitOnHash' : false,
                                            'maxDigits'    : max_digits_for_account_number,
                                            'timeout'      : timeout_length });
};

// input handler for account number
addInputHandler('account_number_splash', function(input){
    try{
        var response = input.replace(/\D/g,'');
        var verify = require('./lib/account-verify');
        if(verify(response)){
            state.vars.account_number = response;
            // display main menu and prompt user to select a menu option
            var splash = 'main_menu';
            var menu = populate_menu(splash, lang);
            sayText(menu, lang);
            promptDigits('menu_select', {'submitOnHash' : false, 'maxDigits' : max_digits_for_input, 'timeout' : 180});
        }
        else{
            sayText(msgs('invalid_account'));
            promptDigits('account_number_splash', { 'submitOnHash' : false,
                                                    'maxDigits'    : max_digits_for_account_number,
                                                    'timeout'      : 180 });
        }
    }
    catch(error){
        console.log(error);
        admin_alert('Error on USSD test integration : ' + error + '\nAccount number: ' + response, "ERROR, ERROR, ERROR", 'rodgers')
        stopRules();
    }
});

// input handler for main menu selection
addInputHandler('menu_select', function(input){
    input = String(input.replace(/\D/g,''));
    var selection = get_menu_option(input, 'main_menu');
    if(selection === null || selection === undefined){
        sayText(msgs('invalid_input', {}, lang));
        promptDigits('menu_select', {'submitOnHash' : false, 'maxDigits' : max_digits_for_input,'timeout' : timeout_length});
        return null;
    }
    else if(selection === 'get_balance'){
        get_balance = require('./lib/get-balance');
        var balance_data = get_balance(JSON.parse(state.vars.client_json), lang);
        sayText(msgs('get_balance', balance_data, lang));
        promptDigits('continue', {'submitOnHash' : false, 'maxDigits' : max_digits_for_input, 'timeout' : timeout_length});
        return null;
    }
    else if(selection === 'check_order'){
        check_order = require('./lib/check-order');
        var order_data = check_order(JSON.parse(state.vars.client_json), lang);
        sayText(msgs('check_order', order_data, lang));
        promptDigits('continue', {'submitOnHash' : false, 'maxDigits' : max_digits_for_input, 'timeout' : timeout_length});
        return null;
    }
    else if(selection === 'report_issue'){
        var menu = populate_menu('issue_menu', lang);
        state.vars.current_menu_str = menu;
        sayText(msgs('issue_menu', lang));
        promptDigits('issue_menu_select', { 'submitOnHash' : false,
                                            'maxDigits'    : max_digits_for_input,
                                            'timeout'      : timeout_length });
        return null;
    }
    else{
        sayText(msgs('invalid_input', lang));  
        promptDigits('menu_select', {'submitOnHash' : false, 'maxDigits' : max_digits_for_input,'timeout' : timeout_length});
        return null;  
    }
});

/* 
    Complete the input handler below. It should do two things:
        1. Send an alert to FDV lead Arsene if the input is type 2 (fraud/harassment reporting).
            Hint: you can assume that Arsene is already set up as a user in the admin alert function.
        2. Prompt the client to write a brief (<180 characters) description of their issue.
*/
addInputHandler('issue_menu_select', function(input){
    // ADD YOUR CODE HERE
    
    // since the user would need to enter issue description, there is no need to replace non-digital text by empty space
    
    //selection issue form the issue menu
    var selection = get_menu_option(input, 'issue_menu');

    //Wrong selection of the menu/ when menue not listed
    if(selection === null || selection === undefined){
        sayText(msgs('invalid_input', {}, lang));
        promptDigits('issue_menu_select', {'submitOnHash' : false, 'maxDigits' : max_digits_for_input,'timeout' : timeout_length});
        return null;
    }

    //When user select 2, I assume that there other people in charge to send alerts to when the user select another number than 2
    //depending on number of issues defined.
    else if(selection === 2){
     
        //prompt the to enter a brief description of the issue
        sayText(msgs('msg_prompt', lang));

        //saving the isse description so that we would send it to Arsene who is in charge of fraud and harasement
        // From my experience, it could take 2.5 min on average to type a 180-characters message using a smartphone. I think that time 
        //becomes longer when you use a feature phone which I think most farmers have. So the timeout here should be longer. 
        //I assume afarmer who is not used to typing message would take 5min(300 seconds) on average
        let issueDescription = promptDigits('send', {'submitOnHash' : false,'maxIssueText' : max_issue_description, 'timeout' : 300});

        //alerting arsene about the issue described by the user and send him user's account
        admin_alert('Fraud/harasement issue from user ' +'Account number' +'\n'+ issueDescription,"Arsene")

        sayText(msgs('msg_received',lang));
        return null;
    }

    else{
        sayText(msgs('invalid_input', lang));  
        promptDigits('issue_menu_select', {'submitOnHash' : false, 'maxDigits' : max_digits_for_input,'timeout' : timeout_length});
        return null;  
    }
});

// let the client know that their message has been received
addInputHandler('issue_message', function(){
    sayText(msgs('msg_received', lang));
    promptDigits('continue', {'submitOnHash' : false, 'maxDigits' : max_digits_for_input, 'timeout' : timeout_length});
});

// input handler for continue; returns user to the main menu
addInputHandler('continue', function(){
    var menu = populate_menu('main_menu', lang);
    sayText(menu);
    promptDigits('menu_select', {   'submitOnHash' : false,
                                    'maxDigits'    : max_digits,
                                    'timeout'      : timeout_length });
});
