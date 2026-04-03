let spread = 0.01;


let money = 10000;
let shares = 0;


let run = false;

let counter = 0;
let chart_data = [];

// opponent data
let opp_money = 10000;
let opp_shares = 0;


//create session
let sess = new session();


// create market
let mkt = new market(100, 0.02);


//create player trader
let player = new trader([mkt]);

// create opponent
let opponent = new donch_ai([mkt]);

sess.markets = [mkt];
sess.traders = [player, opponent];
sess.initialize();


function updateDisplay(mkt) {
    let price_element = document.getElementById('price');
    if (mkt.price.toFixed(2) > price_element.textContent) {
        price_element.style.color = 'lime';
    } else {
        price_element.style.color = 'red';
    }
    document.getElementById('price').textContent = mkt.price.toFixed(2);


    let shares_element = document.getElementById('shares');
    if (player.positions[0] > 0) {
        shares_element.style.color = 'lime';
    } else if (player.positions[0] < 0) {
        shares_element.style.color = 'red';
    } else {
        shares_element.style.color = '';
    }
    document.getElementById('shares').textContent = player.positions[0];


    let money_element = document.getElementById('money');
    if (player.balance.toFixed(2) > money_element.textContent.slice(0, 2)) {
        money_element.style.color = 'lime';
    } else if (money.toFixed(2) < money_element.textContent.slice(0, 2)) {
        money_element.style.color = 'red';
    } else {
        money_element.style.color = '';
    }
    document.getElementById('money').textContent = player.balance.toFixed(2) + ' $';
}

function updateChart(mkt) {
    const div = document.querySelector("#chart");

    let plot = Plot.plot({
        height: 280,
        width: 750,
        y: {
            grid: true
        },
        marks: [
            Plot.lineY(mkt.data.slice(-500), {x: "time", y: "price", stroke: "#009dff"})
            //Plot.lineY(chart_data, {x: "date", y: "support", stroke: "#FF0000"}),
            //Plot.lineY(chart_data, {x: "date", y: "resistance", stroke: "#00FF00"})
        ]
    });


    /*let plot3 = Plot.plot({
        y: {
            grid: true
        },
        marks: [
            Plot.lineY(chart_data, {x: "date", y: "drift", stroke: "#000000"}),
        ]
    });

    let plot4 = Plot.plot({
        y: {
            grid: true
        },
        marks: [
            Plot.lineY(chart_data, {x: "date", y: "sigma", stroke: "#000000"}),
        ]
    });*/

    let plot2 = Plot.plot({
        height: 280,
        width: 750,
        y: {
            grid: true
        },
        marks: [
            Plot.lineY(sess.chart_data.slice(-500), {x: "time", y: "1", stroke: "blueviolet"}),
            Plot.lineY(sess.chart_data.slice(-500), {x: "time", y: "0", stroke: "gold"})
        ]
    })

    div.innerHTML = '';
    div.append(plot);
    div.append(plot2);
    //div.append(plot3);
    //div.append(plot4);
}

function check_winner(mkt) {

    // check loser
    if (player.balance <= 0) {
        document.getElementById('message').textContent = 'Player lost!'
        player.balance = 0;
        player.positions[0] = 0;
        run = false;
    }

    if (opponent.balance <= 0) {
        document.getElementById('message').textContent = 'Computer lost!'
        opponent.balance = 0;
        opponent.positions[0] = 0;
        run = false;
    }

    // check winner
    if (sess.time == 1000) {
        run = false
        let msg = document.getElementById('message');
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

// Main loop
function update() {
    opponent.trade(0);
    sess.step();
    updateDisplay(mkt);
    updateChart(mkt);
    check_winner(mkt);
}

function play() {
    if (run) {
        update();
        setTimeout(play, 250);
    }
}

document.getElementById('Update').onclick = function() {
    update(mkt);
}

document.getElementById('Buy').onclick = function() {
    let shares_to_buy = document.getElementById("amount").valueAsNumber;
    player.positions[0] += shares_to_buy;

    // pay the spread
    player.balance -= mkt.spread * shares_to_buy
    updateDisplay(mkt);
}

document.getElementById('Sell').onclick = function() {
    let shares_to_sell = document.getElementById("amount").valueAsNumber;
    player.positions[0] -= shares_to_sell;

    // pay the spread
    player.balance -= spread * shares_to_sell;
    updateDisplay(mkt);
}

document.getElementById('play').onclick = function() {
    run = true;
    play();
}

document.getElementById('stop').onclick = function() {
    run = false;
}



updateChart(mkt);
updateDisplay(mkt);
updateDisplay(mkt);
