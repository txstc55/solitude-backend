const confessionsController = require("../controllers/confessionsController")


module.exports = app => {
    app.route('/confessions').post(confessionsController.post_confession).get(confessionsController.get_random_confession);
}