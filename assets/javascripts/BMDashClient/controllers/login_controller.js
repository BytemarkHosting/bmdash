BMDash.controller('Login', 
    ['$scope', '$rootScope','ClientName', 'ClientGroup', 'BMDashService',
    function($scope, $rootScope, client, group, bmDashService){

        $scope.connected = false;

        $scope.client = {
            name: client,
            group: group
        }

        $scope.connect = function(client){
            bmDashService.connect(client.name, client.group);
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
