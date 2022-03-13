
let current_report = {};

let calendar = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

function formatAMPM(date) {
    let hours = date.getHours();
    let minutes = date.getMinutes();
    let ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12;
    minutes = minutes < 10 ? '0'+minutes : minutes;
    let strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
  }

function get_todays_date() {
    let current = document.getElementById("current");
    let today = new Date();
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };

    current.innerHTML = "Last Updated: " + today.toLocaleDateString(undefined, options)
    +  " at " + formatAMPM(today);
}

function fillTable() {
    let jsonArray = current_report;
    let numOfJsonOb = jsonArray.length;

    if (numOfJsonOb === 0) {
        let table = document.getElementById("MainTable");
        let row = table.insertRow(1);

        let item = row.insertCell(0);
        let total_req = row.insertCell(1);
        let current_inv = row.insertCell(2);
        let lead_time = row.insertCell(3);
        let lead_time_qty = row.insertCell(4);
        let order_qty = row.insertCell(5);
        let order_date = row.insertCell(6);
        let PO = row.insertCell(7);

        item.innerHTML = "N/A";
        total_req.innerHTML = "N/A";
        current_inv.innerHTML = "N/A";
        lead_time.innerHTML = "N/A";
        lead_time_qty.innerHTML = "N/A";
        order_qty.innerHTML = "N/A";
        order_date.innerHTML = "N/A";
        PO.innerHTML = "N/A";
    } else {

        for (let i = 0; i < numOfJsonOb; ++i) {
            let table = document.getElementById("MainTable");
            let row = table.insertRow(1);
            row.setAttribute("id", "row" + i);
            row.addEventListener('click', function (e) {
                if(weekView.style.display === "none") {
                    weekView.setAttribute("style", "display: visible");
                } else {
                    weekView.setAttribute("style", "display: none");
                }
            });
            row.setAttribute("style", "cursor: pointer; cursor: hand;");

            let item            = row.insertCell(0);
            let total_req       = row.insertCell(1);
            let current_inv     = row.insertCell(2);
            let lead_time       = row.insertCell(3);
            let lead_time_qty   = row.insertCell(4);
            let order_date      = row.insertCell(5);
            let future_order_qty = row.insertCell(6);
            let incomming_qty   = row.insertCell(7);
            let PO              = row.insertCell(8);

            item.innerText = jsonArray[i].item;
            total_req.innerHTML = jsonArray[i].total_req;
            current_inv.innerHTML = jsonArray[i].current_inv;
            lead_time.innerHTML = jsonArray[i].lead_time;
            lead_time_qty.innerHTML = jsonArray[i].lead_time_qty;
            incomming_qty.innerHTML = jsonArray[i].incomming_qty;
            order_date.innerHTML = jsonArray[i].order_date;
            PO.innerHTML = jsonArray[i].PO;
            future_order_qty.innerHTML = jsonArray[i].order_qty

            let weekView = document.createElement("td");
            weekView.setAttribute("id", "weekView" + i);
            weekView.setAttribute("colspan", "8");
            weekView.setAttribute("class", "table-bordered");
            weekView.setAttribute("style", "display:none;");

            row = table.insertRow(2);
            row.appendChild(weekView);
            getWeekView(i, weekView, report);

            
        }
    }
}



function getWeekView(itemIndex, weekView) {
    let jsonArray = current_report;

    let tableToAdd = document.createElement('table');
    let itemName = jsonArray[itemIndex];
    //Set the Monthly Header
    let monthHeader = tableToAdd.insertRow(0);
    for (let i = 0; i < 12; ++i) {
        let cell = document.createElement('th');
        cell.setAttribute("class", "gray");
        cell.innerText = calendar[i];
        monthHeader.appendChild(cell);
    }
    //console.log(itemName);


    //Get the data and set the calendar
    let calendarInfo = tableToAdd.insertRow(1);
    for (let j = 0; j < 12; ++j) {
        //console.log("Arrived here3");
        let cell = document.createElement("td");
        cell.setAttribute("class", jsonArray[itemIndex].parts_calendar[j][1]);
        cell.innerHTML = jsonArray[itemIndex].parts_calendar[j][0];
        calendarInfo.appendChild(cell);
    }

    weekView.appendChild(tableToAdd);
    return;
}

frappe.ready(async function () {
    //frappePostRequest()
    get_todays_date();
    //fillTable();
    fillTableDriver();

    document.getElementById('refreshButton').addEventListener('click', function (e) {
        //fillTable();
        fillTableDriver();

    });
});

function clearTable(table) {
    while (table.rows.length > 1) {
        table.deleteRow(1);
    }
}

// refrenced and modified from https://flexiple.com/bubble-sort-javascript/
function bubbleSort (jsonArray, compareFunction) {
    let len = jsonArray.length - 1;
    let modified;
    do {
        modified = false;
        for (let i = 0; i < len; i++) {
            if (compareFunction(jsonArray[i], jsonArray[i + 1])) {
                let tmp = jsonArray[i];
                jsonArray[i] = jsonArray[i + 1];
                jsonArray[i + 1] = tmp;
                modified = true;
            }
        }
    } while (modified);
    return jsonArray;
};


function soonestOrderDate(jsonObjectOne, jsonObjectTwo) {
    return jsonObjectOne.order_date < jsonObjectTwo.order_date;
}

async function fillTableDriver() {
    let table = document.getElementById("MainTable");
    clearTable(table)
    let row = table.insertRow(1);
    row.classList.add("loadingIcon");
    row.innerHTML = `<td class="loadingIconParent" colspan="8"><i class="loadingIcon fas fa-spinner fa-spin fa-5x"></i></td>`
    let report = await getItemReportFromDatabase();
    let sorted_report = bubbleSort(report, soonestOrderDate);
    clearTable(table)
    
    fillTable(sorted_report);
    console.log("##### OBJECT #####");
    console.log(report);
    console.log("##### String #####");
    console.log(JSON.stringify(report));
    
  }

  async function fillTableDriverTestData() {
    let table = document.getElementById("MainTable");
    clearTable(table)
    let row = table.insertRow(1);
    row.innerHTML = `<i colspan="8" class="loadingIcon fas fa-spinner fa-spin fa-5x"></i>`
    current_report = await getItemReportFromDatabase();
    //current_report = testJson;
    clearTable(table)
    
    fillTable(jsonTestArray);
    console.log("##### OBJECT #####");
    console.log(report);
    console.log("##### String #####");
    console.log(JSON.stringify(report));
    
  }



