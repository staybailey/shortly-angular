angular.module('shortly', [
  'shortly.services',
  'shortly.links',
  'shortly.shorten',
  'shortly.auth',
  //'ngRoute',
  'ui.router'
]).directive('navbar', function () {
  return {
    restrict: 'E',
    templateUrl: 'app/templates/navBar.html'
  };
})
// .config(function ($routeProvider, $httpProvider) {
//   $routeProvider
//     .when('/signin', {
//       templateUrl: 'app/auth/signin.html',
//       controller: 'AuthController'
//     })
//     .when('/signup', {
//       templateUrl: 'app/auth/signup.html',
//       controller: 'AuthController'
//     })
//     .when('/shorten', {
//       templateUrl: 'app/shorten/shorten.html',
//       controller: 'ShortenController',
//       authenticate: true
//     })
//     .when('/links', {
//       templateUrl: 'app/links/links.html',
//       controller: 'LinksController',
//       authenticate: true,
//       resolve: {
//         links: function (Links) {
//           return Links.getAll();
//         }
//       }
//     })
//     .otherwise({
//       templateUrl: 'app/links/links.html',
//       controller: 'LinksController',
//       authenticate: true
//     });
//     // Your code here

//     // We add our $httpInterceptor into the array
//     // of interceptors. Think of it like middleware for your ajax calls
//     $httpProvider.interceptors.push('AttachTokens');
// })
.config(function ($stateProvider, $urlRouterProvider, $httpProvider) {
  // for any other state
  $urlRouterProvider.otherwise("/links");
  // for existing states
  $stateProvider
    .state('loggedin', {
      templateUrl: "app/ui-routes/loggedin.html"
    })
    .state('loggedin.links', {
      url: "/links",
      templateUrl: "app/ui-routes/loggedin.links.html",
      controller: 'LinksController',
      resolve: {
        links: function (Links) {
          return Links.getAll();
        }
      },
      authenticate: true
    })
    .state('loggedin.shorten', {
      url: "/shorten",
      templateUrl: "app/ui-routes/loggedin.shorten.html",
      controller: 'ShortenController',
      authenticate: true
    })
    .state('loggedout', {
      templateUrl: "app/ui-routes/loggedout.html"
    })
    .state('loggedout.signin', {
      url: "/signin",
      templateUrl: "app/ui-routes/loggedout.signin.html",
      controller: 'AuthController'
    })
    .state('loggedout.signup', {
      url: "/signup",
      templateUrl: "app/ui-routes/loggedout.signup.html",
      controller: 'AuthController'
    });
    // Your code here

    // We add our $httpInterceptor into the array
    // of interceptors. Think of it like middleware for your ajax calls
    $httpProvider.interceptors.push('AttachTokens');
})
.factory('AttachTokens', function ($window) {
  // this is an $httpInterceptor
  // its job is to stop all out going request
  // then look in local storage and find the user's token
  // then add it to the header so the server can validate the request
  var attach = {
    request: function (object) {
      var jwt = $window.localStorage.getItem('com.shortly');
      if (jwt) {
        object.headers['x-access-token'] = jwt;
      }
      object.headers['Allow-Control-Allow-Origin'] = '*';
      return object;
    }
  };
  return attach;
})
.run(function ($rootScope, $state, Auth) {
  // here inside the run phase of angular, our services and controllers
  // have just been registered and our app is ready
  // however, we want to make sure the user is authorized
  // we listen for when angular is trying to change routes
  // when it does change routes, we then look for the token in localstorage
  // and send that token to the server to see if it is a real user or hasn't expired
  // if it's not valid, we then redirect back to signin/signup
  /*
  $rootScope.$on('$routeChangeStart', function (evt, next, current) {
    console.log("auth", Auth.isAuth());
    console.log("route.authenticate", next.$$route.authenticate);
    if (next.$$route && next.$$route.authenticate && !Auth.isAuth()) {
      console.log("inside auth if statement");
      $location.path('/signin');
    }
  });
*/
  $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
    if (toState && toState.authenticate && !Auth.isAuth()) {
      event.preventDefault();
      $state.go('loggedout.signin');
    }
  });
});
