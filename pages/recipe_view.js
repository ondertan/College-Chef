$(function () {
    //load navbar
    $('#navbar_holder').load('/components/navbar.html', function () {
        onNavBarLoaded();
    });

    // get recipe data
    fetchRecipeDetail();

    $(".user_only_evaluation").toggle(getUserType() !== null);
    $(window).on("loggedin", function () {
        $(".user_only_evaluation").toggle(getUserType() !== null);
        getMyRating();
        $(".favorite_wrapper").toggle(getUserType() !== null);
    });

    if (getUserType() !== null) {
        getMyRating();
    }
    getRatings();

    $('input[type=radio][name=rating]').change(function() {
        if (this.value != originalRate) {
            tryToRate(this.value);
        }
    });
});

function fetchRecipeDetail() {
    $.ajax({
        type: "GET",
        url: "/recipe/" + getUrlParameter("id"),
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        success: function (recipeResponse) {
            if (getUserType() == null) {
                recipeResponse["hasFavorited"] = false;
                loadRecipeDetail(recipeResponse);
            } else {
                recipeResponse["hasFavorited"] = true;
                // get is favorited
                $.ajax({
                    type: "GET",
                    url: "/recipe/" + getUrlParameter("id") + "/favorite",
                    dataType: "json",
                    contentType: "application/json; charset=utf-8",
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader("Authorization", "Bearer " + getToken());
                    },
                    success: function (favoriteResponse) {
                        recipeResponse["isFavorited"] = favoriteResponse["isFavorited"];
                        loadRecipeDetail(recipeResponse);
                    },
                    error: function (request, status, error) {
                        alert(request.responseText);
                    }
                });
            }
        },
        error: function (request, status, error) {
            alert(request.responseText);
        }
    });
}

var recipeDataCache;

function loadRecipeDetail(recipeResponse) {
    recipeDataCache = recipeResponse;
    // recipe card
    $("#recipe_card_holder").append($(
        getRecipeCard(recipeResponse["recipeId"], recipeResponse["recipeName"], recipeResponse["description"], recipeResponse["imgUrl"],
            RECIPE_CARD_DISPLAY, recipeResponse)));
    // instruction
    $("#instruction_holder").text(recipeResponse["instruction"]);
    // notes
    if (recipeResponse["notes"]) {
        $("#notes_holder").html(recipeResponse["notes"]);
    } else {
        $("#notes_section").hide();
    }
    // uploader
    $("#user_image").attr("src", recipeResponse["uploaderImg"]);
    $("#uploader_name_holder").text(recipeResponse["uploaderName"]);
    if (recipeResponse["modifierId"] != recipeResponse["uploaderId"]) {
        $("#modifier_name_holder").text(recipeResponse["modifierName"]);
        $("#modification_date_text").text("Modification Date: ");
    } else {
        $("#modifier_span").hide();
        $("#modification_date_text").text("Upload Date: ");
    }
    $("#modification_date_holder").text(new Date(recipeResponse["ModifiedDate"]).toGMTString());
    // ingredients
    for (var i = 0; i < recipeResponse["ingredients"].length; i++) {
        $("#ingredient_holder").append($(
                getIngredientLiElement(
                        recipeResponse["ingredients"][i]["name"],
                        recipeResponse["ingredients"][i]["imgUrl"],
                        recipeResponse["ingredients"][i]["amount"])
                ));
    };

    // hide favorite button
    $(".favorite_wrapper").toggle(getUserType() !== null);
    // fetch comments
    getAllTextComments();
    getAllImgComments();
};

function getIngredientLiElement(ingredientName, ingredientImg, ingredientAmount) {
    return '' +
            '<li class="w3-padding-16">' +
            '<img src="' + ingredientImg + '" alt="' + ingredientName + '" class="ingredient_list_img w3-left w3-margin-right">' +
            '<span class="w3-large">' + ingredientName + '</span><br>' +
            '<span>' + ingredientAmount + '</span>' +
            '</li>';
}

// get all comments
function getAllTextComments() {
    $(".post_feed").html('');
    var recipeId = getUrlParameter("id");
    var url = '/recipe/' + recipeId + '/comments/text';

    $.ajax({
        url: url,
        type: "GET",
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        success: function (comments) {
            comments.forEach(function (comment) {
                $('.noComments').addClass('w3-hide');
                if (comment['userName']) {
                    $(".post_feed").append($(populateComments(comment['profilePhoto'], comment['userName'],
                            new Date(comment['createdDate']).toGMTString(), comment['message'])));
                }
            });

            if (comments.length == 0) {
                $('.noComments').removeClass('w3-hide');
            }
            $('#commentsNum').html(comments.length);
        },
        error: function (request, status, error) {
            alert(request.responseText);
        }
    });
}

