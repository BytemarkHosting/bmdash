bmDash.controller('Main', 
    ["$scope", "$interval", "$controller", "bmDashService",
    function($scope, $interval, $controller, bmDashService){

    $scope.stream = null;
    $scope.connected = false;

    $scope.setup = function(){
        console.log('MAIN', 'Setup called');
        bmDashService.init();

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
