/**
    Created on : 13/01/2014, 09:00:09 AM
    Author     : Jose Tovar
*/
var questions = Array(
        {
            "pregunta":"¿Hasta cuándo hay plazo para Renovar la Matrícula Mercantil y Entidades Sin Ánimo de Lucro - ESAL?",
            "incorrecto1":"8 de Agosto",
            "correcto":"31 de Marzo",
            "incorrecto2":"6 de Diciembre"
        },
        {
            "pregunta":"¿Cuál es el registro que se necesita para hacer negocios con el Estado?",
            "correcto":"Registro de Proponentes",
            "incorrecto1":"Registro Nacional de Turismo ",
            "incorrecto2":"Registro del uso del suelo"
        },
        {
            "pregunta":"¿Por qué medios se puede realizar la renovación?",
            "correcto":"Con formulario y a través de internet",
            "incorrecto1":"Por correo electrónico",
            "incorrecto2":"Por CD o DVD"
        },
        {
            "pregunta":"¿Qué costo tiene el formulario para la renovación?",
            "correcto":"$ 4.300 ",
            "incorrecto1":"$ 10.000 ",
            "incorrecto2":"$ 1.500"
        },
        {
            "pregunta":"¿Cuál es el horario de atención en la Sede Yumbo?",
            "correcto":"7:30 a.m. a 4:30 p.m",
            "incorrecto1":"8:00 a.m. a 6:00 p.m.",
            "incorrecto2":"7:00 a.m. a 3:00 p.m."
        });
var current_question = 0; 
/* Config variables */
var speed_character = 90; //speed of character 100
var speed_city = 20; // speed of city and background 50
var speed_bgsky = 100; // speed of the sky 100
var num_buildings = 8; //ammount of buildings to create
var dificultad = 8000;
/* Intervals */
var interval_character; // timing variable
var interval_bgcity; // timing variable
var interval_bgsky; // timing variable
/* positions */
var characterpos; // position of the character background
var backgroundcitypos; // position of the wall background
var bgskypos;  // position of the sky background  
/* building trackers */
var idedificio=0; // consecutive for each building added to scenario
var current_build; //current build identifier
var first_build = false;
/* game state */
var winner = false;
var restarted = false;
var game_finished = false;
var error = false; // activated when chooses wrong answer

$(document).ready(function(){
    interval_bgsky = setInterval(function(){animateBgCielo();}, speed_bgsky);
    loadBuildings(num_buildings);
    $('#btn-start-game').animate({
        opacity:1
    },1000, function(){});
    
    $('#btn-start-game').click(function(){
        startGame();
    });
    
    $('.game_dialog2').click(function(){
        $('.game_dialog').focus();
    });
    
    $('.dialog-box').click(function(){
        $('.game_dialog').focus();
    });
});

/**
 * Starts the game
 * @returns {void}
 */
function startGame(){
    if(!restarted){
        $('#btn-start-game').fadeOut('slow', function(){
            initializeIntervals(speed_character, speed_city);
            $('#character').animate({
                left:100
            },1500, function(){}); 
        });
        $('#bg-white').fadeOut("slow");
    }else{
        initializeIntervals(speed_character, speed_city);
        $('#character').animate({
            left:100
        },1500, function(){});         
    }
}

/**
 * Resets html and global variables so the player can give another try
 * @returns {void}
 */
