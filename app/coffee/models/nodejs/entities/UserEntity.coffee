require '../../utils/Utils.coffee'

module.exports = angular.module "nodejs.models.UserEntity", [
  'nodejs.models.Utils'
]

.service "UserEntity", [
  '$log', '$http'
  ($log, $http) ->
    $log.log('UserEntity')

    class UserEntity
      constructor: (id) ->
        this._exists = false

      save: ->

      exists: ->
        this._exists
]