/** dummy data **/
var msgs = [
    [1, "Becky", "Meat Loaf"],
    [2, "Cinny", "Scrambled Eggs"],
    [3, "Sean", "Ramen"],
    [4, "Tanay", "Chicken Nuggets"]
];

var users = [
    ["Team02", "/img/profile_picture.jpg"],
    ["team002", "/img/profile_picture.jpg"],
    ["team0002", "/img/profile_picture.jpg"]
]

$(function () {
    //load navbar
    $('#navbar_holder').load('/components/navbar.html', function () {
        onNavBarLoaded();
        $('.site_name').html('<i class="fa fa-user-o"></i> My Profile');
    });

    $('#footer_holder').on('footerLoaded', function () {
        //hide no user option in user type controller
        updateNavMenuItems();
    });

    // load current user info
    getUserInfo(getUserID());

    // uploaded recipes is the default tab
    controlTab();
});

var defaultProfileImg = "/img/profile_picture.jpg";

function getUserInfo(userId) {
    editUserFormAction(userId);
    var url = '/user/' + userId;

    $.ajax({
        url: url,
        type: "GET",
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", "Bearer " + getToken());
        },
        statusCode: {
            401: function (response) {
                console.error(response);
            }
        },
        success: function (user) {
            // update user info to UI
            if (user) {
                // information section
                if (userId == getUserID()) {
                    // required user info
                    $('#userName').html(user['userName']);
                    // optional user info
                    $('#email').html(user['email'] || "[Email is not provided]");
                    $('#description').html(user['description'] || "[Description is not provided]");
                    $('#profilePhoto').attr('src', user['profilePhoto'] || defaultProfileImg);
                }

                // fill in edit profile form
                $('#editUserForm-photo').attr('src', user['profilePhoto'] || defaultProfileImg);
                $('#email-input').val(user['email']);
                $('#description-input').val(user['description']);
            }
        }
    });
}

/* Save User Profile changes */
function saveProfile(userId = getUserID()) {
    var url = '/user/' + userId;
    var params = {};

    var img = sessionStorage.getItem("profilePhoto");
    var email = $('#email-input').val();
    var description = $('#description-input').val();

    if (img && img != $('#profilePhoto').attr('src')) {
        params['profilePhoto'] = img;
    }
    if (email && email != $('#email').html()) {
        params['email'] = email;
    }
    if (description && description != $('#description').html) {
        params['description'] = description;
    }
    if ($('#editProfile-content')[0].checkValidity()) {
        $.ajax({
            url: url,
            type: "PUT",
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(params),
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authorization", "Bearer " + getToken());
            },
            statusCode: {
                401: function (response) {
                    console.error(response);
                },
                413: function (response) {
                    alert('File size is too large.');
                }
            },
            success: function (user) {
                sessionStorage.removeItem("profilePhoto");
                if (userId == getUserID()) {
                    getUserInfo(userId);
                } else {
                    populateUserCards();
                }
                hide('edit-profile');
            }
        });
}
}

function editUserFormAction(id) {
    $('#editProfile-content').attr('action', 'javascript:saveProfile(' + id + ');');
}

/* Save Reset Password */
function savePwd(userId = getUserID()) {
    var url = '/user/' + userId + '/password';
    var params = {'password': $('#oldPwd').val(), 'newPassword': $('.repeated-pwd:visible').val()};

    if (checkPasswordMatch()) {
        $.ajax({
            url: url,
            type: "PUT",
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(params),
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authorization", "Bearer " + getToken());
            },
            statusCode: {
                401: function (response) {
                    console.error(response);
                },
                403: function (response) {
                    console.error(response);
                    $('#invalidOldPwd').html('Password is incorrect.');
                }
            },
            success: function (user) {
                hide('reset-pwd');
            }
        });
}
}

function controlTab() {
    var user_type = getUserType();

    if (user_type === USER_TYPE_USER) {
        $('#notification-tab').hide();
        $('#users-tab').hide();
        $('#user-section').hide();
        $('#addUser').hide();
        $('#feedback-tab').hide();
        $('#feedback-section').hide();
    }
    if (user_type === USER_TYPE_ADMIN) {
        $('#notification-tab').show();
        $('#notification-tab').addClass('w3-border-red');
        $('#users-tab').show();
        $('#user-section').hide();
        $('#addUser').hide();
        $('#feedback-tab').show();
        $('#feedback-section').hide();

        //load user cards and feedback cards
        populateUserCards();
        populateFeedback();
    }

    //load notification messages
    populateNotifications({});
}

