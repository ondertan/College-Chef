$(function () {
    //load navbar
    $('#navbar_holder').load('/components/navbar.html', function () {
        onNavBarLoaded();
        $('.site_name').html('<i class="fa fa-cutlery w3-hide-small"></i> Recipe Browser <i class="fa fa-cutlery fa-flip-horizontal w3-hide-small"></i>');
    });

    $('#footer_holder').on('footerLoaded', function () {
        // load recipe_card
        populateRecipeCards();
    });

    $("#recipe_text").on("click", function () {
        $("input[id=by_recipe_option]").prop("checked", true);
        showHideUploaderInfo();
        showHideCategoryInfo();
    });
    $("#uploader_text").on("click", function () {
        $("input[id=by_uploader_option]").prop("checked", true);
        showHideUploaderInfo();
        showHideCategoryInfo();
    });
    $("#category_text").on("click", function () {
        $("input[id=by_category_option]").prop("checked", true);
        showHideUploaderInfo();
        showHideCategoryInfo();
    });
    $('input[type=radio][name=recipe_search_option]').change(function() {
        showHideUploaderInfo();
        showHideCategoryInfo();
    });
});

var recipeMakers = {};

function populateRecipeCards() {
    $.ajax({
        type : "GET",
        url : "/recipes",
        dataType : "json",
        contentType: "application/json; charset=utf-8",
        success : function (response) {
            for (var i = 0; i < response.length; i++) {
                var name = response[i]["recipeName"];
                var id = response[i]["_id"];
                recipeMakers[name] = id;

                $(".recipe_cards_wrapper").append(
                    $(getRecipeCard(
                        response[i]["_id"], response[i]["recipeName"], response[i]["description"],
                        response[i]["imgUrl"], RECIPE_CARD_BROWSER, response[i])
                    )
                );
            }
            showHideRecipeEditorTools();
            showHideUploaderInfo();
            showHideCategoryInfo();
        },
        error: function (request, status, error) {
            alert(request.responseText);
        }
    });
}

function showHideRecipeEditorTools() {
    var user_type = getUserType();
    $('.recipe_card_editor_tools').toggle(user_type === USER_TYPE_ADMIN);
}

function showHideUploaderInfo() {
    $(".uploader_info").toggle($('input[name=recipe_search_option]:checked').val() == "by_uploader");
}

function showHideCategoryInfo() {
    $(".category_info").toggle($('input[name=recipe_search_option]:checked').val() == "by_category");
}

// Display recipes with recipe names that contain the entered input
function filterRecipes() {
    reset();
    var search_text = $('#recipe_browser_input').val().toLowerCase();
    var recipes = $(".recipe_card");

    if ($('input[id=by_recipe_option]:checked').val()) {
        for (i = 0; i < recipes.length; i++) {
            $(recipes[i]).toggle(recipes[i].title.toLowerCase().indexOf(search_text) >= 0);
        }
    } else if ($('input[id=by_uploader_option]:checked').val()) {
        for (i = 0; i < recipes.length; i++) {
            $(recipes[i]).toggle($(recipes[i]).find(".uploader_info p").attr("data-username").toLowerCase().indexOf(search_text) >= 0);
        }
    } else if ($('input[id=by_category_option]:checked').val()) {
        for (i = 0; i < recipes.length; i++) {
            $(recipes[i]).toggle($(recipes[i]).find(".category_info p").attr("data-category").toLowerCase().indexOf(search_text) >= 0);
        }
    }
}

// Displays recipes that start with the selected letter
function letter(a) {
    var str = a.id;
    if (document.getElementById(str).style.color == "red") {
        reset();
    } else {
        reset();
        document.getElementById("recipe_browser_input").value = "";
        document.getElementById(str).style.color = "red";

        var letter = $('#' + str).val().toLowerCase();
        var recipes = $(".recipe_card");

        for (i = 0; i < recipes.length; i++) {
            $(recipes[i]).toggle(recipes[i].title.toLowerCase().startsWith(letter));
        }
    }
}

// Resets letter button colors to an unselected white
function reset() {
    var str = 0;
    for (var i = 1; i < 27; i++) {
        str = [i];
        document.getElementById(str).style.color = "white";
    }
    $('.recipe_card').show();
}