BMDash.controller('Main', ["$scope", "$interval", "EventStream", function($scope, $interval, EventStream){

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
        console.log('SETUP', 'Started')
    }

    $scope.teardown = function(){
        console.log('TEARDOWN', 'Started')
    }
   
}])
