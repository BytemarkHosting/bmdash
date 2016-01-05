BMDash.controller('Login', ['$scope', '$rootScope', 'EventStream', 
    function($scope, $rootScope, stream){

        $scope.client = {
            name: 'saki',
            group: 'testing'
        }

        $scope.get_dashboards = function(client){
            console.log ('Client ' + client.name + ' in ' + client.group + ' asked for dashboards!')
            stream.connect(client.name, client.group)
            .then(function(){
                console.log("Event stream connected!");
                $rootScope.$broadcast('getDashboards')
            });
        };

    }
]);
