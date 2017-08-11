(()=> {
  let app = angular.module('pinApp', ['wu.masonry']);
  
  app.controller('PinController', ['$scope',
      ($scope)=> {
        $scope.buttonStyle = {};
        $scope.pins = [];
  
        $scope.toggleBlur = ()=> {
          console.log('happens');
          document.querySelectorAll('DIV:not(.cannot-blur)').forEach((div)=>{
            if ($scope.showPinForm || $scope.showLoginForm)
              div.classList.add('blur');
            else 
              div.classList.remove('blur');
          });
        };

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

        $scope.addPin = ()=> {
          $scope.pins.push({
            image: $scope.imageURL,
            pinner: userInfo,
            description: $scope.description,
            likes: 0
          });
        }

         $scope.removePin = pin=> { 
          const index = $scope.pins.indexOf(pin);
          $scope.pins.splice(index, 1);
        }
      }
  ]);
})();