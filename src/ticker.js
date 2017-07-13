const path = require('path');
const request = require('request');
const parseJson = require('parse-json');
const { app, BrowserWindow, TouchBar } = require('electron');
const { TouchBarButton } = TouchBar;

const buttons = [];
const currencies = [
  {
    productId: 'BTC-USD',
    icon:      'btc.png'
  },
  {
    productId: 'ETH-USD',
    icon:      'eth.png'
  }
];

currencies.forEach(({ productId, icon }) => {
  buttons.push(new TouchBarButton({
    icon:            path.join(__dirname, `/currencies/${icon}`),
    iconPosition:    'left',
    backgroundColor: '#fff',
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
        button.label = `${currency.productId}: error!`;
        return;
      }

      const json = parseJson(body);
      button.label = `$${parseFloat(json.price, 2)}`;
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
