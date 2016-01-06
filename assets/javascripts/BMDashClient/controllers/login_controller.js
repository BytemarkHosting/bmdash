BMDash.controller('Login', 
    ['$scope', '$rootScope', 'EventStream', 'ClientName', 'ClientGroup',
    function($scope, $rootScope, stream, client, group){

        $scope.connected = false;

        $scope.client = {
            name: client,
            group: group
        }

        $scope.connect = function(client){
            console.log('LOGIN: Creating connection for ' + client.name)
            stream.connect(client.name, client.group)
            .then(function(){
                console.log("LOGIN: Connection Succesful!");
                $scope.connected = true;
                $rootScope.$broadcast('ClientConnected')
            });
        };

        // Check to see if there is a predefined Client name, Group
        // If there is then run get_dashboards without user action
        var init = function() {
             if (client.length > 0 && group.length > 0){
                $scope.connect($scope.client);
             }
        }
        init();

    }
]);
