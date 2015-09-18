BMDash.controller('Dashboard', ['$scope', 'DashboardData', 
    function($scope, dashboard_data){
        dashboard_data.then(function(data){
            console.log('Got Dashboard Data!')
            $scope.dashboards = data
        });
    }]);
