BMDash.controller('Main', 
    ["$scope", "$interval", "$controller", "BMDashService", "WidgetService", 
     "DashboardService",
    function($scope, $interval, $controller, bmDashService, widgetService, dashboardService){

    $scope.stream = null;
    $scope.connected = false;

    $scope.setup = function(){
        console.log('MAIN', 'Setup called');
        bmDashService.init();
        dashboardService.update();
        widgetService.update();

        // Change connection status Depending on EventStream state
        bmDashService.getEventStream().then(function(obj){
                $scope.stream = obj;
                $scope.connected = (obj) ? true : false;
        });
    }

    $scope.teardown = function(){
        console.log('MAIN', 'Teardown called')
    }

    $scope.setup();
   
}])
