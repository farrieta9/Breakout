
// let HighScores = (function() {
//
//
//
//     function run() {
//         console.log("high score run...");
//     }
//
//     return {
//         run: run
//     }
//
// }());

'use strict';
let Storage = (function() {

    let highScores = {};
    let storageItem = 'Breakout.highScores';
    let previousScores = localStorage.getItem(storageItem);
    let canUpdate = true;
    let key = 'scores';

    if (previousScores !== null) {
        highScores = JSON.parse(previousScores);
    }
    let scores = [];
    if (highScores.hasOwnProperty(key)) {
        scores = highScores[key];
    } else {
        highScores[key] = scores;
    }

    function add(value) {

        if(!canUpdate) { return; }
        canUpdate = false;

        scores.push(value);
        scores.sort(function(a, b) { return b - a; }); // [0] will have highest value

        if (scores.length > 5) {
            scores.length = 5;
        }

        highScores[key] = scores;
        localStorage[storageItem] = JSON.stringify(highScores);
        report();
    }

    function reset() {
        canUpdate = true;
    }

    function clear() {
        delete highScores[key];
        // localStorage[storageItem] = JSON.stringify(highScores);
        localStorage.clear();

        for(let i = 0; i < scores.length; i++) {
            document.getElementById('podium'+ i).innerHTML = "";
        }
    }

    function report() {
        console.log(highScores);

        for(let i = 0; i < scores.length; i++) {
            document.getElementById('podium'+ i).innerHTML = scores[i];
        }
    }

    return {
        add,
        // remove,
        clear,
        report,
        reset,
    };
}());
//
// //
// // var MyGame = {
// //     persistence : (function () {
// //         'use strict';
// //         var highScores = {},
// //             previousScores = localStorage.getItem('MyGame.highScores');
// //         if (previousScores !== null) {
// //             highScores = JSON.parse(previousScores);
// //         }
// //
// //         function add(key, value) {
// //             highScores[key] = value;
// //             localStorage['MyGame.highScores'] = JSON.stringify(highScores);
// //         }
// //
// //         function remove(key) {
// //             delete highScores[key];
// //             localStorage['MyGame.highScores'] = JSON.stringify(highScores);
// //         }
// //
// //         function report() {
// //             var htmlNode = document.getElementById('div-console'),
// //                 key;
// //
// //             htmlNode.innerHTML = '';
// //             for (key in highScores) {
// //                 htmlNode.innerHTML += ('Key: ' + key + ' Value: ' + highScores[key] + '<br/>');
// //             }
// //             htmlNode.scrollTop = htmlNode.scrollHeight;
// //         }
// //
// //         return {
// //             add : add,
// //             remove : remove,
// //             report : report
// //         };
// //     }())
// // };
// //
// // function addValue() {
// //     'use strict';
// //
// //     MyGame.persistence.add(
// //         document.getElementById('id-key').value,
// //         document.getElementById('id-value').value);
// //
// //     MyGame.persistence.report();
// // }
// //
// // function removeValue() {
// //     'use strict';
// //
// //     MyGame.persistence.remove(document.getElementById('id-key').value);
// //     MyGame.persistence.report();
// // }