function restartGame(){
    speed_character = 90; //speed of character 100
    speed_city = 20; // speed of city and background 50
    speed_bgsky = 100; // speed of the sky 100
    dificultad = 8000;
    error = false;
    idedificio=0;
    current_build = false;
    first_build = false;
    winner = false;
    restarted = true;
    game_finished = false;
    current_question = 0; 
    
    $('#game-over').animate({opacity:0} , 2000, function(){});
    $('#restart').animate({width:0,height:0,left:75,top:75}, 1000, "easeInOutBack",function(){
       $('#game-container').animate({opacity:0}, 500, function(){
            $('#game-container').html('<div id="dialog-container"></div>\n\\n\
                         <div id="ccc-logo"><!-- #ccc-logo --></div>\n\
                         <div class="edificios"><!-- .edificios --></div>\n\
                         <div id="background-bricks"><!-- #background-city --></div>\n\
                         <div id="background-sky"><!-- #background-sky --></div>\n\
                         <div id="character"><!-- #character --></div>\n\
                         <div id="luces"><!-- background-city --></div>\n\
                         <div id="game-over"></div><img id="restart" src="images/retry.png" onclick="restartGame()"></div>');
            loadBuildings(num_buildings);
            $('#game-container').animate({opacity:1}, 500, function(){
               startGame(); 
            });
       });
    });
}

/**
 * Go to next question if answer is correct
 * @returns {void}
 */
function continueGame(){
    dificultad -= 200;
    $(current_build).animate({opacity:1}, (dificultad/14), 'linear', function(){});
    $('#character').css('background-position', '500px 0px');
    if(current_question === (questions.length) -1){
        current_question = 0;
    }else{
        current_question++;
    }
    hideDialog();
    initializeIntervals(speed_character, speed_city);
}

/**
 * Sets the current building to clear according to game progress
 * @returns {void}
 */
function game_logic(){
    var eleft = parseInt($('.edificios').css('left').split('px'))*(-1);
    var ewidth = parseInt($('.edificios').css('width').split('px'));
    var current_pos = ewidth - eleft - 958;
    
    var building_to_clear = "#ed"+(((((num_buildings-1) - ((current_pos / ewidth)*num_buildings.toFixed(0))).toFixed(0)).toString())-1);
    var num_building_to_clear = ((((num_buildings-1) - ((current_pos / ewidth)*num_buildings.toFixed(0))).toFixed(0)).toString());
    
    if(num_building_to_clear > 2 && building_to_clear !== current_build){
        current_build = building_to_clear;
        showDialog();
    }
    if(current_pos <= 0){ gameOver(2); }
}

/**
 * Finishes the game in two differents ways,
 * one if you pick the wrong answer or if you ran out of time,
 * the other ending is you cleared the whole questionary
 * @param {int} type
 * @returns {void}
 */
function gameOver(type){
    game_finished = true;
    resetIntervals();
    stopCharacter();
    hideDialog();
    if(type===1){ //Game over
        clearBuilding(current_build);
    }else if(type===2){ //Game completed
        $('#game-container').append('<div id="ver_mas"><a href="http://www.ccc.org.co/renovar/renovar.html">VER MÁS</a></div><div id="game-completed"></div><div id="restart" onclick="restartGame()"></div>');
        $('#game-completed').fadeIn("slow", function(){ $('#restart').animate({width:100,height:100,left:25,top:25}, 1000, "easeInOutBack",function(){}); });        
    }
}
/**
 * Starts the animation according to character and city speeds
 * @param {int} tcharacter
 * @param {int} tbgcity
 * @returns {void}
 */
function initializeIntervals(tcharacter, tbgcity){
    if(!game_finished){
        interval_character = setInterval(function(){animateCharacter();},tcharacter);
        interval_bgcity = setInterval(function(){animateScenario();},tbgcity);
    }
}

/**
 * Stops the animation
 * @returns {void}
 */
function resetIntervals(){
    window.clearInterval(interval_character);
    window.clearInterval(interval_bgcity);
    interval_character = false;
    interval_bgcity = false;
}

/**
 * Checks if the chosen answer matches the answer of the current question
 * @param {string} option
 * @returns {void}
 */
function checkAnswer(option){
    var result = $(option).attr('answer');
    if(result === 'correcto'){
        $(option).children('.ok').css('display','block');
        $(option).children('p').animate({opacity:0}, 200, function(){
            $(option).children('.ok').animate({opacity:1}, 400, "easeInOutBack",function(){
                winner = true;
                continueGame();
            });
        });
    }else{
        $(option).children('.wrong').css('display','block');
        $(option).children('p').animate({opacity:0}, 200, function(){
            $(option).children('.wrong').animate({opacity:1}, 400, "easeInOutBack",function(){
                winner = false;
                error = true;
                gameOver(1);
            });
        });
    }
}

