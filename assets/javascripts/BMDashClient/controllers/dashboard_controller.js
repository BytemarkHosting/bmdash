BMDash.controller('Dashboard', ['$scope', 'DashboardData', 'WidgetService',
    function($scope, dashboardData, widgetService){

    $scope.selected = null;

    dashboardData.then(function(data){
        $scope.dashboards = data.dashboards
    });

    $scope.$watch('selected', function(newValue, oldValue){
        teardown();
        setup();
    });

    setup = function(){
        //  Make new widgets 
            
    }
 

    teardown = function(){
        
    }

    getDashboards = function(){
        console.log("Got Dashboards")
        console.log($scope.dashboards)
    }

    $scope.selectDashboard = function(dashboard){
        $scope.selected = dashboard;
    }

    $scope.$on('getDashboards', getDashboards);


}]);
