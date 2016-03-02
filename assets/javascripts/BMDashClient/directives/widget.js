bmDash.directive('widget', ['bmDashService', function(bmDashService){

    var pre_link = function(scope, element, attrs){
        scope.widgetType = attrs.type;
    }

    var post_link = function(scope, element, attrs){

            var stream = bmDashService.getEventStream();
            // Setup event listener to get data for this widget
            stream.addEventListener(scope.widgetType, function(event){
                var data = JSON.parse(event.data);
                scope.$apply(function(){
                    for (var k in data){
                        scope[k] = data[k];
                    }
                })
            });
    }



    return {
        restrict: 'E',
        link: {
            pre:  pre_link,
            post: post_link
        },
        controller: function($scope){
            $scope.getTemplateURL = function() {
                return encodeURI('widgets/' + $scope.widgetType + '/template.html')    
            }

        },
        template: '<ng-include src="getTemplateURL()" />'
    }

}]);