/**
 * Gets the current question
 * @returns {string}
 */
function getQuestion(){
    var question;
    question = questions[current_question]["pregunta"];
    return question;
}

/**
 * Gets the answer for the current question
 * @returns {string}
 */
function getAnswer(){
    var answer;
    answer = questions[current_question]["correcto"];
    return answer;
}

/**
 * Gets the options for the current question
 * @returns {string}
 */
function getOptions(){
    var options="";
    var opcion1 = "\n<div class='option' onclick='checkAnswer(this)' answer='correcto'><div class='wrong'></div><div class='ok'></div><p>"+questions[current_question]["correcto"]+"</p></div>\n";
    var opcion2 = "\n<div class='option' onclick='checkAnswer(this)' answer='incorrecto'><div class='wrong'></div><div class='ok'></div><p>"+questions[current_question]["incorrecto1"]+"</p></div>\n";
    var opcion3 = "\n<div class='option' onclick='checkAnswer(this)' answer='incorrecto'><div class='wrong'></div><div class='ok'></div><p>"+questions[current_question]["incorrecto2"]+"</p></div>\n";

    var orden_opciones;
    var taken1 = false;
    var taken2 = false;
    var taken3 = false;
    
    while(true){
        orden_opciones = Math.floor((Math.random()*3)+1);
        if(orden_opciones === 1 && !taken1){
            options += opcion1;
            taken1 = true;
        }else if(orden_opciones === 2 && !taken2){
            options += opcion2;
            taken2 = true;            
        }else if(orden_opciones === 3 && !taken3){
            options += opcion3;
            taken3 = true;
        }
        if(taken1 && taken2 && taken3) break;
    }
    return options;
}

/**
 * Shows dialog with questions, also fades progressively progresively the current building
 * @returns {void}
 */
function showDialog(){
    if(!game_finished){
        $('#dialog-container').html('<div class="dialog-box"><div class="dialog"></div><div class="pregunta">'+getQuestion()+'<br /><br />'+getOptions()+'</div><!-- .dialog-box --></div>');
        $('#dialog-container').animate(
            {opacity:1,left:160,bottom:190},
            500,
            function(){
                resetIntervals(); //stop scenario
                stopCharacter(); //stop character
                winner = false;
                $(current_build).animate({opacity:0.9}, (dificultad/14), 'linear', function(){
                    if(!winner && !error){ $(current_build).animate({opacity:1}, (dificultad/7), 'linear', function(){
                        if(!winner && !error){ $(current_build).animate({opacity:0.6}, (dificultad/7), 'linear', function(){
                            if(!winner && !error){ $(current_build).animate({opacity:0.8}, (dificultad/7), 'linear', function(){
                                if(!winner && !error){ $(current_build).animate({opacity:0.4}, (dificultad/7), 'linear', function(){
                                    if(!winner && !error){ $(current_build).animate({opacity:0.6}, (dificultad/7), 'linear', function(){
                                        if(!winner && !error){$(current_build).animate({opacity:0.2}, (dificultad/7), 'linear', function(){
                                            if(!winner && !error){ $(current_build).animate({opacity:0.4}, (dificultad/7), 'linear', function(){
                                                if(!winner && !error){ gameOver(1);}});
                                            }});
                                        }});
                                    }});
                                }});
                            }});
                        }});
                    }});
            });
    }
}

/**
 * Hides question dialog window
 * @returns {void}
 */
function hideDialog(){
    $('#dialog-container').animate({opacity:0,left:140,bottom:170},500,function(){});
}

/**
 * Load all the buildings into the scenario
 * @param {int} cantidad
 * @returns {void}
 */
