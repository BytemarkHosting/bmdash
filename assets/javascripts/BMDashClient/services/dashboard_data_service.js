BMDash.factory('DashboardData', ['$http', function($http, token){
    var end_point = '/dashboards'
    
    return $http.get(end_point)
        .then(function(response){
            console.log('Got the dashboard data!')
            return response.data
        }, function(error){
            console.log('Error getting dashboard data!')
            return error
        });

}]);
