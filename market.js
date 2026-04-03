class market {
    
    price = 100;
    mean_sigma = 2/100;
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
        if (this.price > this.resistance) force = -1.85*this.sigma;
        if (this.price < this.support) force = 1.85*this.sigma;

        let pct_change = gaussianRandom(0, this.sigma) + this.drift*this.sigma + force;
        this.price *= 1 + pct_change;


        // if still above resistance of below support, update values
        if (force != 0 && this.price > this.resistance) {
            this.support = this.resistance;
            this.resistance *= 1 + gaussianRandom(5 * this.sigma, 2*this.sigma);
        }
        if (force != 0 && this.price < this.support) {
            this.resistance = this.support;
            this.support *= 1 - gaussianRandom(5 * this.sigma, 2*this.sigma);
        }

        this.data.push({time: this.time, price: this.price, drift: this.drift,
            support: this.support, resistance: this.resistance, sigma: this.sigma});
    
        //this line throws away data.
        //this.data = this.data.slice(-500);

        // chance of changing parameters (drift)
        if (Math.random() < 0.05) {
            this.drift = 1*((Math.floor(Math.random()*2)) - 0.5);
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


// Standard Normal variate using Box-Muller transform.
function gaussianRandom(mean=0, stdev=1) {
    const u = 1 - Math.random(); // Converting [0,1) to (0,1]
    const v = Math.random();
    const z = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
    // Transform to the desired mean and standard deviation:
    return z * stdev + mean;
}
