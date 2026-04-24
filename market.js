class market {
    
    price = 100;
    mean_sigma = 2/100;
    box_strength = 1.85;
    box_size = 5;
    drift_strength = 1;
    drift_change_p = 0.05;


    sigma;
    drift = 0;
    support;
    resistance;
    spread = 0.01;

    time = 0;

    data = [];


    update() {
        // support and resistance
        let force = 0;
        if (this.price > this.resistance) force = -this.box_strength*this.sigma;
        if (this.price < this.support) force = this.box_strength*this.sigma;

        let pct_change = gaussianRandom(0, this.sigma) + this.drift*this.sigma + force;
        this.price *= 1 + pct_change;


        // if still above resistance of below support, update values
        if (force != 0 && this.price > this.resistance) {
            this.support = this.resistance;
            this.resistance *= 1 + gaussianRandom(this.box_size * this.sigma, 2*this.sigma);
        }
        if (force != 0 && this.price < this.support) {
            this.resistance = this.support;
            this.support *= 1 - gaussianRandom(this.box_size * this.sigma, 2*this.sigma);
        }

        this.data.push({time: this.time, price: this.price, drift: this.drift,
            support: this.support, resistance: this.resistance, sigma: this.sigma});
    
        //this line throws away data.
        //this.data = this.data.slice(-500);

        // chance of changing parameters (drift)
        if (Math.random() < this.drift_change_p) {
            this.drift = this.drift_strength*((Math.floor(Math.random()*2)) - 0.5);
        }

        // change volatility smoothly
        this.sigma *= (1 + gaussianRandom(0, 3/100));
        // return to mean
        this.sigma *= (1-0.001*(this.sigma - this.mean_sigma)/this.mean_sigma);

        this.time += 1;

        // return percent change from last price to aid trader balance update.
        return pct_change;
    }

    initialize() {
        for(let i = 0; i < 500; i++) {
            this.update();
        }
    }

    constructor(price, volatility) {
        this.price = price;
        this.mean_sigma = volatility;
        this.sigma = volatility;

        this.support = (1-2*this.sigma)*this.price;
        this.resistance = (1+2*this.sigma)*this.price;
    }
}

class random_market extends market {
    constructor(price, volatility) {
        super(price, volatility);
    }

    update() {
        let pct_change = gaussianRandom(0, this.sigma) + this.drift*this.sigma;
        this.price *= 1 + pct_change;

        this.data.push({time: this.time, price: this.price, drift: this.drift,
            support: this.support, resistance: this.resistance, sigma: this.sigma});
    
        this.time += 1;

        // return percent change from last price to aid trader balance update.
        return pct_change;
    }
}

class trending_market extends market {
    constructor(price, volatility, trend) {
        super(price, volatility);
        this.box_strength = 0;
        this.drift_strength = trend;
    }
}


class channel_market extends market {
    box_strength;
    box_var;

    constructor(price, volatility, box_size=5, box_strength=1.85, box_var=2) {
        super(price, volatility);
        this.box_size = box_size;
        this.box_strength = box_strength;
        this.box_var = box_var;
    }


    update() {
        // support and resistance
        let force = 0;
        if (this.price > this.resistance) force = -this.box_strength*this.sigma;
        if (this.price < this.support) force = this.box_strength*this.sigma;

        let pct_change = gaussianRandom(0, this.sigma) + this.drift*this.sigma + force;
        this.price *= 1 + pct_change;


        // if still above resistance of below support, update values
        if (force != 0 && this.price > this.resistance) {
            this.support = this.resistance;
            this.resistance *= 1 + gaussianRandom(this.box_size * this.sigma, this.box_var*this.sigma);
        }
        if (force != 0 && this.price < this.support) {
            this.resistance = this.support;
            this.support *= 1 - gaussianRandom(this.box_size * this.sigma, this.box_var*this.sigma);
        }

        this.data.push({time: this.time, price: this.price, drift: this.drift,
            support: this.support, resistance: this.resistance, sigma: this.sigma});
    
        this.time += 1;

        return pct_change;
    }
}

// stonks go up
class bias_market extends market {
    constructor(price, volatility, drift) {
        super(price, volatility);
        this.box_strength = 0;
        this.drift = drift;

    }

    update() {

        let pct_change = gaussianRandom(0, this.sigma) + this.drift*this.sigma;
        this.price *= 1 + pct_change;


        this.data.push({time: this.time, price: this.price, drift: this.drift,
            support: this.support, resistance: this.resistance, sigma: this.sigma});
    
        this.time += 1;

        return pct_change;
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
