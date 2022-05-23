const mongoose = require('mongoose');
const chatBox = mongoose.model('chatBoxTexts');


var currentIndex = 0;

exports.get_text_by_index = async (req, res) => {
    try {
        // console.log("Getting request for post: " + req.query.index);
        const post = await chatBox.findOne({ index: req.query.index }) // use id to find the user
        const data = await post.toJSON();
        return res.send(data);
    } catch (e) {
        // we cannot find the cookie or some shit happened
        return res.status(403).send({
            message: 'Side with index ' + req.query.index + " not found"
        })
    }
}

exports.post_text = async (req, res) => {
    try {
        // console.log("Posting request for post: " + currentIndex + ", text: " + req.body.text);
        await chatBox.findOneAndUpdate({ index: currentIndex }, { text: req.body.text });
        currentIndex += 1;
        currentIndex = currentIndex % 6
        return res.status(200).send({
            message: "Message sent to face index " + ((currentIndex + 6 - 1) % 6) + "."
        })
    } catch (e) {
        return res.status(400).send({
            message: "Something went wrong when inserting new text"
        })
    }
}




