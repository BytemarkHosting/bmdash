BMDash.controller('Main', ["$scope", "$interval", "$controller", "EventStream",
        "WidgetService",
        function($scope, $interval, $controller, EventStream, widgetService){

    $scope.setup = function(){
        console.log('MAIN', 'Setup called');
        widgetService.update();
    }

    $scope.teardown = function(){
        console.log('MAIN', 'Teardown called')
    }

    var init = function() {
       $scope.setup();
    }

    init();

   
}])