function populateComments(avatar, userName, createdDate, message) {
    return '<div class="w3-container w3-card-2 w3-hover-shadow w3-white w3-round w3-margin">' +
            '<div class="w3-container">' +
            '<img id="postAvatar" src="' + avatar + '" class="w3-circle avatar-style w3-left w3-margin-top" alt="avatar">' +
            '<section class="w3-container w3-left w3-margin-top w3-margin-left">' +
            '<h3>' + userName + '</h3><br>' +
            '<span>Created by <span class="w3-opacity">' + createdDate + '</span></span>' +
            '</section>' +
            '</div>' +
            '<hr>' +
            '<p>' + message + '</p>' +
            '</div>';
}

function postComment() {
    var recipeId = getUrlParameter("id");
    var url = '/recipe/' + recipeId + '/comments';
    var params = {'message': $('#postMsg').val(), "isImage": false};
    $.ajax({
        url: url,
        type: "POST",
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(params),
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", "Bearer " + getToken());
        },
        success: function (response) {
            $('#postMsg').val('');
            getAllTextComments();
        },
        error: function (request, status, error) {
            alert(request.responseText);
        }
    });
}

function viewImage(current) {
    $('#expandImg').attr("src", $(current).attr("src"));
    $("#expandImgModal").css("display", "block");
    $('#imdPoster').text($(current).attr("data-username"));
    $('#imgCreatedDate').text($(current).attr("data-date"));
}

var NO_MORE_IMG = "/img/nomore.png";
var NO_MORE_LEFT_MSG = "No more on the left";
var NO_MORE_RIGHT_MSG = "No more on the right";

function showNoMore(msg) {
    $('#expandImg').attr("src", NO_MORE_IMG);
    $("#expandImgModal").css("display", "block");
    $('#imdPoster').text(msg);
    $('#imgCreatedDate').text("");
}

function viewPrevImage() {
    var prev = null;
    var curr = null;
    var images = $(".image_comment");
    console.log(images);
    for (var i=0; i<images.length; i++) {
        if (($('#expandImg').attr("src") === NO_MORE_IMG && $('#imdPoster').text() === NO_MORE_LEFT_MSG)
            || $(images[i]).attr("src") === $('#expandImg').attr("src")) {
            curr = images[i];
            break;
        }
        prev = images[i];
    }
    if (prev != null) {
        viewImage(prev);
    } else {
        showNoMore(NO_MORE_LEFT_MSG);
    }
}

function viewNextImage() {
    var next = null;
    var curr = null;
    var images = $(".imgComments .image_comment");
    console.log(images);
    for (var i=images.length-1; i>=0; i--) {
        if (($('#expandImg').attr("src") === NO_MORE_IMG && $('#imdPoster').text() === NO_MORE_RIGHT_MSG)
            || $(images[i]).attr("src") === $('#expandImg').attr("src")) {
            curr = images[i];
            break;
        }
        next = images[i];
    }
    if (next != null) {
        viewImage(next);
    } else {
        showNoMore(NO_MORE_RIGHT_MSG);
    }
}

function populateImageCommandsCard(url, userName, createdDate) {
    return '<img class="w3-left image_comment w3-card w3-margin"' +
            ' onclick="viewImage(this)" src="' + url + '" alt="uploaded image"' +
        'data-username="'+userName+'" data-date="'+createdDate+'">';
}

function getAllImgComments() {
    $(".imgComments").html('');
    var recipeId = getUrlParameter("id");
    var url = '/recipe/' + recipeId + '/comments/image';

    $.ajax({
        url: url,
        type: "GET",
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        success: function (comments) {
            comments.forEach(function (comment) {
                $('.noImages').addClass('w3-hide');
                $(".imgComments").append($(populateImageCommandsCard(comment['message'], comment['userName'],
                        new Date(comment['createdDate']).toGMTString())));
            });

            if (comments.length == 0) {
                $('.noImages').removeClass('w3-hide');
            }
            $('#photosNum').html(comments.length);
        },
        error: function (request, status, error) {
            alert(request.responseText);
        }
    });
}

function uploadFile() {
    $("#attach-project-file").click();
}

