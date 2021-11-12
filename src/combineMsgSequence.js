let fileNameArray = ["Self-ServiceLoyalCustomer.tsv", "TriggerAlarm.tsv", "Self-ServicePayWithCREDIT-DEBIT.tsv","Self-ServicePayWithCashVP.tsv","Self-ServiceExtraDiscount.tsv","Self-ServiceDisplayLanguageVP.tsv","Self-ServiceApplyCouponsVP.tsv", "RecordCustomer.tsv", "LoyalCustomer.tsv","ApplyCouponsDisplayLanguageVP.tsv","FullServiceCheckoutBase.tsv", "SendInventory.tsv", "InventoryPredictionVP.tsv"];

fileNameArray.sort();

loadData(fileNameArray[2]);

function loadData(fileName){
    d3.tsv("data/" + fileName, function (err, data){
        if (err) throw err;
        else {
        	// set up dropdown
			let dropdown = d3.select("body").append("div")
				.attr("class", "dropdown").style("float", "right");
			dropdown.append("button").attr("class", "dropbtn").html("Select Communication Diagram")
			dropdown.append("div").attr("class", "dropdown-content").attr("id", "menu")

			d3.select("#menu")
				.selectAll("span")
				.data(fileNameArray)
				.enter()
				.append("span")
				.text(d => formatTitle(d))
				.on("click", d => {
					d3.tsv("data/" + d, function (nerr, newdata){
						if (nerr) throw nerr
						print(d, newdata)
					})
				})

			// set up header and main
			d3.select("body").append("h2").attr("id", "header")
            d3.select("body").append("div").attr("id", "main" );

            print(fileName, data)
        }
    })
}

function combine(data){
    let array = [];

    data.forEach(d => {
    	// separate different messages by |
        d.Content = d.Content.replace(/[A-Z][0-9]/g, m => "|" + m);

        // if content has multiple messages separated by |
        d.Content.split("|").filter(m => m.length > 0).forEach(msg => {
            // console.log(msg)
        	let order = msg.split(":")[0];
            let content = msg.split(":")[1];
            let condition = "";

            if (order.includes("[")){		// contain condition
                order = order.split("[")[0];
                condition = "[" + msg.split(":")[0].split("[")[1].split("]")[0] + "]";
            }

            let order2 = order.trim().replace("F", "L");

            array.push({	// array of all individual messages
                order: order2,
                condition: condition.trim(),
                content: content.trim(),
                From: d.From,
                To: d.To,
				head: order2.includes(".") ? order2.substr(0, order2.indexOf(".")) : order2,
				int: parseInt(order.includes(".") ? order.split(".")[1] : "0")
            })
        })
    })

	// sort by sequence order number
	array.sort((a, b) => {
		if (a.order > b.order) {
			if ((a.int < b.int) && (a.head === b.head)){	// if nothing strange, go with usual string comparison
				return -1;									// but flip if order of int conflicts
			}
			return 1;			// default
		}
		if (a.order < b.order) {
			if ((a.int > b.int) && (a.head === b.head)){	// only flip if conflicts
				return 1;
			}
			return -1; 			// default
		}
		return 0;				// default
	})

	return array;
}

function comma(str){
    if (str[str.length-1] === ",") return str.substring(0, str.length - 1);
    return str
}

function addDot(str){
	let countDot = (str.match(/\./g) || []).length;

	if (countDot < 2){
		str = countDot ? str + "." : str + "..";
	}
	return str
}

function orderToSort(str){
    if (!str.includes(".")) return str;

    let arr = str.split(".")
    if (parseInt(arr[1]) > 9) return str

    arr[1] = arr[1].replace(/[\d][^\d]/g, m => "0" + m);   // add 0 before number
    return arr.join(".")
}

function print(fileName, data){
    let array = combine(data);
    let bigString = "";

    array.forEach(msg => {
    	let c = desc(msg.content);
        bigString += '<span class="seqNumber">' + msg.order + '</span>' +
            '<span class="seqNumber">' + msg.condition +': </span>' +
            '<span class="object">' + processAlg(msg.From) +'</span>' +
            '<span class="description"> ' + c.verb + ' </span>' +
            '<span class="object">' + processAlg(msg.To) +'</span>' +
            '<span class="description"> ' + comma(c.content) +  '.</span>' +
            '<br><br>';
    })

	d3.select("#header").html(formatTitle(fileName) + " Message Sequence Description");
    d3.select("#main").html(bigString)
}

function formatTitle(fileName){
	return fileName.split(".")[0].replace(/[A-Z]+/g, m => " " + m)
        .replaceAll("- ", "-")
}
function processAlg(string){
    if (string.includes("algorithm")){
        return string.split(">>")[1] + "<span class='description'> algorithm</span>";
    }
    return string
}

function desc(content){
	let c = content.toLowerCase();
	let primaryVerb = ["prompt to", "prompt for", "return to"]
    let secondaryVerb = ["retrieve ", "open ", "print ", "display ", "compute ", "update ", "request ", "insert ", "calculate ", "scale ", "store ", "create ",
    "query ", "add ", "dismiss ", "record ", "stop ", "activate ", "send ", "get ", ]

    // if there exists a verb above
    if (secondaryVerb.some(d => c.includes(d))) {
        return {
            verb: "informs",
            content: "to " + c
        }
    }

    // if action is required from source
    let pVerb = primaryVerb.find(d => c.includes(d))
    if (pVerb){
    	let main = pVerb.split(" ")[0];
    	return {
    		verb: main + "s",
			content: c.replace(main, "")
		}
	}

    // otherwise
    return {
        verb: "sends to ",
        content: c
    }
}
