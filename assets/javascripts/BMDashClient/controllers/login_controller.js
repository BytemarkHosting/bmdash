BMDash.controller('Login', ['$scope', 'EventStream', 
    function($scope, stream){

        $scope.client = {
            name: '',
            type: ''
        }

        $scope.get_dashboards = function(client){
            console.log ('Client ' + client.name + ' in ' + client.group + ' asked for dashboards!')
            stream.connect(client.name, client.group)

        };

    }
]);
