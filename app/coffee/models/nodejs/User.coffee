require './entities/UserEntity.coffee'

module.exports = angular.module "nodejs.models.User", [
  'nodejs.models.UserEntity'
]

.service "User", [
  '$log', 'UserEntity'
  ($log, UserEntity) ->
    $log.log('User')
    class User extends UserEntity

]