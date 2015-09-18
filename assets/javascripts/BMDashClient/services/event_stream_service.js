BMDash.service('EventStream', ['$q', function($q){
        this.deferred = $q.defer()
        this.stream = this.deferred.promise
        this.connect = function(client_name, client_group){
            stream = new EventSource('/events?name='+client_name+'&group='+client_group)
            if (stream.readyState != 2){
                console.log('Created EventSource to '+stream.url)
                stream.onmessage = function(event){
                    console.log('EVENTS: Received a unamed event!');
                    console.log(event);
                }
                stream.onerror = function(event){
                    console.log('EVENTS: We hit an error boss! Closing the Stream!')
                    console.log(event)
                }
                stream.addEventListener('ping', function(event){
                    data = JSON.parse(event.data);
                    console.log('PING: recieved Ping from the server. Sent at ' + data.time);
                });
                
                this.deferred.resolve(stream)
            } else {
                console.log('Creating EventSource to '+stream.url+' failed')
                this.deferred.reject(null)
            }
        }
}]);
