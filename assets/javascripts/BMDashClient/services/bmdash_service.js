// BMDash service is used to communicate with a BMDash server
BMDash.service('BMDashService', 
    ['$q', '$interval', '$http', '$rootScope', '$log',
    function($q, $interval, $http, $rootScope, $log){

    // Variables //

    // Client details
    this.client_name = null;
    this.group_name = null;

    // Service objects
    this.eventStream = {};
    this.bmdashEndPoints = [];
    this.bmdashData = {};

    // Service State
    this.connectionState = {};
    this.lastUpdateRun = 0;
    this.lastUpdateTimout = 5 
    this.connectionCheckWatcher = null;

    // Functions //
    // Public Functions //
    
    this.init = function(){
        $log.debug('BMDashService: initialising...');
        // Set endpoints
        this.bmdashEndPoints = ['dashboards', 'widgets'];
        // Setup the eventStream object and promise 
        this.eventStream = {};
        this.eventStream.deferred = $q.defer();
        this.eventStream.stream = this.eventStream.deferred.promise;
        this.eventStream.connected = false;

        this.eventStream.stream.then(function(stream){
            stream.onmessage = function(event){
                $log.debug('BMDashService: Received a unamed event!');
                $log.debug(event);
            }
            stream.onerror = function(event){
                $log.debug('BMDashService: We hit an error boss! Closing the Stream!', event);
                connection.close();
            }
            stream.addEventListener('ping', function(event){
                data = JSON.parse(event.data);
                $log.debug('BMDashService: PING:' +  data.time);
            });
        });

        // Setup Endpoints
        for(var i=0; i<this.bmdashEndPoints.length; i++){
           var point = this.bmdashEndPoints[i];
           this.bmdashData[point] = {};
           this.bmdashData[point].endPoint = '/' + point ;
           this.bmdashData[point].deferred = $q.defer();
           this.bmdashData[point].available = this.bmdashData[point].deferred.promise;
           this.bmdashData[point].lastUpdate = Date.now();
        }
        $log.debug('BMDashService: ready');
    }
    
    this.getData = function(){
        this.update = Date.now();
        // Get data from endpoints
        for(var i=0; i<this.bmdashEndPoints.length; i++){
            var point = this.bmdashData[this.bmdashEndPoints[i]];
            // This closure wraps around the success function for the http get 
            // used when getting data from the server, it allows acecss to the 
            // point object
            var responder = function(point){
                return function (response){
                    $log.debug('BMDashService: Received ' + point.endPoint + ' Data');
                    point.lastUpdate = Date.now();
                    point.deferred.resolve(response.data);
                }
            }
            $http.get(point.endPoint).then(responder(point),
                // Fail
                function(response){
                    $log.debug('BMDashService: Failed to get ' + point.endPoint + ' Data', response);
                    point.deferred.reject({});
                }
            );
        }
    }

    // Check the status of the event stream and data end points and 
    this.checkStatus = function(){
        // Status vars
        var eventsConnected = false;
        var endpointsFetched = false;

        // Check eventStream is connected:
        eventsConnected = (this.evenStream.stream.readyState == 1) ? true: false;
        this.endpoints.forEach(function(){

        });

        this.connected = (eventsConnected && endpointsFetched);
    }

    this.connect = function(client_name, client_group){
        // Assign user details
        this.client_name = client_name;
        this.client_group = client_group;

        // Set up EventSource and connection checker
        this.eventStream.connection = new EventSource('/events?name='+client_name+'&group='+client_group);
        this.eventStream.watcher = $interval(this.checkEventStream, 500, 
            null, null, this.eventStream);

        this.getData();

        // Broadcast that we are done connecting
        $rootScope.$broadcast('ClientConnected');
    }

    this.disconnect = function(){
        // Close the EventStream
        this.eventStream.stream.close();
        this.connected = false;
    }

    this.reset = function(){
        // Disconnect cleanly
        this.disconnect();
        // Clean any user data out
        this.client_name = null;
        this.client_group = null;
        // Reinit the service objects
        this.init();
    }

    this.isConnected = function(){
        return this.connected;
    }

    // Private Functions //
    
    // Checks the state of the EventSource in the passed eventStream object and
    // updates the promise accordingly. If stream becomes connected it also
    // cancels the watcher that calls this method and resolves the promise
    // object to the resulting EventSource
    this.checkEventStream = function(eventStream){
        var connection = eventStream.connection;
        var deferred = eventStream.deferred;

        // Stream state connecting  
        if (connection.readyState == 0){
            deferred.notify('Trying connection to ' + connection.url);
        }
        // Stream connection failed
        if (connection.readyState == 2){
            $log.debug('BMDashService: Stream connection failed');
            deferred.reject(null);
            eventStream.connected = false;
        }
        // Stream connected!
        if (connection.readyState == 1){
            $log.debug('BMDashService:  Stream connected!');
            $interval.cancel(eventStream.watcher);
            deferred.resolve(connection);
            eventStream.connected = true;
        }
    }

    // Getters + Setters //
    this.getEventStream = function(){
        return this.eventStream.stream;
    }

    this.getDashboards = function(){
        return this.dashboards.available;
    }

    this.getWidgets = function(){
        return this.widgets.available;
    }


}]);
