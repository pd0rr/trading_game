// stores check winner functions for the various levels. Not a great programming pattern, to be fixed in the future.
// functions return value for run global variable...

levels = {
    1: function (session, player, opponent, msg_elm) {
        let ret = true;

        // check loser
        if (player.balance <= 0) {
            msg_elm.textContent = 'Player lost!'
            player.balance = 0;
            player.positions[0] = 0;
            ret = false;
        }

        // check balance
        if (player.balance >= 30000) {
            msg_elm.textContent = 'Player won!'
            ret = false;
        }

        return ret;
    },

    2: function (session, player, opponent, msg_elm) {
        let ret = true;

        // check loser
        if (player.balance <= 0) {
            msg_elm.textContent = 'Player lost!'
            player.balance = 0;
            player.positions[0] = 0;
            ret = false;
        }

        // check balance
        if (player.balance >= 20000) {
            msg_elm.textContent = 'Player won!'
            ret = false;
        }

        return ret;
    },

    3: function (session, player, opponent, msg_elm) {
        let ret = true;
        // check loser
        if (player.balance <= 0) {
            document.getElementById('message').textContent = 'Player lost!'
            player.balance = 0;
            player.positions[0] = 0;
            ret = false;
        }

        if (opponent.balance <= 0) {
            document.getElementById('message').textContent = 'Computer lost!'
            opponent.balance = 0;
            opponent.positions[0] = 0;
            ret = false;
        }

        // check winner
        if (sess.time == 1000) {
            ret = false
            let msg = msg_elm;
            msg.textContent = 'Game over: ';
            if (player.balance > opponent.balance) {
                msg.textContent +='player won.';
            } else if (player.balance < opponent.balance) {
                msg.textContent +='computer won.';
            } else {
                msg.textContent += 'tie.';
            }
        }
    }
}