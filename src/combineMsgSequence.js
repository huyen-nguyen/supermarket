let fileName = "FullServiceCheckoutBase.tsv";

loadData(fileName);

function loadData(fileName){
    d3.tsv("data/" + fileName, function (err, data){
        if (err) throw err;
        else {
			d3.select("body").append("h2")
				.attr("id", "header")
            d3.select("body").append("div")
                .attr("id", "main" );

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
        	let order = msg.split(":")[0];
            let content = msg.split(":")[1];
            let condition = "";

            if (order.includes("[")){		// contain condition
                order = order.split("[")[0];
                condition = " (if " + msg.split(":")[0].split("[")[1].split("]")[0] + ") ";
            }

            array.push({	// array of all individual messages
                order: order.trim().replace("F", "L"),
                condition: condition.trim(),
                content: content.trim(),
                From: d.From,
                To: d.To
            })
        })
    })

	// sort by sequence order number
	array.sort((a, b) => {
		if (a.order > b.order) {
			return 1;
		}
		if (a.order < b.order) {
			return -1;
		}
		return 0;
	})
	return array;
}

function print(fileName, data){
    let array = combine(data);
    let bigString = "";

    array.forEach(msg => {
    	let c = desc(msg.content);
        bigString += '<span class="seqNumber">' + msg.order + ': </span>' +
            '<span class="description">' + msg.condition +' </span>' +
            '<span class="object">' + processAlg(msg.From) +'</span>' +
            '<span class="description"> ' + c.verb + ' </span>' +
            '<span class="object">' + processAlg(msg.To) +'</span>' +
            '<span class="description"> ' + c.content +  '</span>' +
            '<br><br>';
    })

	let s = "FullServiceCheckoutBase.tsv"
	d3.select("#header").html(fileName.split(".")[0].replace(/[A-Z]/g, m => " " + m) + " Message Sequence Description");
    d3.select("#main").html(bigString)
}

function processAlg(string){
    if (string.includes("algorithm")){
        return string.split(">>")[1] + " Algorithm";
    }
    return string
}

function desc(content){
	let c = content.toLowerCase();
	let primaryVerb = ["prompt to", "prompt for"]
    let secondaryVerb = ["retrieve ", "open ", "print ", "display ", "compute ", "update ", "request ", "insert ", "calculate ", "scale ", "store "]

    // if there exists a verb above
    if (secondaryVerb.some(d => c.includes(d))) {
        return {
            verb: "informs",
            content: "to " + c
        }
    }

    let pVerb = primaryVerb.find(d => c.includes(d))
    if (pVerb){
    	let main = pVerb.split(" ")[0];
    	return {
    		verb: main + "s",
			content: c.replace(main, "")
		}
	}

    return {
        verb: "sends to ",
        content: c
    }
}
