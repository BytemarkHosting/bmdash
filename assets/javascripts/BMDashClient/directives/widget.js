bmDash.directive('widget', ['$compile','bmDashService', function($compile, bmDashService){

    post_link = function(scope, element, attrs){
        scope.eventStream = bmDashService.getEventStream();
    }

    pre_link = function(scope, element, attrs){
        console.log('pre', attrs);
        scope.widgetType = attrs.type;
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
