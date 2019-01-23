module.exports = function (connection, Schema, autoIncrement) {
    var UserSchema = new Schema({
        userName: {type: String, required: true, unique: true},
        email: String,
        // password is sha1 encoded result of userName + password
        password: {type: String, required: true},
        isAdmin: {type: Boolean, default: false},
        description: String,
        profilePhoto: {type: String, default: "/img/profile_picture.jpg"}
    });

    UserSchema.plugin(autoIncrement.plugin, 'User');

    UserSchema.methods.introduce = function () {
        var greeting = "User " + this.userName + " created. " + (this.isAdmin ? "It's an Admin" : "It's a normal User");
        console.log(greeting);
    };

    return connection.model('User', UserSchema);
};
