
// binance chart data WebSoket
const ws = new WebSocket("wss://stream.binance.com:9443/ws/maticusdt@trade");
let lastPrice = null;
var priceStorage = [];

ws.onmessage = (event) => {
    let stockObject = JSON.parse(event.data);
    let currentPrice = parseFloat(stockObject.p).toFixed(3);
    
    $("#polygon-price").text(currentPrice);

    if (lastPrice == currentPrice){
        $("#polygon-price").css("color", "black");
    }
    else if(lastPrice > currentPrice){
        $("#polygon-price").css("color", "red");
    }
    else { // currentPrice > lastprice
        $("#polygon-price").css("color", "green");
    }
    lastPrice = currentPrice;

    priceStorage.push(currentPrice);

    if(priceStorage.length > 40){

    }

    //console.log(stockObject);
    //console.log(priceStorage);
}

// chart data
// the code below is a modified code from https://codepen.io/diggitydoge/pen/MWWmgJp

///  Calling API and modeling data for each chart ///
const maticData = async () => {
    const response = await fetch('https://min-api.cryptocompare.com/data/v2/histominute?fsym=MATIC&tsym=USD&limit=119&api_key=0646cc7b8a4d4b54926c74e0b20253b57fd4ee406df79b3d57d5439874960146');
    const json = await response.json();
    const data = json.Data.Data
    const times = data.map(obj => obj.time)
    const prices = data.map(obj => obj.high)
    return {
      times,
      prices
    }
  }
  
  
  /// Error handling ///
  function checkStatus(response) {
    if (response.ok) {
      return Promise.resolve(response);
    } else {
      return Promise.reject(new Error(response.statusText));
    }
  }
  
  /// Charts ///
  let createMaticChart
  
  async function printMaticChart() {
    let { times, prices } = await maticData()
  
    let maticChart = document.getElementById('maticChart').getContext('2d');
  
    let gradient = maticChart.createLinearGradient(0, 0, 0, 400);
  
    gradient.addColorStop(0, 'rgba(115, 86, 218,.5)');
    gradient.addColorStop(.425, 'rgba(255,193,119,0)');
  
    Chart.defaults.global.defaultFontFamily = 'Red Hat Text';
    Chart.defaults.global.defaultFontSize = 12;
  
    createMaticChart = new Chart(maticChart, {
      type: 'line',
      data: {
        labels: times,
        datasets: [{
          label: '$',
          data: prices,
          backgroundColor: gradient,
          borderColor: 'rgba(115, 86, 218,1)',
          borderJoinStyle: 'round',
          borderCapStyle: 'round',
          borderWidth: 3,
          pointRadius: 0,
          pointHitRadius: 10,
          lineTension: .2,
        }]
      },
  
      options: {
        title: {
          display: false,
          text: 'Heckin Chart!',
          fontSize: 35
        },
  
        legend: {
          display: false
        },
  
        layout: {
          padding: {
            left: 0,
            right: 0,
            top: 0,
            bottom: 0
          }
        },
  
        scales: {
          xAxes: [{
            display: false,
            gridLines: {}
          }],
          yAxes: [{
            display: false,
            gridLines: {}
          }]
        },
  
        tooltips: {
          callbacks: {
            //This removes the tooltip title
            title: function() {}
         },
          //this removes legend color
          displayColors: false,
          yPadding: 10,
          xPadding: 10,
          position: 'nearest',
          caretSize: 10,
          backgroundColor: 'rgba(255,255,255,.9)',
          bodyFontSize: 15,
          bodyFontColor: '#303030' 
        }
      }
    });
  }
  
  /// Update current price ///  
  async function updatePolygonPrice() {
    let { times, prices } = await maticData()
    let currentPrice = prices[prices.length-1].toFixed(3);
  
    $("#maticPrice").text("$" + currentPrice);
    if (lastPrice == currentPrice){
        $("#maticPrice").css("color", "black");
    }
    else if(lastPrice > currentPrice){
        $("#maticPrice").css("color", "red");
    }
    else { // currentPrice > lastprice
        $("#maticPrice").css("color", "green");
    }
    lastPrice = currentPrice;
  }
  
  updatePolygonPrice();
  printMaticChart();
