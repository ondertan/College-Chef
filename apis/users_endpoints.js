module.exports = function (app, sha1, generateToken, isDefined, logout, User) {

    // login
    app.post('/login', function (req, res) {
        console.log("Start logging in");
        if (!req.body.userName || !req.body.password) {
            console.error("Login failed: Missing userName and/or password in request");
            return res.status(400).json({
                status: 400,
                message: "Login failed: Missing userName and/or password in request"
            });
        }
        User.findOne({'userName': req.body.userName, 'password': sha1(req.body.userName + req.body.password)},
                '_id userName isAdmin', function (err, user) {
                    if (err) {
                        console.error(err);
                    }
                    if (!user) {
                        return res.status(403).json({
                            status: 403,
                            message: "Login failed: userName or password is incorrect"
                        });
                    } else {
                        var token = generateToken(user._id);
                        console.log("Logged in");
                        res.json({
                            userId: user._id,
                            userName: user.userName,
                            isAdmin: user.isAdmin,
                            token: token
                        });
                    }
                });
    });

    // logout
    app.get('/logout', function(req, res) {
        console.log(req.auth);
        if (!req.auth) {
            return res.status(401).json({
                status: 401,
                message: "Authentication failed."
            });        
        } else {
            logout(req, res);
        }
    });

    // create user
    app.post('/user', function (req, res) {
        if (!req.body.userName || !req.body.password) {
            return res.status(400).json({
                status: 400,
                message: "Create user failed: Missing userName and/or password in request"
            });
        }
        User.findOne({'userName': req.body.userName}, function (err, user) {
            if (err) {
                console.error(err);
            }
            if (user)
            {
                return res.status(403).json({
                    status: 403,
                    message: "Username is already in use"
                });
            } else {
                User.create({'userName': req.body.userName, 'email': req.body.email,
                    'password': sha1(req.body.userName + req.body.password)}, function (err, createdUser) {
                    if (err) {
                        return console.error(err);
                    }
                    if (createdUser) {
                        console.log("User created");
                        return res.status(200).json({
                            status: 200,
                            message: createdUser
                        });
                    }
                });
            }
        });
    });

    // delete user
    app.delete('/user/:userId', function (req, res) {
        var userId = parseInt(req.params.userId);
        if (!req.auth) {
            return res.status(401).json({
                status: 401,
                message: "Request failed: Not logged in"
            });
        } else if (!req.isAdmin) {
            return res.status(401).json({
                status: 401,
                message: "Request failed: Lacking admin credentials"
            });
        } else if (req.userID == userId) {
            return res.status(403).json({
                status: 403,
                message: "Request failed: Admins can not delete themselves."
            });
        } else if (isDefined(userId)) {
            User.deleteOne({'_id': userId}, function (err, result) {
                if (err) {
                    console.error(err);
                }
                return res.status(200).json({
                    status: 200,
                    message: result
                });
            });
        } else {
            return res.status(400).json({
                status: 400,
                message: "Request failed: Missing user id."
            });
        }
    });

    // get user info
    app.get('/user/:userId', function (req, res) {
        if (!req.auth) {
            console.error("Request failed: Not logged in");
            return res.status(401).json({
                status: 401,
                message: "Request failed: Not logged in"
            });
        }
        // only admin or the user himself can fetch profile
        if (!req.isAdmin && req.userID != parseInt(req.params.userId)) {
            console.error("Request failed: Lacking proper credentials");
            return res.status(401).json({
                status: 401,
                message: "Request failed: Lacking proper credentials"
            });
        }
        User.findOne({'_id': parseInt(req.params.userId)},
                '_id userName email isAdmin description profilePhoto', function (err, user) {
                    if (err) {
                        console.error(err);
                    }
                    if (!user) {
                        return res.status(403).json({
                            status: 403,
                            message: "Request failed"
                        });
                    }
                    res.json({
                        userId: user._id,
                        userName: user.userName,
                        email: user.email,
                        isAdmin: user.isAdmin,
                        description: user.description,
                        profilePhoto: user.profilePhoto
                    });
                });
    });

    // change password
    app.put('/user/:userId/password', function (req, res) {
        if (!req.auth) {
            return res.status(401).json({
                status: 401,
                message: "Request failed: Authorization failed."
            });
        } else if (!req.isAdmin && req.userID != parseInt(req.params.userId)) {
            return res.status(401).json({
                status: 401,
                message: "Request failed: Lacking proper credentials"
            });
        } else if (!req.body.password || !req.body.newPassword) {
            return res.status(400).json({
                status: 400,
                message: "Request failed: Missing password(s)"
            });
        } else {
            User.findOneAndUpdate({'_id': parseInt(req.params.userId), 'password': sha1(req.userName + req.body.password)},
                    {$set: {'password': sha1(req.userName + req.body.newPassword)}}, function (err, result) {
                if (err) {
                    console.error(err);
                }
                if (result)
                {
                    return res.status(200).json({
                        status: 200,
                        message: result
                    });
                } else {
                    return res.status(403).json({
                        status: 403,
                        message: 'Invalid password or user does not exist.'
                    });
                }
            });
        }
    });

    // edit user profile
    app.put('/user/:userId', function (req, res) {
        if (!req.auth) {
            return res.status(401).json({
                status: 401,
                message: "Authorization failed."
            });
        } else if (!req.isAdmin && req.userID != parseInt(req.params.userId)) {
            return res.status(401).json({
                status: 401,
                message: "Request failed: Lacking proper credentials"
            });
        } else {
            var toUpdate = {};
            if (req.body.description)
            {
                toUpdate["description"] = req.body.description;
            }
            if (req.body.profilePhoto)
            {
                toUpdate["profilePhoto"] = req.body.profilePhoto;
            }
            if (req.body.email)
            {
                toUpdate["email"] = req.body.email;
            }

            User.findOneAndUpdate({'_id': req.params.userId}, toUpdate, {new : true}, function (err, updatedUser) {
                if (err) {
                    console.error(err);
                }
                if (updatedUser)
                {
                    return res.status(200).json({
                        status: 200,
                        message: updatedUser
                    });
                } else {
                    return res.status(403).json({
                        status: 403,
                        message: "No user in database"
                    });
                }
            });
        }
    });

    // get list of users
    app.get('/users', function (req, res) {
        if (!req.auth || !req.isAdmin) {
            return res.status(401).json({
                status: 401,
                message: "Authentication failed or lacking proper credentials(not admin)."
            });
        } else {
            // only looking for non-admin users
            User.find({'isAdmin': 'false'}, function (err, users) {
                if (err) {
                    console.error(err);
                }
                if (!users.length) {
                    return res.status(404).json({
                        status: 404,
                        message: "No users found."
                    });
                } else {
                    return res.json(users);
                }
            });
        }
    });
};