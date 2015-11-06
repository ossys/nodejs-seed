module.exports = angular.module "nodejs.dashboard.home", [

]

.controller "DashboardCtrl", [
  '$log', '$scope', '$http'
  ($log, $scope, $http) ->
    $log.log('DashboardCtrl')
]