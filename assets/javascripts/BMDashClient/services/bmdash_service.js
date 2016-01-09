// BMDash service is used to communicate with a BMDash server
BMDash.service('BMDashService', 
    ['$q', '$interval', '$http', '$rootScope',
    function($q, $interval, $http, $rootScope){


    // Variables
    connected = false; 

    // Client details
    client_name = null;
    group_name = null;

    // Service objects
    eventStream = {};
    dashboards = {};

    // Functions
    // Public Functions
    
    this.init = function(){
        // Setup the eventStream object and promise 
        this.eventStream = {};
        this.eventStream.deferred = $q.defer();
        this.eventStream.stream = this.eventStream.deferred.promise;
        // Setup Dashboards object
        this.dashboards = {};
        this.dashboards.deferred = $q.defer();
        this.dashboards.available = this.dashboards.deferred.promise;
        this.dashboards.lastUpdate = Date.now();
}
    
    this.connect = function(client_name, client_group){
        // Assign user details
        this.client_name = client_name;
        this.client_group = client_group;

        // Set up EventSource and connection checker
        this.eventStream.connection = new EventSource('/events?name='+client_name+'&group='+client_group);
        this.eventStream.watcher = $interval(check_connection_state, 500, 
            null, null, this.eventStream);

        // Get Dashboard list
        $http.get('/dashboards').then(
            // Success
            function(response){
                this.dashboards.lastUpdate = Date.now();
                this.dashboards.deferred.resolve(response.data);
                log('Received Dashboard Data');
            },
            // Fail
            function(response){
                deferred.reject({});
                log('Failed to get Dashboard Data', response);
            }
        );
        
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
        disconnect();
        // Clean any user data out
        this.client_name = null;
        this.client_group = null;
        // Reinit the service objects
        init();
    }

    this.isConnected = function(){
        return this.connected;
    }

    // Private Functions
    
    // Checks the state of the EventSource in the passed eventStream object and
    // updates the promise accordingly. If stream becomes connected it also
    // cancels the watcher that calls this method and resolves the promise
    // object to the resulting EventSource
    check_connection_state = function(eventStream){
        var connection = eventStream.connection;
        var deferred = eventStream.deferred;

        // Stream state connecting  
        if (connection.readyState == 0){
            deferred.notify('Trying connection to ' + connection.url);
        }
        // Stream connection failed
        if (connection.readyState == 2){
            log('Stream connection failed');
            deferred.reject(null);
        }
        // Stream connected!
        if (connection.readyState == 1){
            log(' Stream connected!');
            connection.onmessage = function(event){
                log('Received a unamed event!');
                log(event);
            }
            connection.onerror = function(event){
                log('We hit an error boss! Closing the Stream!');
                connection.close();
            }
            connection.addEventListener('ping', function(event){
                data = JSON.parse(event.data);
                log('PING:' +  data.time);
            });
            $interval.cancel(eventStream.watcher);
            deferred.resolve(connection);
            this.connected = true;
        }
    }
    
    // Helpers  
    log = function(message){
        console.log('BMDashService', message);
    }

    // Getters + setters
    this.getEventStream = function(){
        return this.eventStream.stream;
    }

    this.getDashboards = function(){
        return this.dashboards.available;
    }

}]);
