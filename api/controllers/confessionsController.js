const mongoose = require('mongoose');
const confession = mongoose.model('confessions');


var banliststr = process.env.SOLITUDE_BAN_LIST || ""
var banlistarray = banliststr.split(" ")
var banlistarrayHashed = []
for (var i = 0; i < banlistarray.length; i++) {
    banlistarrayHashed.push(require('crypto').createHash('md5').update(banlistarray[i]).digest('hex'));
}
console.log(banlistarray.includes("185.129.62.62"))
console.log(require('crypto').createHash('md5').update("185.129.62.62").digest('hex'))
console.log(require('crypto').createHash('md5').update("185.129.62.62").digest('hex'))


var banlist = new Set([banlistarrayHashed])
console.log(banlist.has(require('crypto').createHash('md5').update("185.129.62.62").digest('hex')))
var viewBanList = new Set([])
var viewlist = {};

function clearViewBanlist() {
    viewBanList = new Set([])
    viewlist = {}
    // clear the banlist ever hour
    setTimeout(clearViewBanlist, 1000 * 60 * 60);
}

clearViewBanlist();

// if every view request is less than 1 second, it's a bot
function banViewbot(ip) {
    if (ip in viewlist) {
        if ((new Date() - viewlist[ip].time) / 1000 <= 1) {
            viewlist[ip].count += 1;
        }
        viewlist[ip].time = new Date();
        if (viewlist[ip].count >= 500) {
            viewBanList.add(ip);
        }
    } else {
        viewlist[ip] = { count: 1, time: new Date() };
    }
}

exports.get_random_confession = async (req, res) => {
    try {
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        // get the ip and hash it
        const ip_hashed = require('crypto').createHash('md5').update(ip).digest('hex')
        if (banlist.has(ip_hashed)) {
            return res.status(404).send({ message: "BANNED" })
        }
        if (viewBanList.has(ip_hashed)) {
            return res.status(404).send({ message: "You've been viewing too fast" })
        }
        banViewbot(ip_hashed);
        var filtered = await confession.find({ seenIPs: { "$nin": [ip_hashed] } });
        const count = filtered.length;
        if (count == 0) {
            return res.status(403).send({ message: "There are no confessions at the moment" })
        }
        const random = Math.floor(Math.random() * count);
        var randomConfession = filtered[random];
        const text = randomConfession.text;
        // update the confession items
        if (randomConfession.viewCount >= 200 - 1) {
            await confession.deleteOne({ _id: randomConfession._id });
        } else {
            await confession.findOneAndUpdate({ _id: randomConfession._id }, { $inc: { viewCount: 1 }, "$push": { "seenIPs": ip_hashed } })
        }
        return res.status(200).send({ text: text })
    } catch (e) {
        // some shit happened
        return res.status(403).send({
            message: "Something went wrong " + e
        })
    }
}

var offendList = {}
exports.post_confession = async (req, res) => {
    try {
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const ip_hashed = require('crypto').createHash('md5').update(ip).digest('hex')
        if (banlist.has(ip_hashed)) {
            return res.status(404).send({ message: "BANNED" })
        }
        var oldConfession = await confession.findOne({ ip: ip_hashed }, {}, { sort: { lastPostTime: -1 } });
        if (oldConfession) {
            if (oldConfession.lastPostTime) {
                var now = new Date();
                const secondsPassed = (now - oldConfession.lastPostTime) / 1000;
                if (secondsPassed <= 600) {
                    if (ip_hashed in offendList) {
                        offendList[ip_hashed] += 1;
                        if (offendList[ip_hashed] >= 5) {
                            // add to banlist
                            console.log(ip + " has been banned");
                            banlist.add(ip_hashed);
                            // remove from offend list
                            delete offendList[ip_hashed];
                            // delete any confession from this ip
                            await confession.deleteMany({ ip: ip_hashed })
                            return res.status(404).send({
                                message: "BANNED"
                            })
                        }
                    } else {
                        offendList[ip_hashed] = 1;
                    }
                    return res.status(404).send({
                        message: "Time limit"
                    })
                }
            }
        }
        // console.log("Posting confession, text: " + req.body.text);
        const newConfession = new confession({ text: req.body.text, viewCount: 0, ip: ip_hashed, lastPostTime: new Date() });
        await newConfession.save();
        return res.status(200).send()
    } catch (e) {
        return res.status(400).send({
            message: "Something went wrong when creating this confession, error: " + e
        })
    }
}




