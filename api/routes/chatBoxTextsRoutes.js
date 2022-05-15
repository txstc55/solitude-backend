const chatBoxController = require("../controllers/chatBoxTextsController")


module.exports = app => {
    app.route('/post').post(chatBoxController.post_text).get(chatBoxController.get_text_by_index);
}