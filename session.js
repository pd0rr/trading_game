class session {
    markets = [];
    traders = [];

    time = 0;
    chart_data = [];

    initialize() {
        for(let i = 0; i < 500; i++) {

            // update markets
            for(let j = 0; j < this.markets.length; j++) {
                this.markets[j].update();
            }

            let row = {time: this.time};
            // update balance chart
            for(let j = 0; j < this.traders.length; j++) {
                row[j] = this.traders[j].balance;
            }
            this.chart_data.push(row);

            this.time++;
        }
    }

    // update market prices and trader balances for next step
    step() {

        // first cache old prices
        let old_prices = [];
        let pct_changes = [];

        for (let i = 0; i < this.markets.length; i++) {
            old_prices.push(this.markets[i].price);
            pct_changes.push(this.markets[i].update());
        }

        // now update balances
        for (let i = 0; i < this.traders.length; i++) {
            this.traders[i].update_balance(old_prices, pct_changes);
        }

        // update chart data
        let row = {time: this.time};
        for (let i = 0; i < this.traders.length; i++) {
            row[i] = this.traders[i].balance;
        }
        this.chart_data.push(row);

        this.time++;
    }
}

class trader {
    balance = 10000;
    positions = [];
    markets = [];

    constructor(markets) {
        this.markets = markets;
        this.positions = new Array(markets.length).fill(0);
    }

    update_balance(prices, pct_changes) {
        for (let i = 0; i < this.markets.length; i++) {
            let held_value = prices[i] * this.positions[i];
            let new_value = held_value * (1 + pct_changes[i]);
            this.balance += new_value - held_value;

        }
    }

    trade(shares, index) {
        this.positions[index] += shares;
        this.balance -= this.markets[index].spread * shares;
    }
}

// donchian channel based on price (close)
function donch_channel(chart_data, n) {
    let prices = chart_data.map((r) => r.price).slice(-n-1, -1);
    return {top: Math.max(...prices), bottom: Math.min(...prices)};
}


class donch_ai extends trader {
    trade(index) {
        // trade based on donchian channels
        let donch = donch_channel(this.markets[index].data, 20);

        let price = this.markets[index].price;

        let size = 1 * this.balance / price;

        let oldpos = this.positions[index];
        if (price > donch.top && this.positions[index] <= 0) {
            this.positions[index] = size;
            // pay the spread
            this.balance -= this.markets[index].spread * (size-oldpos);
            console.log(this.markets[index].spread * (size-oldpos)); // dbg

        } else if (price < donch.bottom && this.positions[index] >= 0) {
            this.positions[index] = -size;
            // pay the spread
            this.balance -= this.markets[index].spread * (size+oldpos);
            console.log(this.markets[index].spread * (size+oldpos)); // dbg
        }
    }
}