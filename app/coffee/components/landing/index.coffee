module.exports = angular.module "nodejs.landing.home", [

]

.controller "LandingCtrl", [
  '$log', '$scope', '$http'
  ($log, $scope, $http) ->
    $log.log('LandingCtrl')
]