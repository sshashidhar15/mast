/**
 * Created by m.kumar on 6/06/2017.
 */
var _ = require('lodash');

var jsonData = {
    "title": "Commodities Trading – Online Commodity Trading Brokers",
    "meta": "Online commodity trading is flexible and easy with IC Markets. Trade on different commodities such as Brent, WTI etc. Contact us NOW!",
    "icmarketsoffers": "IC Markets offers a flexible and easy way to gain exposure to some of the world’s most popular commodities including energies and metals all from within your MetaTrader 4, 5, and cTrader trading platform.",
    "commoditymarketsare": "Commodity markets are attractive to speculators as they are susceptible to dramatic changes in supply and demand.",
    "tradablecommodities": "Tradeable Commodities",
    "spreadsfrom": "Spreads from",
    "tradecommodities": "Trade Commodities",
    "commodities": "Commodities",
    "over19commoditiestotrade": "Over 19 Commodities to trade",
    "energyagricultureandmetals": "Energy, Agriculture and Metals",
    "spotandfuturesCFDs": "Spot and Futures CFDs",
    "leverageupto1isto500": "Leverage up to 1:500",
    "spreadsaslowas0dot0pips": "Spreads as low as 0.0 pips",
    "deepliquidity": "Deep liquidity",
    "energies": "Energies",
    "icmarketsallows": "IC Markets allows trading of spot energy contracts including Crude Oil, Brent, and Natural Gas from your MetaTrader 4 and 5 platforms against the US Dollar.",
    "tradingenergy": "Trading energy contracts as a spot instrument has many advantages for investors who are only interested in price speculation. The spot price is derived as a combination of the first and second nearby month of the futures contract. This pricing method diminishes the level of volatility.",
    "pricingoverview": "Pricing overview",
    "preciousmetals": "Precious Metals",
    "icmarketsallowstradingthespotpriceformetals": "IC Markets allows trading the spot price for metals including Gold or Silver against the US Dollar or Euro and the metals Platinum or Palladium against the US Dollar as a currency pair on 1:500 leverage.",
    "softcommodities": "Soft Commodities",
    "inadditiontoenergyandmetalcontracts": "In addition to energy and metal contracts, at IC Markets we offer a range of soft commodity products to trade, including corn, soybeans, sugar, coffee, and wheat as CFDs – all with low spreads and leverage up to 1:100.",
    "contractdetails": "Contract Details",
    "icmarkets": "IC Markets",
    "contractspecificationsheet": "Contract Specification Sheet",
    "prividesfurtherinformation": "provides further information regarding the commodities on offer.",
    "benefitsoftradingcommoditieswithicmarkets": "Benefits of trading Commodities with IC Markets",
    "starttradingcommoditieswith": "Start trading Commodities with  IC Markets today",
    "How does commodity trading work?": "",
    "Commodities cover energy, agriculture and metals products. These products are traded in futures markets and derive their value from demand and supply characteristics. Supply characteristics include the weather in the case of agriculture and costs of extraction in the case of mining and energies. Demand for commodities tends to be characterised by broader conditions such as economic cycles and population growth. Commodities can be traded as stand alone products or in pairs. Metals and energies are traded against major currencies whereas agriculture futures contracts are traded as stand-alone contracts.": "",
    "Commodity trading example": "",
    "Opening the position": "",
    "Wheat_N7 is currently trading at 434.00/435.25 and you are expecting Australia’s East Coast crops to be affected by adverse weather patterns over the coming year which will result in lower than average crop yields. ": "",
    "You buy 100 contracts of Wheat (4 bushels per contract) at 435.25 which equals USD $174,100 (435.25 * 100 * 4). ": "",
    "Closing the position": "",
    "Your research surrounding weather conditions turns out to be correct. Lower crop yields this year have caused Wheat prices to increase to 460.00/462.15. You exit your position by selling your contracts at 460.": "",
    "he gross profit on your trade is calculated as follows:": ""
}

var result = {};
_.map(jsonData, (value, key) => {
    console.log("value", value);
    console.log("Key", key);
    if (value === "") {
        value = key;
    }
    let subStrLen = 30;
    let isDuplicateKey = false;
    let newKey1;
    let newKey = key.toLowerCase().replace(/\s+/g, '').replace(/\/+/g, '').replace(/\.+/g, '').substr(0, subStrLen);
    while (result[newKey] !== undefined && !isDuplicateKey) {
        subStrLen += 5;
        newKey1 = key.toLowerCase().replace(/\s+/g, '').replace(/\/+/g, '').substr(0, subStrLen);
        console.log("duplicate found", result[newKey]);
        console.log("new key", newKey1);
        if (newKey === newKey1) {
            isDuplicateKey = true;
        }
        if (subStrLen > key.toLowerCase().replace(/\s+/g, '').replace(/\/+/g, '').replace(/\.+/g, '').length) {
            break;
        }
    }
    if (newKey1) {
        result[newKey1] = value.trim();
    } else {
        result[newKey] = value.trim();
    }
});

// console.log(result)
console.log("result \n\n", JSON.stringify(result));

console.log('\n')

// format the output using
// https://jsonformatter.org/