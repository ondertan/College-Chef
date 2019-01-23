$(function() {
    //load navbar
    $('#navbar_holder').load('/components/navbar.html', function () {
        onNavBarLoaded();
        $('.site_name').html('<i class="fa fa-info-circle w3-hide-small"></i> About Us <i class="fa fa-info-circle w3-hide-small"></i>');
    });
});