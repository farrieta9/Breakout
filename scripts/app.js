'use strict';

let App = (function() {

    let menuOptions = {
        'new-game': GameEngine,
    };

    let storage = Storage;

    function initialize() {

        menuOptions['new-game'].initialize();
        Storage.report();

        console.log("init has happened");

        document.getElementById('option-new-game').addEventListener('click', function() {
            showScreenWith('new-game');
        });

        document.getElementById('option-new-game2').addEventListener('click', function() {
            showScreenWith('new-game');
        });

        document.getElementById('reset-scores-button').addEventListener('click', function () {
            storage.clear();
        });
        // document.getElementById('option-instructions').addEventListener('click', function() {
        //     showScreenWith('instructions');
        // });

        // document.getElementById('option-high-scores').addEventListener('click', function() {
        //     showScreenWith('high-scores');
        // });

        // document.getElementById('option-about').addEventListener('click', function() {
        //     showScreenWith('about');
        // });
    }

    function showScreenWith(id) {
        let active = document.getElementsByClassName('active');

        // Remove all active screens
        for(let i = 0; i < active.length; i++) {
            active[i].classList.remove('active');
        }

        if(id in menuOptions) {
            menuOptions[id].run();
        }

        document.getElementById(id).classList.add('active');
    }

    return {
        initialize: initialize,
    }
}());