function postImageComment(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();

        reader.onload = function (e) {
            var recipeId = getUrlParameter("id");
            var url = '/recipe/' + recipeId + '/comments';
            var params = {'message': e.target.result, "isImage": true};
            $.ajax({
                url: url,
                type: "POST",
                dataType: "json",
                contentType: "application/json; charset=utf-8",
                data: JSON.stringify(params),
                beforeSend: function (xhr) {
                    xhr.setRequestHeader("Authorization", "Bearer " + getToken());
                },
                statusCode: {
                    400: function (response) {
                        console.error(response);
                    },
                    401: function (response) {
                        console.error(response);
                    },
                    404: function (response) {
                        console.error(response);
                    },
                    413: function (response) {
                        alert('File size is too large.');
                    }
                },

                success: function (response) {
                    $('#imgComments').val('');
                    getAllImgComments();
                }
            });
        };
        reader.readAsDataURL(input.files[0]);
    }
}

var originalRate = 0;

// get user rating
function getMyRating() {
    $.ajax({
        type : "GET",
        url : "/recipe/"+getUrlParameter("id")+"/rate",
        dataType : "json",
        contentType: "application/json; charset=utf-8",
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", "Bearer " + getToken());
        },
        success : function (response) {
            if (response["scores"] == 0) {
                // not rated
                $("#your_rate_msg").text("Click to rate:");
            } else {
                // set rate
                setRateInUi(response["scores"]);
            }
        },
        error: function (request, status, error) {
            alert(request.responseText);
        }
    });
}

// get all ratings
function getRatings() {
    var request = {
        type : "GET",
        url : "/recipe/"+getUrlParameter("id")+"/ratinglist",
        dataType : "json",
        contentType: "application/json; charset=utf-8",
        success : function (response) {
            for (var i=0; i<response.length; i++) {
                $("#ratings_holder").append($(getRatingLi(response[i]["userName"], response[i]["scores"])));
            }
        },
        error: function (request, status, error) {
            alert(request.responseText);
        }
    };
    if (getToken() != null) {
        request["beforeSend"] = function (xhr) {
            xhr.setRequestHeader("Authorization", "Bearer " + getToken());
        };
    }
    $.ajax(request);
}

function getRatingLi(userName, rating) {
    return '' +
        '<li class="rating_li w3-padding-16">' +
        '<p>' + userName + ':</p>' +
        '<div>' + getStars(rating) + '</div>' +
        '</li>';
}

function tryToRate(newRate) {
    // confirm user if want to change rate if already rated before
    if (originalRate != 0) {
        var confirmed = confirm("Do you want to update the rate to "+newRate+" ?");
        if (confirmed) {
            doRate(newRate);
        } else {
            $("input[name=rating][value="+originalRate+"]").click();
        }
    } else {
        doRate(newRate);
    }
}

function doRate(rating) {
    $.ajax({
        type : "POST",
        url : "/recipe/"+getUrlParameter("id")+"/rate",
        dataType : "json",
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify({"scores": rating}),
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", "Bearer " + getToken());
        },
        success : function (response) {
            // set rate
            setRateInUi(response["scores"]);
            // update avg rating in recipe card
            updateAvgRating();
        },
        error: function (request, status, error) {
            alert(request.responseText);
        }
    });
}

function setRateInUi(rating) {
    $("#your_rate_msg").text("What you rated:");
    originalRate = rating;
    $("input[name=rating][value="+originalRate+"]").click();
}

function updateAvgRating() {
    $.ajax({
        type : "GET",
        url : "/recipe/"+getUrlParameter("id")+"/ratings",
        dataType : "json",
        contentType: "application/json; charset=utf-8",
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", "Bearer " + getToken());
        },
        success : function (response) {
            var newAvg = response["avgScore"];
            $(".rating_display").attr("title", "Average Ratings: " + newAvg);
            $(".rating_display").empty();
            $(".rating_display").append($(getStars(newAvg)));
        },
        error: function (request, status, error) {
            alert(request.responseText);
        }
    });
}

function getStars(rating) {
    var stars = "";
    for (var i = 0; i < 5 - Math.ceil(rating); i++) {
        stars += '<lable class="rating_display_star_grey"></lable>';
    }
    if (rating - Math.floor(rating) > 0) {
        stars += '<lable class="rating_display_star_half"></lable>';
    }
    for (var i = 0; i < Math.floor(rating); i++) {
        stars += '<lable class="rating_display_star_gold"></lable>';
    }
    return stars;
}