const fetch = require("fetch-retry");
const xml2js = require("xml2js");
const fs = require("fs");

const options = {
    dataUrl: "https://www.currency-iso.org/dam/downloads/lists/list_one.xml",
    outFile: "data.json"
};

async function fetchData() {
    let invalid = [];

    let data = await fetch(options.dataUrl, {
        method: "GET"
    });

    data = await data.text();
    data = await parseData(data);
    data = data["ISO_4217"]["CcyTbl"];

    if (Array.isArray(data)) {
        data = data[0];
    }

    data = data["CcyNtry"];

    data = data.map(set => {
        let obj = {};
        if (isValid(set, "CtryNm")) {
            obj.countryName = getValue(set, "CtryNm");
        } else {
            invalid.push(set);
            return;
        }
        if (isValid(set, "CcyNm")) {
            obj.currencyName = getValue(set, "CcyNm");
        } else {
            invalid.push(set);
            return;
        }
        if (isValid(set, "Ccy")) {
            obj.currency = getValue(set, "Ccy");
        } else {
            invalid.push(set);
            return;
        }
        if (isValid(set, "CcyNbr")) {
            obj.currencyNumber = getValue(set, "CcyNbr");
        } else {
            invalid.push(set);
            return;
        }
        if (isValid(set, "CcyMnrUnts")) {
            obj.currencyUnits = getValue(set, "CcyMnrUnts");
        } else {
            invalid.push(set);
            return;
        }
        return obj;
    });

    data = removeNull(data);

    console.log("Invalid/skipped currencies: " + JSON.stringify(invalid));

    fs.writeFile("data.json", JSON.stringify(data), err => {
        if (err) console.error(err);
        console.log("Finished exporting currencies");
        process.exit();
    });
}

function removeNull(data) {
    return data.filter(set => set);
}

function getValue(set, key) {
    let value = set[key][0];
    let type = typeof value;
    if (type === "string") {
        return value;
    } else if (type === "object" && value.hasOwnProperty("_") && typeof value._ === "string") {
        return value._;
    }
}

function isValid(set, key) {
    if (set.hasOwnProperty(key) && Array.isArray(set[key])) {
        return true;
    }
    return false;
}

function parseData(str) {
    return new Promise((resolve, reject) => {
        xml2js.parseString(str, (err, res) => {
            if (err) return reject(err);
            resolve(res);
        })
    })
}

fetchData();