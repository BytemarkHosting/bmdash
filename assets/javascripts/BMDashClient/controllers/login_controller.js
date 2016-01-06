BMDash.controller('Login', 
    ['$scope', '$rootScope', 'EventStream', 'ClientName', 'ClientGroup',
    function($scope, $rootScope, stream, client, group){

        $scope.client = {
            name: client,
            group: group
        }

        $scope.get_dashboards = function(client){
            console.log ('Client ' + client.name + ' in ' + client.group + ' asked for dashboards!')
            stream.connect(client.name, client.group)
            .then(function(){
                console.log("Event stream connected!");
                $rootScope.$broadcast('getDashboards')
            });
        };

        // Check to see if there is a predefined Client name, Group
        // If there is then run get_dashboards without user action
        var init = function() {
             if (client.length > 0 && group.length > 0){
                $scope.get_dashboards($scope.client);
             }
        }
        init();


    }
]);
