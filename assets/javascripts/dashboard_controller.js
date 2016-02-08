BMDash.controller('DashboardCtrl', 
    ['$scope', '$log', 'BMDashService', 'ClientDashboard',
    function($scope, $log, bmDashService, clientDashboard){

    // Dashboard Controller is responsible for the creation and management of a
    // dashboard and all of it's widgets.
    // If there hasn't been a provided dashboard name in the GET request for / 
    // as a parameter, it will show the user a selection of dashboards to choose
    // Once a dashboard has been selected, it will load up the widgets needed
    // via the Widget service

    // The current loaded dashboard
    $scope.selected = null;
    $scope.dashboards = null;


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
    $scope.select = function(dashboard){
        $scope.selected = dashboard;
        $log.debug("DASHBOARD: '" + dashboard + "' selected");
    }

    // Start logic for the Dashboard controller
    // Will check if there is a defined ClientDashboard constant and will 
    // attempt to load that dashboard. If this fails an error messages is
    // broadcasted and the user is left to select from the available dashboards

    init = function(){
        // Check if the constant was seeded and find any dashboards matching
        if (clientDashboard.length > 0){
            $log.debug('DASHBOARD: Found dashboard autoload constant!' +
                    ' Trying to load ' + clientDasboard);
            var foundDashboards = $.grep($scope.dashboards, function(dashboard){
                if (dashboard.name == clientDashboard){
                    return dashboard;
                }
            });

            if(foundDashboards.length > 0){
                $log.debug('Found dashboard(s) matching autoload constant! Loading first match');
                $scope.selected = foundDashboards[0];
                $scope.setup();
            }else{
                $log.debug('No dashboard(s) matching autoload constant. Showing list');
            }                
        }
        // Check if we found a dashboard to auto load, if not show list of
        // dashboards
        if(this.selected == null){
            
        }
    }

    var setup = function(){
        console.log('DASHBOARD: Setup called!')
        //  Make new widgets 
            
    }

    var teardown = function(){
        console.log('DASHBOARD: Teardown called!')
        
    }

    // Messages to act on
    $scope.$on('ClientConnected', init);

}]);
