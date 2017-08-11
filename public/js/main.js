const socket = io.connect('/');

(()=> {
  let app = angular.module('pinApp', ['wu.masonry']);
  
  app.controller('PinController', ['$scope',
      ($scope)=> {

        socket.on('getPins', pins=> {
          $scope.pins = pins;
          $scope.$apply();
        });
  
        /**
         * Change blur of certain elements of page depending on if forms are visible.
         * If forms are visible, blur rest of page. Else, remove blur.
         */
        $scope.toggleBlur = ()=> {
          document.querySelectorAll('DIV:not(.cannot-blur)').forEach(div=>{
            if ($scope.showPinForm || $scope.showLoginForm || $scope.showSignupForm)
              div.classList.add('blur');
            else 
              div.classList.remove('blur');
          });
        };

        /**
         * Display create pin form upon click of create button.
         * Change styling of the floating menu button when clicked.
         */
        $scope.clickAddPin = isLoggedIn=>{
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

        /**
         * Get pins created by current user by communicating with server.
         */
        $scope.getCurrentUserPins = ()=>{
          socket.emit('getPinsByUser', userInfo._id);
        };

        /**
         * Get pins created by given user (parameter) by communicating with server.
         */
        $scope.getPinsByUserID = userID=> {
          socket.emit('getPinsByUser', userID);
        }

        /**
         * Get all pins in database by communicating with server.
         */
        $scope.getAllPins = ()=> {
          socket.emit('getAllPins');
        }

        /**
         * Add pin to view and to model (server db).
         */
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

        /**
         * Remove pin from view and from model (server db).
         */
        $scope.removePin = pin=> {
          const index = $scope.pins.indexOf(pin);
          $scope.pins.splice(index, 1);
          socket.emit('removePin', pin);
        };

        /**
         * Checks if pin was liked by user.
         * Changes styling of like heart button if liked by user.
         */
        $scope.checkIfUserLiked = pin=> {
          if (typeof userInfo != 'undefined' && pin.likers.indexOf(userInfo._id) >= 0)
            pin.liked = true;
        };

        /**
         * Toggle like button when clicked on.
         * Add/remove 1 like from view and update model (server db).
         */
        $scope.toggleLike = pin=> {
          if (typeof userInfo != 'undefined') {
            if (!pin.liked) {
              pin.likes += 1;
              pin.liked = true;
              socket.emit('incLike', {pin: pin, user: userInfo});
            } else {
              pin.likes -= 1;
              pin.liked = false;
              socket.emit('decLike', {pin: pin, user: userInfo});
            }
          }
        };
      }
  ]);

  /**
   * Ensures placeholder image if image is not found (err 404).
   */
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