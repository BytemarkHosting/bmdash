BMDash.service('EventStream', ['$q', '$interval', function($q, $interval){

        this.client_name = null
        this.group_name = null

        this.deferred = $q.defer();
        this.stream = this.deferred.promise;

        this.reset = function(){
            this.deferred = $q.defer();
            this.stream = this.deferred.promise;
        }

        this.is_connected= function(){
            if (typeof this.stream == "EventSource"){
                return (this.stream.readyState == 2) ? true : false
            }
        }


        this.check_connection_state = function(args){
            var stream = args.stream;
            var deferred = args.EventStream.deferred;

            if (stream.readyState == 0){
                // Stream state connecting  
                deferred.notify('Trying connection to ' + stream.url);
            }
            if (stream.readyState == 2){
                // Stream connection failed
                console.log('EVENTSTREAM: Stream connection failed') 
                deferred.reject(null)
            }
            if (stream.readyState == 1){
                // Stream connected!
                console.log('EVENTSTREAM: Stream connected!') 
                stream.onmessage = function(event){
                    console.log('EVENTSTREAM: Received a unamed event!');
                    console.log(event);
                }
                stream.onerror = function(event){
                    console.log('EVENTSTREAM: We hit an error boss! Closing the Stream!')
                    stream.close()
                }
                stream.addEventListener('ping', function(event){
                    data = JSON.parse(event.data);
                    console.log('PING: recieved Ping from the server. Sent at ' + data.time);
                });
                $interval.cancel(args.EventStream.watcher);
                deferred.resolve(stream);
            }
        }

        this.connect = function(client_name, client_group){
            this.client_name = client_name;
            this.client_group = client_group;
            stream = new EventSource('/events?name='+client_name+'&group='+client_group)
            this.watcher = $interval(this.check_connection_state, 500, 
                null, null, {
                stream: stream, 
                EventStream: this
            });
            return this.stream
        }
}]);
