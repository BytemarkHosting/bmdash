BMDash.controller('Main', ["$scope", "$interval", "EventStream", function($scope, $interval, EventStream){
    $scope.connected = false;

    EventStream.stream.then(function(obj){
            $scope.stream = obj;
    });

    var connection_change = function(newValue, oldValue){
        console.log('Server Connection State change. Is now ', newValue );
        newValue ? $scope.setup() : $scope.teardown();
    }

    $scope.connection_watch = $scope.$watch('connected', connection_change);

    $scope.setup = function(){
        console.log('setup', 'Setup started')
    }

    $scope.teardown = function(){
        console.log('teardown', 'teardown started')
    }
   
}])
