BMDash.service('WidgetService', ['$q','$interval', '$http', 
    function($q, $interval, $http){

        this.availableWidgets = null;
        this.lastUpdate = null;

        this.update = function(){
            var deferred = $q.defer();
            this.availableWidgets = deferred.promise;

            $http.get('/widgets').then(
                function(response){
                    this.lastUpdate = Date.now();
                    deferred.resolve(response.data);
                    console.log('WIDGET SERVICE: Got widget data');
                }, 
                function(response){
                    deferred.reject(null);
                    console.log('WIDGET SERVICE: Failed to get widget data from server!');
                }
            );
        }

        this.getAvailableWidgets = function(){
            return this.availableWidgets;
        }
}]);
