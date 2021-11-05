let fileName = "FullServiceCheckoutBase.tsv";

loadData(fileName);

function loadData(fileName){
    d3.tsv("data/" + fileName, function (err, _data){
        if (err) throw err;
        else {
            d3.select("body").append("div")
                .attr("id", "msgSequence" );

            print(_data, "#msgSequence")
        }
    })
}

function combine(data){
    let array = [];

    data.forEach(d => {
        d.Content = d.Content.replace(/[A-Z][0-9]/g, m => "|" + m);
        console.log(d)

        // if content has |
        d.Content.split("|").filter(m => m.length > 0).forEach(msg => {
            console.log(msg)

            let order = msg.split(":")[0];
            let content = msg.split(":")[1];
            let condition = "";

            if (order.includes("[")){
                order = order.split("[")[0];
                condition = " (if " + msg.split(":")[0].split("[")[1].split("]")[0] + ") ";
            }

            array.push({
                order: order.trim(),
                condition: condition.trim(),
                content: content.trim(),
                From: d.From,
                To: d.To
            })
        })
    })


    return array.sort((first, second) => {
        let a = first.order.replaceAll(".", "");
        let b = second.order.replaceAll(".", "");
        if (a > b) {
            if (a.includes(b)){
                return -1;
            }
            return 1;
        }
        if (a < b) {
            return -1;
        }
        return 0;
    })
}

function print(data, div){
    let array = combine(data);

    let bigString = "";

    array.forEach(msg => {
        bigString += '<span class="seqNumber">' + msg.order + ': </span>' +
            '<span class="description">' + msg.condition +'</span>' +
            '<span class="object">' + processAlg(msg.From) +'</span>' +
            '<span class="description">' + desc(msg.content).verb + '</span>' +
            '<span class="object">' + processAlg(msg.To) +'</span>' +
            '<span class="description"> ' + desc(msg.content).content +  '</span>' +
            '<br><br>';
    })

    d3.select(div).html(bigString)




}

function processAlg(string){
    if (string.includes("algorithm")){
        return string.split(">>")[1] + " Algorithm";
    }
    return string
}

function desc(content){
    let verbArray = ["retrieve", "open", "print", "display", "compute", "update", "request", "insert"]

    // // if there exists a verb above
    // if (verbArray.filter(d => content.includes(d)).length > 0)
    // {
    //     return {
    //         verb: " informs ",
    //         content: " to " + content.toLocaleLowerCase()
    //     }
    // }

    return {
        verb: " sends to ",
        content: content.toLocaleLowerCase()
    }
}