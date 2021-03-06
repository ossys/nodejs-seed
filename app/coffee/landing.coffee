require 'angular'
require 'bootstrap'

require './components/landing/index.coffee'

module.exports = angular.module 'nodejs.landing', [
  'ui.router'
  'ui.bootstrap'
  'nodejs.templates'
  'nodejs.dashboard.home'
]

.run([
  '$log'
  ($log) ->
])

.constant 'CONSTANTS', {
  'API' : {
    'v1' : '/api/v1'
  }
}

.config([
  '$stateProvider', '$urlRouterProvider'
  ($stateProvider,   $urlRouterProvider) ->
    $stateProvider.state("home",
      url: "/"
      controller: "DashboardCtrl"
      templateUrl: "dashboard/templates/home.html"
    )

    # if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise "/"
])