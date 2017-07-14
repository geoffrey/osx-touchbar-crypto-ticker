const path = require('path');
const request = require('request');
const parseJson = require('parse-json');
const { app, BrowserWindow, TouchBar } = require('electron');
const { TouchBarLabel } = TouchBar;

const buttons = [];
const currencies = [
  {
    productId: 'BTC-USD',
    symbol:    '\u20bf'
  },
  {
    productId: 'ETH-USD',
    symbol:    '\u039e'
  }
];

currencies.forEach(({ productId, icon }) => {
  buttons.push(new TouchBarLabel({
    label:           ''
  }));
});

const getLatestTick = (id, callback) => {
  var options = {
    url: `https://api.gdax.com/products/${id}/ticker`,
    headers: {
      'User-Agent': 'request'
    }
  };

  request(options, callback);
}

const updateTickers = () => {
  buttons.forEach((button, index) => {
    const currency = currencies[index];
    getLatestTick(currency.productId, (error, response, body) => {
      if (error) {
        button.label = `${currency.symbol}: error!`;
        return;
      }

      const json = parseJson(body);
      const price = parseFloat(json.price, 2);
      if (currency.price < price) {
        button.textColor = '#98FB98';
      } else if (currency.price > price) {
        button.textColor = '#FB9898';
      } else {
        button.textColor = '#FFFFFF';
      }
      button.label = `${currency.symbol} ${price.toFixed(2)}`;
      currency.price = price;
    })
  });
}

const update = () => {
  setInterval(updateTickers, 2000)
};

updateTickers();

const touchBar = new TouchBar(buttons);

let window;

app.once('ready', () => {
  window = new BrowserWindow({
    width:  300,
    height: 200
  });

  window.loadURL(`file://${path.join(__dirname, '/index.html')}`);
  window.setTouchBar(touchBar);
  update();
})

// Quit when all windows are closed and no other one is listening to this.
app.on('window-all-closed', () => {
  app.quit();
});