function filterNotification() {
    var params = {};

    var type = $("input[name=fileType]:checked").val();
    if (type == "favorite") {
        hide('commented');
        hide('favorited');
        hide('rated');
        // clear params
        params = {};
        params['recipetype'] = 'favorite';
    } else {
        show('commented');
        show('favorited');
        show('rated');
        // clear params
        params = {};
        if (type == 'uploaded') {
            params['recipetype'] = 'uploaded';
        }
    }

    var actions = [];
    $("input[class=actionTypes]:checked").each(function () {
        var val = this.value;
        if (val == "updated") {
            actions.push('update');
        } else if (val == "deleted") {
            actions.push('delete');
        } else if (val == "commented" && type != "favorite") {
            actions.push('comment');
        } else if (val == "favorited" && type != "favorite") {
            actions.push('favorite');
        } else if (val == "rated" && type != "favorite") {
            actions.push('rate');
        }
    });

    if (actions.length > 0) {
        params['actiontype'] = actions;
        populateNotifications(params);
    } else {
        $(".msg-card").html('');
        $('#noNoti').show();
    }
}

// notification part
function populateNotifications(params) {
    $('#noNoti').hide();
    var query = '/notification';

    if (params['actiontype'] != null) {
        query = query + '?' + $.param(params);
    }

    $.ajax({
        url: query,
        type: "GET",
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", "Bearer " + getToken());
        },
        statusCode: {
            401: function (response) {
                console.error(response);
            }
        },
        success: function (notifications) {
            $(".msg-card").html('');
            if (!notifications.length) {
                $('#noNoti').show();
            }
            notifications.forEach(function (noti) {
                var recipeName = noti['recipeName'];
                var favoriteIncluded = ['delete', 'update'];
                if (params['recipetype'] == "favorite" && favoriteIncluded.indexOf(recipeName) || params['recipetype'] != "favorite") {
                    var fileType = noti['recipeOwnerId'] == getUserID() ? 'Your Uploaded Recipe ' : 'Your Favorite Recipe ';

                    var msg = fileType + '<b>' + recipeName + '</b>' + noti['actionTypeMsg'] + '<b>' + noti['operatorName'] + '</b>';

                    $(".msg-card").append($(getNotificationMsgs(noti['actionTypeName'], msg, noti['recipeId'], noti['recipeIsDeleted'])));
                }
            });
        }
    });
}

function getNotificationMsgs(type, msg, recipeId, isDeleted) {
    var href = "/pages/recipe_view.html?id=" + recipeId;

    var link = isDeleted ? "" : '" onclick="location.href=\'' + href + '\'">';

    var labels = {};
    labels['rate'] = "fa-star";
    labels['update'] = "fa-pencil";
    labels['comment'] = "fa-commenting-o";
    labels['favorite'] = "fa-heart";
    labels['unfavorite'] = "fa-heart-o";
    labels['delete'] = "fa-trash-o";

    return '<div class="w3-padding-large w3-card-2 w3-white w3-round w3-margin w3-hover-shadow"' +
            link + '<p><i class="fa ' + labels[type] + ' fa-fw w3-margin-right">' +
            '</i>' + msg + '</p>' +
            '</div>';
}

function getFeedback(feedback, name, email) {
    var message = feedback;

    if (typeof name == 'undefined' && typeof email == 'undefined') {
        message = feedback;
    } else if (typeof name == 'undefined') {
        message = email + ': ' + message;
    } else if (typeof email == 'undefined') {
        message = name + ': ' + message;
    } else {
        message = name + ' (' + email + '): ' + message;
    }
    return '<div class="feedback_entries w3-padding-large w3-card-2 w3-white w3-round w3-margin w3-hover-shadow">' +
            '<p>' + message + '</p>' + '</div>';
}

// open tab
function openTab(evt, tabName) {
    var i, x, tablinks;
    x = document.getElementsByClassName("set-tab");
    for (i = 0; i < x.length; i++) {
        x[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablink");
    for (i = 0; i < x.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" w3-border-red", "");
    }
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.firstElementChild.className += " w3-border-red";
}

function getUserCard(name, photo, id) {
    return '<section class="w3-left w3-margin w3-card-4 w3-white w3-container w3-padding w3-center userCardBackground">' +
            '<img src="' + photo + '" class="user-card-photo w3-margin-top" alt="Profile Photo">' +
            '<h5>' + name + '</h5>' +
            '<div class="w3-section">' +
            '<button class="w3-button w3-green w3-margin userCardBtn" onclick="show(\'edit-profile\'); getUserInfo(' + id + ');">Edit</button>' +
            '<button class="w3-button w3-red w3-margin userCardBtn" onclick="deleteUser(' + id + ')">Delete</button>' +
            '</div>' +
            '</section>';
}

function deleteUser(id) {
    var confirmed = deleteConfirm("user");
    if (confirmed) {
        var url = '/user/' + id;
        $.ajax({
            url: url,
            type: "DELETE",
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authorization", "Bearer " + getToken());
            },
            success: function (user) {
                populateUserCards();
            },
            error: function (request, status, error) {
                alert(request.responseText);
            }
        });
    }
}