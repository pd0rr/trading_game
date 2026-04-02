//import * as Plot from "https://cdn.jsdelivr.net/npm/@observablehq/plot@0.6/+esm";

let spread = 0.01;

let mean_sigma = 2/100;
let sigma = 2/100;
let drift = 0;

let price = 100;
let money = 10000;
let shares = 0;

let support = (1-2*sigma)*price;
let resistance = (1+2*sigma)*price;

let run = false;

let counter = 0;
let chart_data = [];

// opponent data
let opp_money = 10000;
let opp_shares = 0;

// donchian channel based on price (close)
function donch_channel(chart_data, n) {
    let prices = chart_data.map((r) => r.price).slice(-n-1, -1);
    return {top: Math.max(...prices), bottom: Math.min(...prices)};
}

function opp_trade() {

    // trade based on donchian channels
    let donch = donch_channel(chart_data, 30);

    let size = 1 * opp_money / price;

    if (price > donch.top && opp_shares <= 0) {
        opp_shares = size;

        // pay the spread
        opp_money -= spread * size;
    } else if (price < donch.bottom && opp_shares >= 0) {
        opp_shares = -size;
        // pay the spread
        opp_money -= spread * size;
    }
}

// Standard Normal variate using Box-Muller transform.
function gaussianRandom(mean=0, stdev=1) {
    const u = 1 - Math.random(); // Converting [0,1) to (0,1]
    const v = Math.random();
    const z = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
    // Transform to the desired mean and standard deviation:
    return z * stdev + mean;
}


function updateDisplay() {
    let price_element = document.getElementById('price');
    if (price.toFixed(2) > price_element.textContent) {
        price_element.style.color = 'lime';
    } else {
        price_element.style.color = 'red';
    }
    document.getElementById('price').textContent = price.toFixed(2);


    let shares_element = document.getElementById('shares');
    if (shares > 0) {
        shares_element.style.color = 'lime';
    } else if (shares < 0) {
        shares_element.style.color = 'red';
    } else {
        shares_element.style.color = '';
    }
    document.getElementById('shares').textContent = shares;


    let money_element = document.getElementById('money');
    if (money.toFixed(2) > money_element.textContent.slice(0, 2)) {
        money_element.style.color = 'lime';
    } else if (money.toFixed(2) < money_element.textContent.slice(0, 2)) {
        money_element.style.color = 'red';
    } else {
        money_element.style.color = '';
    }
    document.getElementById('money').textContent = money.toFixed(2) + ' $';
}

function updateChart() {
    const div = document.querySelector("#chart");

    let plot = Plot.plot({
        height: 280,
        width: 750,
        y: {
            grid: true
        },
        marks: [
            Plot.lineY(chart_data, {x: "date", y: "price", stroke: "#009dff"})
            //Plot.lineY(chart_data, {x: "date", y: "support", stroke: "#FF0000"}),
            //Plot.lineY(chart_data, {x: "date", y: "resistance", stroke: "#00FF00"})
        ]
    });

    /*let plot2 = Plot.plot({
        y: {
            grid: true
        },
        marks: [
            Plot.lineY(chart_data, {x: "date", y: "support", stroke: "#FF0000"}),
            Plot.lineY(chart_data, {x: "date", y: "resistance", stroke: "#00FF00"})
            
        ]
    });

    let plot3 = Plot.plot({
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
            Plot.lineY(chart_data, {x: "date", y: "opp_equity", stroke: "blueviolet"}),
            Plot.lineY(chart_data, {x: "date", y: "equity", stroke: "gold"})
        ]
    })

    div.innerHTML = '';
    div.append(plot);
    div.append(plot2);
    //div.append(plot3);
    //div.append(plot4);
}

function update_state() {
    let held_value = shares*price;

    // support and resistance
    let force = 0;
    if (price > resistance) force = -1.85*sigma;
    if (price < support) force = 1.85*sigma;

    let pct_change = gaussianRandom(0, sigma) + drift*sigma + force;
    let money_change = held_value * pct_change;
    money += money_change;

    // opponent
    let opp_held_value = opp_shares * price;
    opp_money += opp_held_value * pct_change;

    price *= 1 + pct_change;

    // if still above resistance of below support, update values
    if (force != 0 && price > resistance) {
        support = resistance;
        resistance *= 1 + gaussianRandom(5 * sigma, 2*sigma);
    }
    if (force != 0 && price < support) {
        resistance = support;
        support *= 1 - gaussianRandom(5 * sigma, 2*sigma);
    }


    chart_data.push({date: counter, price: price, drift: drift, support: support, resistance: resistance, sigma: sigma,
        equity: money, opp_equity: opp_money});
    chart_data = chart_data.slice(-500);
    counter += 1;

    // chance of changing parameters (drift)
    if (Math.random() < 0.05) {
        drift = 1*((Math.floor(Math.random()*2)) - 0.5);
    }

    // chance of changing volatility
    //if (Math.random() < 0.05) {
    //    sigma = gaussianRandom(3.5/100, 2/100);
    //}

   // change volatility smoothly
   sigma *= (1 + gaussianRandom(0, 3/100)); //(Math.random()-0.5) / 10;
   // return to mean
   sigma *= (1-0.001*(sigma - mean_sigma)/mean_sigma);


    // check loser
    if (money <= 0) {
        document.getElementById('message').textContent = 'Player lost!'
        money = 0;
        shares = 0;
        run = false;
    }

    if (opp_money <= 0) {
        document.getElementById('message').textContent = 'Computer lost!'
        opp_money = 0;
        opp_shares = 0;
        run = false;
    }

    // check winner
    if (counter == 1000) {
        run = false
        let msg = document.getElementById('message');
        msg.textContent = 'Game over: ';
        if (money > opp_money) {
            msg.textContent +='player won.';
        } else if (money < opp_money) {
            msg.textContent +='computer won.';
        } else {
            msg.textContent += 'tie.';
        }

    }
}

// Main loop
function update() {
    opp_trade();
    update_state();
    updateDisplay();
    updateChart();
}

function play() {
    if (run) {
        update();
        setTimeout(play, 250);
    }
}

document.getElementById('Update').onclick = function() {
    update();
}

document.getElementById('Buy').onclick = function() {
    let shares_to_buy = document.getElementById("amount").valueAsNumber;
    shares += shares_to_buy;

    // pay the spread
    money -= spread * shares_to_buy
    updateDisplay();
}

document.getElementById('Sell').onclick = function() {
    let shares_to_sell = document.getElementById("amount").valueAsNumber;
    shares -= shares_to_sell;

    // pay the spread
    money -= spread * shares_to_sell;
    updateDisplay();
}

document.getElementById('play').onclick = function() {
    run = true;
    play();
}

document.getElementById('stop').onclick = function() {
    run = false;
}

// initialize chart
for(let i = 0; i < 500; i++) {
    update_state();
};


updateChart();
updateDisplay();
updateDisplay();
