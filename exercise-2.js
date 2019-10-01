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
const lang = 'swahili';
const max_digits_for_account_number = 8;
const max_digits_for_input = 2;
const timeout_length = 60;

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