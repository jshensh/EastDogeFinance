var request = require('request'),
    firstBy = require('./thenBy.js');

oldIDs=[];
var getTicket=function(str) {
    var tickets=str.match(/<li>([\s\S]*?)<\/li>/ig),op=[];
    for (var i=0;i<tickets.length;i++) {
        var bank=tickets[i].match(/(小银票|票据理财)(\d*?)<.*?>(.*?)<\//),
            opTmp=tickets[i].match(/([^>]*?)<i>/g),
            processTmp=tickets[i].match(/<div class=\"bill-btn-wrap\">[\s\S]*?>([\s\S]*?)<\/a>/);
        if (bank!==null && opTmp!==null && processTmp!==null) {
            if (processTmp[1]==="立即购买") {
                op.push([bank[2],bank[3],opTmp[0].replace("<i>",""),opTmp[1].replace(/<i>|,/g,""),opTmp[2].replace("<i>","")]);
            }
        }
    }
    return op;
};
var main=function() {
    var n=typeof arguments[0]=="undefined"?1:arguments[0];
    var cbArr=typeof arguments[1]=="undefined"?[]:arguments[1];
    request('http://bill.jr.jd.com/buy/list.htm?page='+n+'&from=&n=0&t=0&s=0&o=0#listContent', function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var tmpArr=getTicket(body);
            if (tmpArr.length>=10 && n<=5) {
                main(n+1,cbArr.concat(tmpArr));
            } else {
                doSendMessage(cbArr.concat(tmpArr));
            }
            cbArr.concat(getTicket(body));
        } else {
            main(n,cbArr);
        }
    });
};
var doSendMessage=function(arr) {
    var tickets=arr.sort(
        firstBy(function (v1, v2) { return v2[2] - v1[2]; }).
        thenBy(function (v1, v2) { return v2[3] - v1[3]; }).
        thenBy(function (v1, v2) { return v1[4] - v2[4]; }).
        thenBy(function (v1, v2) { return v2[0] - v1[0]; })
    ),
        thisIDs=[], messages=[];
    for (var i=0;i<tickets.length;i++) {
        thisIDs.push(tickets[i][0]);
        messages.push("#"+tickets[i][0]+", "+tickets[i][1]+", "+tickets[i][2]+"%, 剩余 "+tickets[i][3]+" 元, "+tickets[i][4]+" 天");
    }
    if (global.oldIDs.toString()!==thisIDs.toString()) {
        global.oldIDs=thisIDs.concat();
        request.post({url:'http://rlwechat.sxb.party/admin/kf.php?touser=oORXywBByJQH1SIYUw15W_RYvJqs', form: {"text":"小银票更新"+(messages.length>=5?"，收益前五高":"")+":\n"+messages.slice(0,5).join("\n")}}, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                console.log(body);
            }
        });
    }
};

main();
setInterval(main, 60000);