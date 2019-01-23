module.exports = function (app, Feedback) {

    // send feedback to database
    app.post('/feedback', function (req, res) {
        if (!req.body.feedback) {
            console.error("Could not submit: Missing feedback");
            return res.status(400).json({
                status: 400,
                message: "Could not submit: Missing feedback"
            });
        }
        Feedback.create({'feedback': req.body.feedback, 'name': req.body.name, 
            'email': req.body.email}, function (err, newFeedback) {
            if (err) {
                return console.error(err);
            }
            return res.status(200).json({
                status: 200,
                message: newFeedback
            });
        });
    });

    // get feedback list
    app.get('/feedback', function (req, res) {
        if (!req.auth || !req.isAdmin) {
            return res.status(401).json({
                status: 401,
                message: "Request failed: Authentication failed"
            });
        } else {
            Feedback.find({}, function (err, fb) {
                if (err) {
                    console.error(err);
                }
                if (!fb.length) {
                    return res.status(404).json({
                        status: 404,
                        message: "No feedback found."
                    });
                } else {
                    res.json(fb);
                }
            });
        }
    });
};