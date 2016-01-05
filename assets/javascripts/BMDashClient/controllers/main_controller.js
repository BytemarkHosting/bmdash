BMDash.controller('Main', ["$scope", "$interval", "$controller", "EventStream",
        "WidgetService",
        function($scope, $interval, $controller, EventStream, widgetService){

    $scope.connected = false;

    EventStream.stream.then(function(obj){
            $scope.stream = obj;
            $scope.connected = (obj) ? true : false;
    });

    var connection_change = function(newValue, oldValue){
        newValue ? $scope.setup() : $scope.teardown();
    }

    $scope.connection_watch = $scope.$watch('connected', connection_change);

    $scope.setup = function(){
        console.log('SETUP', 'Started');
        widgetService.update();
    }

    $scope.teardown = function(){
        console.log('TEARDOWN', 'Started')
    }

   
}])
