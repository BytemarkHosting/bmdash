// bmDash service is used to communicate with a bmDash server
bmDash.service('bmDashService', 
    ['$q', '$interval', '$http', '$rootScope', '$log',
    function($q, $interval, $http, $rootScope, $log){

    // Variables //

    // Client details
    this.client_name = null;
    this.group_name = null;

    // Service objects
    this.eventStream = {};
    this.bmDashEndPoints = [];
    this.bmDashData = {};

    // Service State
    this.connectionState = {};
    this.lastUpdateRun = 0;
    this.lastUpdateTimout = 5 
    this.connectionWatcher = null;

    // Functions //
    // Public Functions //
    
    this.init = function(){
        $log.debug('bmDashService: initialising...');
        // Set endpoints
        this.bmDashEndPoints = ['dashboards', 'widgets'];
        // Setup the eventStream object and promise 
        this.eventStream = {};
        this.eventStream.deferred = $q.defer();
        this.eventStream.stream = this.eventStream.deferred.promise;
        this.eventStream.connected = false;



        // Setup Endpoints
        for(var i=0; i<this.bmDashEndPoints.length; i++){
           var point = this.bmDashEndPoints[i];
           this.bmDashData[point] = {};
           this.bmDashData[point].name = point;
           this.bmDashData[point].endPoint = '/' + point ;
           this.bmDashData[point].deferred = $q.defer();
           this.bmDashData[point].available = this.bmDashData[point].deferred.promise;
           this.bmDashData[point].lastUpdate = Date.now();
        }
        $log.debug('bmDashService: ready');
    }
    
    this.getData = function(){
        this.updated = Date.now();
        // Get data from endpoints
        for(var i=0; i<this.bmDashEndPoints.length; i++){
            var point = this.bmDashData[this.bmDashEndPoints[i]];

            var responder = function(bmDash, point){
                return function (response){
                    $log.debug('bmDashService: Received ' + point.endPoint + ' Data');
                    point.lastUpdate = Date.now();
                    point.deferred.resolve(response.data);
                    bmDash.bmDashData[point.name].available = response.data;
                }
            }
            $http.get(point.endPoint).then(responder(this, point),
                // Fail
                function(response){
                    $log.debug('bmDashService: Failed to get ' + point.endPoint + ' Data', response);
                    point.deferred.reject({});
                }
            );
        }
    }

    // Check the status of the event stream and data end points and 
    this.checkConnection = function(bmDash){
        // Status vars
        var eventsConnected = false;
        var endPointStatus = false;

        // Check eventStream is connected:
        eventsConnected = (bmDash.eventStream.stream.readyState == 1) ? true: false;

        for(var i=0; i<bmDash.bmDashEndPoints.length; i++){
            var point = bmDash.bmDashData[bmDash.bmDashEndPoints[i]];
            var available = false;
            if (point.available == null){
                $log.debug('bmDashService: There is no data available for point ' 
                        + point.name);
            }else{
                available = true;
            }
            endPointStatus = (endPointStatus || available);
        }

        var connStatus = (eventsConnected && endPointStatus);
        // Decided the connection state of the app
        //
        // If we are conneted and the connection state hasn't changed, do 
        // nothing
        if(bmDash.connected && connStatus){
            return true 
        // If we are not connected and the connection state is good we are 
        // connected
        }else if ( !bmDash.connected && connStatus) {
            $rootScope.$broadcast('ClientConnected');
            bmDash.connected = true;
            $log.debug('bmDashService: Client has Connected!');
            return true
        // if we are connected but the connection status is bad we have
        // disconnected
        }else if (bmDash.connected && !connStatus){
            $rootScope.$broadcast('ClientDisconnected');
            bmDash.connected = false;
            $log.debug('bmDashService: Client has Disconnected!');
            return false;
        // else we are probably trying to connected still
        }else{
            $rootScope.$broadcast('ClientConnecting');
            bmDash.connected = false;
            $log.debug('bmDashService: Client Conencting ...');
            return false;
        }

    }

    this.connect = function(client_name, client_group){
        // Assign user details
        this.client_name = client_name;
        this.client_group = client_group;

        // Set up EventSource and connection checker
        var connection = new EventSource('/events?name='+client_name+'&group='+client_group);
        this.eventStream.watcher = $interval(this.checkEventStream, 500, 
            null, null, this.eventStream, connection);

        var streamConnected = function(bmDash){
            return function(stream){
                bmDash.eventStream.stream = stream;
                stream.onmessage = function(event){
                    $log.debug('bmDashService: Received a unamed event!');
                    $log.debug(event);
                }
                stream.onerror = function(event){
                    $log.debug('bmDashService: We hit an error boss! Closing the Stream!', event);
                    connection.close();
                }
                stream.addEventListener('ping', function(event){
                    data = JSON.parse(event.data);
                    $log.debug('bmDashService: PING:' +  data.time);
                });
            }
        }

        this.eventStream.stream.then(streamConnected(this));

        this.getData();

        this.connectedWatcher = $interval(this.checkConnection, 1000, null, null,
                this);
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

    // Getters + Setters //
    this.getEventStream = function(){
        return this.eventStream.stream;
    }

    this.getDashboards = function(){
        return this.bmDashData['dashboards'].available;
    }

    this.getWidgets = function(){
        return this.bmDashData['widgets'].available;
    }

    // Private Functions //
    
    // Checks the state of the EventSource in the passed eventStream object and
    // updates the promise accordingly. If stream becomes connected it also
    // cancels the watcher that calls this method and resolves the promise
    // object to the resulting EventSource
    this.checkEventStream = function(eventStream, connection){
        var deferred = eventStream.deferred;

        // Stream state connecting  
        if (connection.readyState == 0){
            deferred.notify('Trying connection to ' + connection.url);
        }
        // Stream connection failed
        if (connection.readyState == 2){
            $log.debug('bmDashService: Stream connection failed');
            deferred.reject(null);
            eventStream.connected = false;
        }
        // Stream connected!
        if (connection.readyState == 1){
            $log.debug('bmDashService: Stream connected!');
            $interval.cancel(eventStream.watcher);
            deferred.resolve(connection);
            eventStream.connected = true;
        }
    }

}]);
