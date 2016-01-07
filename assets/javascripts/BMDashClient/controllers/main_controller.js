BMDash.controller('Main', 
    ["$scope", "$interval", "$controller", "EventStream", "WidgetService", 
     "DashboardService",
    function($scope, $interval, $controller, eventStream, widgetService, dashboardService){


    $scope.connected = false;

    eventStream.stream.then(function(obj){
            $scope.stream = obj;
            $scope.connected = (obj) ? true : false;
    });

    $scope.setup = function(){
        console.log('MAIN', 'Setup called');
        dashboardService.update()
        widgetService.update();
    }

    $scope.teardown = function(){
        console.log('MAIN', 'Teardown called')
    }

    $scope.setup();
   
}])