function loadBuildings(cantidad){
    var counter = 1;
    var whilecounter = 0;
    var edificios = $('.edificios');
    var ewidth = edificios.width();
    while(whilecounter < cantidad){
        switch(counter){
            case 1:
                ewidth = ewidth+319;
                break;
            case 2:
                ewidth = ewidth+270;
                break;
            case 3:
                ewidth = ewidth+301;
                break;
            case 4:
                ewidth = ewidth+285;
                break;
            case 5:
                ewidth = ewidth+341;
                break;
        }
        if(counter === 5){
            $('.edificios').append('<div class="edificio c'+counter+'" id="ed'+idedificio+'"></div>');
            counter = 1;
        }else{
            $('.edificios').append('<div class="edificio c'+counter+'" id="ed'+idedificio+'"></div>');
            counter++;   
        }
        idedificio++;
        edificios.width(ewidth);
        whilecounter++;
    }
}

/**
 * Clears certain building
 * @param {DOM} edificio
 * @returns {void}
 */
function clearBuilding(edificio){
    $(edificio).animate({
        opacity:0
    }, 1000, function(){ 
        $('#game-over').css('display','block');
        $('#game-container').append('<div id="ver_mas"><a href="http://www.ccc.org.co/renovar/renovar.html">VER MÁS</a></div>');
        $('#game-over').animate({opacity:1}, 1000, function(){});
        //$('#game-over').fadeIn("slow", function(){ });
        $('#restart').animate({width:100,height:100,left:25,top:25}, 1000, "easeInOutBack",function(){});
    });
}

/**
 * Animates the character sprite
 * @returns {void}
 */
function animateCharacter(){
    var character = $('#character');
    if (navigator.appName === 'Microsoft Internet Explorer'){
        characterpos = character.css('background-position-x');
        characterpos = characterpos.split('px');
        characterpos = parseInt(characterpos[0]);        
    }else{
        characterpos = character.css('background-position');
        characterpos = characterpos.split(' ');
        characterpos = characterpos[0].split('px');
        characterpos = parseInt(characterpos[0]);
    }
    if(characterpos > 85){
        $('#character').css('background-position', (characterpos-83)+'px 0px');
    }else if(characterpos === 85){
        $('#character').css('background-position', '500px 0px');
    }
}

/**
 * Stops the character and puts him on stand position
 * @returns {void}
 */
function stopCharacter(){
    $('#character').css('background-position', '0px 126px');
}

/**
 * Animate the whole scenario: buildings, lights and wall.
 * @returns {void}
 */
function animateScenario(){
    var luces = $('#luces');
    if (navigator.appName === 'Microsoft Internet Explorer'){
        backgroundcitypos = luces.css('background-position-x');
        backgroundcitypos = backgroundcitypos.split('px');
        backgroundcitypos = parseInt(backgroundcitypos[0]);
    }else{
        backgroundcitypos = luces.css('background-position');
        backgroundcitypos = backgroundcitypos.split(" ");
        backgroundcitypos = backgroundcitypos[0].split('px');
        backgroundcitypos = parseInt(backgroundcitypos[0]);        
    }
    $('#luces').css('background-position', (backgroundcitypos-2)+'px 0px');
    $('#game-container').css('background-position', (backgroundcitypos-2)+'px 0px');
    $('#background-bricks').css('background-position', (backgroundcitypos-2)+'px 0px');
    $('.edificios').css('left', (backgroundcitypos-2)+'px');
     
    game_logic();
}

/**
 * Animates the sky bg
 * @returns {void}
 */
function animateBgCielo(){
    var sky = $('#background-sky');
    if (navigator.appName === 'Microsoft Internet Explorer'){
        bgskypos = sky.css('background-position-x');
        bgskypos = bgskypos.split('px');
        bgskypos = parseInt(bgskypos[0]);
    }else{
        bgskypos = sky.css('background-position');
        bgskypos = bgskypos.split(' ');
        bgskypos = bgskypos[0].split('px');
        bgskypos = parseInt(bgskypos[0]);
    }
    $('#background-sky').css('background-position', (bgskypos-1)+'px 0px');   
}