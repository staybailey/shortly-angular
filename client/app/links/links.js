angular.module('shortly.links', [])

.controller('LinksController', function ($scope, links) {
  // Your code here
  $scope.data = {};
  $scope.data.links = links;

});
