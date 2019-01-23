$(function () {
    //load navbar
    $('#navbar_holder').load('/components/navbar.html', function () {
        onNavBarLoaded();
    });

    // populate ingredients list
    populateIngredients(function () {
        // pin and unpin ingredient buttons
        $('.ingredient_button').on('click', function () {
            $(this).toggleClass('selected_ingredient_button');
            $(this).parent().prepend($('.selected_ingredient_button'));
            if ($('.selected_ingredient_button').length > 0) {
                $("#ingredient_search_button").prop("disabled", false);
            } else {
                $("#ingredient_search_button").prop("disabled", true);
            }
        });
    });

    $(".user_only_recipe_list").toggle(getUserType() !== null);
    $(".search_result_list").hide();
    // open remarkable recipe list on start; if logged in, open favorite
    if (getUserType() !== null) {
        showRecipeListContent('favorite_recipes');
    } else {
        showRecipeListContent('remarkable_recipes');
    }

    // load recipe_card
    populateRecipeCards();

    $(window).on("loggedin", function () {
        populateUserOnlyRecipeList();
        $(".user_only_recipe_list").toggle(getUserType() !== null);
        $('.recipe_list_content').toggleClass('w3-show', false);
        showRecipeListContent('favorite_recipes');
    });

    updateSearchHintMsg($('input[name=ingredient_search_type]:checked').val());
    $('input[type=radio][name=ingredient_search_type]').change(function() {
        updateSearchHintMsg(this.value);
    });

    $("#type_word_powerset").on("click", function () {
        $("input[name=ingredient_search_type][value=powerset]").prop("checked", true );
        updateSearchHintMsg("powerset");
    });
    $("#type_word_include").on("click", function () {
        $("input[name=ingredient_search_type][value=include]").prop("checked", true );
        updateSearchHintMsg("include");
    });
    $("#type_word_equal").on("click", function () {
        $("input[name=ingredient_search_type][value=equal]").prop("checked", true );
        updateSearchHintMsg("equal");
    });
    $("#type_word_exclude").on("click", function () {
        $("input[name=ingredient_search_type][value=exclude]").prop("checked", true );
        updateSearchHintMsg("exclude");
    });
});

function updateSearchHintMsg(value) {
    if (value == "powerset") {
        $("#search_hint").text("can be made of");
    } else if (value == 'include') {
        $("#search_hint").text("contain");
    } else if (value == 'equal') {
        $("#search_hint").text("are exactly made of");
    } else if (value == 'exclude') {
        $("#search_hint").text("do not contain");
    }
}

function populateIngredients(callback) {
    $.ajax({
        type : "GET",
        url : "/ingredients",
        dataType : "json",
        contentType: "application/json; charset=utf-8",
        success : function (response) {
            for (var i = 0; i < response.length; i++) {
                $(".ingredient_buttons_wrapper").append(
                    $(getIngredientButton(response[i]["_id"], response[i]["name"], response[i]["imgUrl"]))
                );
            }
            callback();
        },
        error: function (request, status, error) {
            alert(request.responseText);
        }
    });
}

function populateRecipeCards() {
    $.ajax({
        type : "GET",
        url : "/recipes/hot",
        dataType : "json",
        contentType: "application/json; charset=utf-8",
        success : function (response) {
            for (var i = 0; i < response.length; i++) {
                $("#hot_recipes").append(
                    $(getRecipeCard(
                        response[i]["_id"], response[i]["recipeName"],
                        response[i]["description"], response[i]["imgUrl"],
                        RECIPE_CARD_COMMENT_COUNT_TOOL, response[i]["commentCount"])
                    )
                );
            }
        },
        error: function (request, status, error) {
            alert(request.responseText);
        }
    });

    $.ajax({
        type : "GET",
        url : "/recipes/remarkable",
        dataType : "json",
        contentType: "application/json; charset=utf-8",
        success : function (response) {
            for (var i = 0; i < response.length; i++) {
                $("#remarkable_recipes").append(
                    $(getRecipeCard(
                        response[i]["_id"], response[i]["recipeName"],
                        response[i]["description"], response[i]["imgUrl"],
                        RECIPE_CARD_RATING_DISPLAY_TOOL, response[i]["avgScore"])
                    )
                );
            }
        },
        error: function (request, status, error) {
            alert(request.responseText);
        }
    });

    $.ajax({
        type : "GET",
        url : "/recipes/new",
        dataType : "json",
        contentType: "application/json; charset=utf-8",
        success : function (response) {
            for (var i = 0; i < response.length; i++) {
                $("#new_recipes").append(
                    $(getRecipeCard(
                        response[i]["_id"], response[i]["recipeName"],
                        response[i]["description"], response[i]["imgUrl"])
                    )
                );
            }
        },
        error: function (request, status, error) {
            alert(request.responseText);
        }
    });

    populateUserOnlyRecipeList();
}

