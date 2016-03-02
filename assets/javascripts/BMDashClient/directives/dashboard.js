bmDash.directive('dashboard', ['$log','ClientDashboard','bmDashService', 

    function($log, clientDashboard, bmDashService){

    var link = function(scope, element, attrs){
        scope.dashboards = bmDashService.getDashboards();
        scope.selected = null; 
        scope.screen = null;
        scope.currentScreen = null;
        scope.screenList = null;
        scope.widgetList = null;

        
        var tearDown = function(){
            if (scope.selected){
                $log.debug('DASHBOARD: Tearing dashboad down');
            }
            
        }
        
        scope.grid = function(){

        }



        var setup = function(){
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

            setTimeout(function(){
                console.log('Grid Timeout!');
                $('.grid').gridList({ 
                    lanes: 3 
                });
            }, 250);
        }

        var onSelect = function(value){
            tearDown();
            setup();
        }
        scope.$watch('selected', onSelect)

       var init = function(){
            if (clientDashboard.length > 0){
                var dash = scope.dashboards[clientDashboard];
                if(dash){
                    scope.select(dash);
                }
            }
        }
        init();
    }

    return {
        restrict: 'E',
        link: link,
        templateUrl: 'dashboard.html'
    }
}

]);
