use strict;

// BMDash service is used to communicate with a BMDash server
BMDash.service('BMDashService', ['$q', '$interval', function($q, $interval){

    // Client details
    client_name = null;
    group_name = null;

    // Service objects
    eventStream = {};

    // Functions
    init = function(){
        // Setup the eventStream object and promise 
        eventStream.deferred = $q.defer();
        eventStream.stream = eventStream.deferred.promise;

    }
    
    connect = function(client_name, client_group){
        // Assign user details
        this.client_name = client_name;
        this.client_group = client_group;

        // Set up EventSource and connection checker
        this.eventStream.connection = new EventSource('/events?name='+client_name+'&group='+client_group);
        this.eventStream.watcher = $interval(check_connection_state, 500, 

            null, null, { this.eventStream });
    }

    reset = function(){
        // Clean any user data out
        this.client_name = null;
        this.client_group = null;

        // Reinit the service objects
        init();
    }

    isConnected = function(){
        if (typeof this.eventStream.stream == "EventSource"){
            return (this.eventStream.stream.readyState == 2) ? true : false;
        }
    }

    // Checks the state of the EventSource in the passed eventStream object and
    // updates the promise accordingly. If stream becomes connected it also
    // cancels the watcher that calls this method and resolves the promise
    // object to the resulting EventSource
    check_connection_state = function(eventStream){
        var connection = eventStream.connection;
        var deferred = eventStream.deferred;

        // Stream state connecting  
        if (connection.readyState == 0){
            deferred.notify('Trying connection to ' + stream.url);
        }
        // Stream connection failed
        if (connection.readyState == 2){
            console.log('EVENTSTREAM: Stream connection failed');
            deferred.reject(null);
        }
        // Stream connected!
        if (connection.readyState == 1){
            console.log('EVENTSTREAM: Stream connected!');
            stream.onmessage = function(event){
                console.log('EVENTSTREAM: Received a unamed event!');
                console.log(event);
            }
            stream.onerror = function(event){
                console.log('EVENTSTREAM: We hit an error boss! Closing the Stream!');
                stream.close();
            }
            stream.addEventListener('ping', function(event){
                data = JSON.parse(event.data);
                console.log('PING:' +  data.time);
            });
            $interval.cancel(eventstream.watcher);
            deferred.resolve(connection);
        }
    }
}
