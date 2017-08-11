const socket = io.connect('/');

(()=> {
  let app = angular.module('pinApp', ['wu.masonry']);
  
  app.controller('PinController', ['$scope',
      ($scope)=> {
        $scope.buttonStyle = {};

        socket.on('getPins', pins=> {
          $scope.pins = pins;
          $scope.$apply();
        });
  
        $scope.toggleBlur = ()=> {
          console.log('blurring');
          document.querySelectorAll('DIV:not(.cannot-blur)').forEach((div)=>{
            if ($scope.showPinForm || $scope.showLoginForm || $scope.showSignupForm)
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

        $scope.getCurrentUserPins = ()=>{
          socket.emit('getPinsByUser', userInfo._id);
        };

        $scope.getPinsByUserID = userID=> {
          socket.emit('getPinsByUser', userID);
        }

        $scope.getAllPins = ()=> {
          socket.emit('getAllPins');
        }

        $scope.addPin = ()=> {
          const pin = {
            image: $scope.imageURL,
            pinner: userInfo,
            description: $scope.description,
            likes: 0
          };
          $scope.pins.push(pin);
          socket.emit('createPin', pin);
        };

        $scope.removePin = pin=> {
          const index = $scope.pins.indexOf(pin);
          $scope.pins.splice(index, 1);
          socket.emit('removePin', pin);
        };

        $scope.checkIfUserLiked = pin=> {
          if (pin.likers.indexOf(userInfo._id) >= 0) 
            pin.liked = true;
        };

        $scope.toggleLike = pin=> {
          if (!pin.liked) {
            pin.likes += 1;
            pin.liked = true;
            socket.emit('incLike', {pin: pin, user: userInfo});
          } else {
            pin.likes -= 1;
            pin.liked = false;
            socket.emit('decLike', {pin: pin, user: userInfo});
          }
        };
      }
  ]);

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
})();