function populateUserOnlyRecipeList() {
    if (getUserType() !== null) {
        $.ajax({
            type : "GET",
            url : "/recipes/favorite",
            dataType : "json",
            contentType: "application/json; charset=utf-8",
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authorization", "Bearer " + getToken());
            },
            success : function (response) {
                if (response.length > 0) {
                    for (var i = 0; i < response.length; i++) {
                        $("#favorite_recipes").append(
                            $(getRecipeCard(
                                response[i]["_id"], response[i]["recipeName"],
                                response[i]["description"], response[i]["imgUrl"],
                                RECIPE_CARD_FAVORITE_BUTTON_TOOL, true)
                            )
                        );
                    }
                } else {
                    $("#favorite_recipes").append("<p>You don't have any favorite recipes.</p>");
                }
            },
            error: function (request, status, error) {
                alert(request.responseText);
            }
        });

        $.ajax({
            type : "POST",
            url : "/recipes/uploaded",
            dataType : "json",
            contentType: "application/json; charset=utf-8",
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authorization", "Bearer " + getToken());
            },
            success : function (response) {
                if (response.length > 0) {
                    for (var i = 0; i < response.length; i++) {
                        $("#uploaded_recipes").append(
                            $(getRecipeCard(
                                response[i]["_id"], response[i]["recipeName"],
                                response[i]["description"], response[i]["imgUrl"],
                                RECIPE_CARD_EDITOR_TOOL)
                            )
                        );
                    }
                } else {
                    $("#uploaded_recipes").append("<p>You haven't uploaded any recipes.</p>");
                }
            },
            error: function (request, status, error) {
                alert(request.responseText);
            }
        });
    }
}

function toggleRecipeListContent(id) {
     $('#' + id).toggleClass('w3-show');
}

function showRecipeListContent(id) {
    $('#' + id).toggleClass('w3-show', true);
}

function searchByIngredient() {
    // find selected ingredients
    var selectedIngredients = $(".selected_ingredient_button");
    var selectedIds = [];
    for (var i = 0; i < selectedIngredients.length; i++) {
        selectedIds.push(parseInt($(selectedIngredients[i]).attr("data-id")));
    }

    // find search type
    var searchType = $('input[name=ingredient_search_type]:checked').val();
    $.ajax({
        type : "POST",
        url : "/search?searchtype=" + searchType,
        dataType : "json",
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify({"ingredients": selectedIds}),
        success : function (response) {
            $("#result_recipes").empty();
            if (response.length > 0) {
                for (var i = 0; i < response.length; i++) {
                    $("#result_recipes").append(
                        $(getRecipeCard(
                            response[i]["recipeId"], response[i]["recipeName"],
                            response[i]["description"], response[i]["imgUrl"])
                        )
                    );
                }
            } else {
                $("#result_recipes").append("<p>No recipes found matching the ingredients selected.</p>");
            }
            $(".search_result_list").show();
            showRecipeListContent("result_recipes");
        },
        error: function (request, status, error) {
            alert(request.responseText);
        }
    });
}

function closeSearchResultList() {
    $("#ingredient_search_input").val("");
    filterIngredients();
    $(".selected_ingredient_button").removeClass("selected_ingredient_button");
    $(".search_result_list").hide();
}

function filterIngredients() {
    var search_text = $('#ingredient_search_input').val().toLowerCase();
    var ingredients = $(".ingredient_button:not(.selected_ingredient_button)");

    for (i = 0; i < ingredients.length; i++) {
        $(ingredients[i]).toggle(ingredients[i].title.toLowerCase().indexOf(search_text) >= 0);
    }
}