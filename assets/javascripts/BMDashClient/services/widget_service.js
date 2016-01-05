BMDash.service('WidgetService', ['$q','$interval', '$http', 
    function($q, $interval, $http){

        this.deferred = $q.defer();
        this.availableWidgets = this.deferred.promise;
        this.lastUpdate = Date.now();

        this.reset = function(){
            this.deferred = $q.defer();
            this.widgetData = this.deferred.promise;
            this.update();
        }

        this.update = function(){
            $http.get('/widgets').then(
                function(response){
                    console.log('Got widget data!');
                    this.availableWidgets = response.data;
                    this.lastUpdate = Date.now();
                    console.log(response.data);
                }, 
                function(response){
                    console.log('Failed to get widget data from server!');
                    this.reset();
                }
            );
        }

        this.getAvailableWidgets = function(){
            return this.availableWidgets;
        }
}]);
