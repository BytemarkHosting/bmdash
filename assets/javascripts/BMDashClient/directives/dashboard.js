bmDash.directive('dashboard', ['$log','bmDashService', 
    function($log, bmDashService){

    link = function(scope, element, attrs){
        scope.dashboards = bmDashService.getDashboards();
        scope.selected = null; 
        scope.screen = null;
        scope.currentScreen = null;
        scope.screenList = null;
        scope.widgetList = null;

        
        tearDown = function(){
            if (scope.selected){
                $log.debug('DASHBOARD: Tearing dashboad down');
            }
            
        }
        
        scope.grid = function(){
            $('.grid').gridList({
                lanes: 5
            });
        }

        setup = function(){
            if (scope.selected){
                $log.debug('DASHBOARD: Setting up Dashboard ' + scope.selected.name);
                console.log(scope.currentScreen);

            }
        }

        scope.select = function(dash){
            scope.selected = dash;
            scope.screens = dash.screens;
            scope.currentScreen = dash.screens[0];
            scope.widgetList = dash.widgets;
        }

        onSelect = function(value){
            tearDown();
            setup();
        }
        scope.$watch('selected', onSelect)
    }

    return {
        restrict: 'E',
        link: link
    };
}

]);
