(()=> {
  let app = angular.module('pinApp', []);

  app.directive('errSrc', function() {
    return {
      link: function(scope, element, attrs) {
        element.bind('error', function() {
          if (attrs.src != attrs.errSrc) {
            attrs.$set('src', attrs.errSrc);
          }
        });
      }
    }
  });
  
  app.controller('PinController', ['$scope',
      ($scope)=> {
        $scope.buttonStyle = {};
        $scope.pins = [];

        $scope.clickAddPin = isLoggedIn=>{
          console.log(isLoggedIn);
          if (isLoggedIn) {
            $scope.showPinForm = !$scope.showPinForm;
            $scope.buttonStyle = $scope.showPinForm ? {
              'background-color': 'rgba(0, 0, 0, 0.2)'
            } : {};
            $scope.linkStyle = $scope.showPinForm ? {
              'color': 'rgba(255, 255, 255, 0.5)'
            } : {};
          } else {
            $scope.showLoginForm = true;
          }
        };

        $scope.updatePins = pins=>{
          console.log('updating');
          $scope.pins = pins;
        }
      }
  ]);
})();