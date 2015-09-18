var BMDash = angular.module('BMDash', []);

$(function(){

    $("#widgets .ul").gridster({
        widget_margins: [10, 10],
        widget_base_dimensions: [140, 140],
        min_cols: 3,
        max_rows: 5
    });

});


