BMDash.service('DashboardService', ['$q','$interval', '$http', 
    function($q, $interval, $http){

        this.availableDashboards = null;
        this.lastUpdate = null;

        this.update = function(){
            var deferred = $q.defer();
            this.availableDashboards = deferred.promise;

            $http.get('/widgets').then(
                function(response){
                    this.lastUpdate = Date.now();
                    deferred.resolve(response.data);
                    console.log('DASHBOARD SERVICE: Got dashboard data');
                }, 
                function(response){
                    deferred.reject(null);
                    console.log('DASHBOARD SERVICE: Failed to get dashboard data from server!');
                }
            );
        }

        this.getAvailableDashboards = function(){
            return this.availableDashboards;
        }
}]);
