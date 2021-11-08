
// binance chart data WebSoket
// install a live server to make it work
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
    

    priceStorage.push(currentPrice);

    if(priceStorage.length > 40){

    }
    
    updatePolygonPrice(currentPrice);
    //console.log(stockObject);
    //console.log(priceStorage);
    //lastPrice = currentPrice;
}

// price alert based on MACD

let EMA12 = (2/(12+1));
let EMA26 = (2/(26+1));
let EMA9 = (2/(9+1));

async function priceAlert(){
  let { times, prices } = await maticData();
  var dateTime = [];
  var priceOnTime = [];

  times.forEach(element => {
    var date = new Date(element * 1000);
    var month = date.getMonth();
    var day = date.getDate();
    var hours = date.getHours();
    var minutes = "0" + date.getMinutes();
    var seconds = "0" + date.getSeconds();

    var formattedTime = (month + 1) + '-' + day + ' | ' + hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);

    dateTime.push(formattedTime);
  });

  for(var x = 0; x < prices.length; x++){
    var data = {
      price: prices[x],
      time: dateTime[x]
    };
    
    priceOnTime.push(data);
  }

  // EMA 12 -- Value starts at 12th line
  var EMA12ListPrice = [];
  let EMA12Value = 0;

  for( var x = 0; x < 12; x++ ){
    EMA12Value += priceOnTime[x].price;
  }

  let EMA12Average = EMA12Value/12;
  EMA12ListPrice.push(EMA12Average);

  let prevEMA12Price = EMA12Average;
  priceOnTime.forEach(function(price, index, array) {
    if(index>11){
      var EMA12Price = (price.price - prevEMA12Price)*EMA12+prevEMA12Price;
      EMA12ListPrice.push(EMA12Price);
      prevEMA12Price = EMA12Price;
    }
  });

  // EMA 26 -- Value starts at 26th line
  var EMA26ListPrice = [];
  let EMA26Value = 0;

  for( var x = 0; x < 26; x++ ){
    EMA26Value += priceOnTime[x].price;
  }

  let EMA26Average = EMA26Value/26;
  EMA26ListPrice.push(EMA26Average);

  let prevEMA26Price = EMA26Average;
  priceOnTime.forEach(function(price, index, array) {
    if(index>25){
      var EMA26Price = (price.price - prevEMA26Price)*EMA26+prevEMA26Price;
      EMA26ListPrice.push(EMA26Price);
      prevEMA26Price = EMA26Price;
    }
  });

  // MACD getting the difference between EMA12 and EMA26
  var MACDLine = [];
  EMA12ListPrice.forEach(function(price, index, array) {
    if(index>13){
      let MACDValue = price - EMA26ListPrice[index-14];

      var MACDList = {
        MACDLine: MACDValue,
        time: dateTime[index+11]
      };

      MACDLine.push(MACDList);
    }
  });

  // EMA 9 -- Value starts at 9th line of the MACD
  var EMA9ListLine = [];
  let EMA9Value = 0;

  for( var x = 0; x < 9; x++ ){
    EMA9Value += MACDLine[x].MACDLine;
  }

  let EMA9Average = EMA9Value/9;
  EMA9ListLine.push(EMA9Average);

  let prevEMA9Line = EMA9Average;
  MACDLine.forEach(function(line, index, array) {
    if(index>8){
      var EMA9Line = (line.MACDLine - prevEMA9Line)*EMA9+prevEMA9Line;
      prevEMA9Line = EMA9Line;

      var EMA9List = {
        EMA9Line: prevEMA9Line,
        time: dateTime[index+25]
      };

      EMA9ListLine.push(EMA9List);
    }
  });

  let prevBuyLine = false;
  let prevSellLine = false;
  EMA9ListLine.forEach(function (line, index, array){
    var alertPrice = priceOnTime[index+33].price;

    
    if(line.EMA9Line < MACDLine[index+8].MACDLine && prevSellLine){
      $("#buySignal").text("buy signal at : " + line.time + " for " + alertPrice);
      $("#buySignal").css("color", "blue");
    }
    if (line.EMA9Line > MACDLine[index+8].MACDLine && prevBuyLine){
      $("#sellSignal").text("sell signal at : " + line.time + " for " + alertPrice);
      $("#sellSignal").css("color", "red");
    }

    prevBuyLine = line.EMA9Line < MACDLine[index+8].MACDLine;
    prevSellLine = line.EMA9Line > MACDLine[index+8].MACDLine;
  });


  // let profit = 0;
  // let previousPrice = 0;
  // for (x = 0; x < priceOnTime.length; x++){

  //   profit = priceOnTime[x].price - previousPrice;

  //   if(profit > 2){
  //     profit = 0;
  //     console.log("profit value: " + profit + " | time hit: " + priceOnTime[x].time);
  //   }

  //   previousPrice = priceOnTime[x].price;
  // }
  // console.log(profit);
  // console.log(priceOnTime);
}

// chart data
// the code below is a modified code from https://codepen.io/diggitydoge/pen/MWWmgJp

///  Calling API and modeling data for each chart ///
const maticData = async () => {
    const response = await fetch('https://min-api.cryptocompare.com/data/v2/histoday?fsym=MATIC&tsym=USD&limit=119&api_key=0646cc7b8a4d4b54926c74e0b20253b57fd4ee406df79b3d57d5439874960146');
    const json = await response.json();
    const data = json.Data.Data
    const times = data.map(obj => obj.time)
    const prices = data.map(obj => obj.close)
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
    let { times, prices } = await maticData();
  
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
  async function updatePolygonPrice(currentPrice) {
    let { times, prices } = await maticData()
    //let currentPrice = prices[prices.length-1].toFixed(3);
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
  
  //updatePolygonPrice();
  printMaticChart();
  priceAlert();
