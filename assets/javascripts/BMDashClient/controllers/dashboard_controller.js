BMDash.controller('Dashboard', 
    ['$scope', 'DashboardData', 'WidgetService', 'ClientDashboard',
    function($scope, dashboardData, widgetService, clientDashboard){

    // Dashboard Controller is responsible for the creation and management of a
    // dashboard and all of it's widgets.
    // If there hasn't been a provided dashboard name in the GET request for / 
    // as a parameter, it will show the user a selection of dashboards to choose
    // Once a dashboard has been selected, it will load up the widgets needed
    // via the Widget service

    // The current loaded dashboard
    $scope.selected = null;


    // Watch for changes in the selected dashboard and initalise 
    $scope.$watch('selected', function(newValue, oldValue){
        if (oldValue != null) {
            teardown();
            $scope.selected = newValue;
            setup();
        }
    });

    // Sets the selected dashboard, this can be triggerd from a view or
    // a controller
    $scope.selectDashboard = function(dashboard){
        $scope.selected = dashboard;
        console.log("DASHBOARD: '" + dashboard + "' selected");
    }

    // Start logic for the Dashboard controller
    // Will check if there is a defined ClientDashboard constant and will 
    // attempt to load that dashboard. If this fails an error messages is
    // broadcasted and the user is left to select from the available dashboards

    init = function(){
        // Get The list of dashboards from the server
        dashboardData.then(function(data){
            $scope.dashboards = data.dashboards
            console.log('DASHBOARD: Loaded dashboard data from server')
            // Select dashboard automatically if one was provided
            if (clientDashboard.length > 0){
                $.grep($scope.dashboards, function(dashboard){
                    if (dashboard.name == clientDashboard){
                        $scope.selectDashboard(clientDashboard);
                        $scope.setup();
                    }
                });
            } else {
                //TODO Error boradcast needed here
            }
        });
    }


    $scope.$on('ClientConnected', init);

    var setup = function(){
        console.log('DASHBOARD: Setup called!')
        //  Make new widgets 
            
    }

    var teardown = function(){
        console.log('DASHBOARD: Teardown called!')
        
    }

}]);
