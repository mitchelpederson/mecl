var app = angular.module("mecLeaderboard", []);

app.controller("leaderboardCtrl", function($scope, $http){

  $scope.res = "Waiting...";

  ps4Leaderboard = [];
  xboxLeaderboard = [];
  pcLeaderboard = [];

  $scope.leaderboard = [];

  $scope.formatScore = function(score) {

    fscore = "";

    var min = Math.floor(Math.floor(score / 100) / 60);
    var sec = Math.floor(score / 100) % 60;
    var cen = score % 100;

    fscore = min.toString() + ":" + sec.toString() + "." + cen.toString();
    return fscore;
  };

  $http({

      method: 'POST',
      url:'https://mec-gw.ops.dice.se/jsonrpc/prod_default/prod_default/ps4/api',
      data: {"jsonrpc":"2.0","method":"Pamplona.getPlayerRunnersRoutePercentiles","params":{"personaId":"184569972"},"id":"b64fd849-c1be-4964-bc2f-d7404b34c7dc"},
      headers: {
        'Content-Type': "application/json"
      }

    }).then (function(response) {

      console.log(response);
      $scope.res = "Success!";
      
      var keys = Object.keys(response.data.result);

      var runs = [];

      for (var i = 0; i < keys.length; i++) {
        runs.push({'name': keys[i], 'rank': response.data.result[keys[i]].rank});
      }

      $scope.rankInfo = runs;

      $scope.avgRank = 0.0;

      for (var i = 0; i < 22; i++) {
        $scope.avgRank += runs[i].rank;
      }

      $scope.avgRank /= 22.0;

    }, function(response) {

      console.log(response);
      $scope.res = "Failed!";

    });


    $scope.getLeaderboard = function(runID) {

      console.log("Getting leaderboard for " + runID);

      $scope.leaderboard = [];

      $http({

        method: 'POST',
        url:'https://mec-gw.ops.dice.se/jsonrpc/prod_default/prod_default/ps4/api',
        data: {"jsonrpc":"2.0","method":"Pamplona.getRunnersRouteLeaderboard","params":{"challengeId": runID},"id":"b64fd849-c1be-4964-bc2f-d7404b34c7dc"},
        headers: {
          'Content-Type': "application/json"
        }

      }).then(function ps4Success(response) {

        console.log(response);
        ps4Leaderboard = [];

        for (var i = 0; i < 100; i++) {

          ps4Leaderboard.push({

            'name': response.data.result.leaderboard.users[i].name,
            'score': $scope.formatScore(response.data.result.leaderboard.users[i].score),
            'plat': 'ps4'

          });
        }

      }, function ps4Fail(response) {

        console.log(response);
        $scope.res = "PS4 leaderboard request failed!";

      }).then(function() {

        console.log("Calling PC");
        $http({

          method: 'POST',
          url:'https://mec-gw.ops.dice.se/jsonrpc/prod_default/prod_default/pc/api',
          data: {"jsonrpc":"2.0","method":"Pamplona.getRunnersRouteLeaderboard","params":{"challengeId": runID},"id":"b64fd849-c1be-4964-bc2f-d7404b34c7dc"},
          headers: {
            'Content-Type': "application/json"
          }

        }).then (function pcSuccess(pcResponse) {

          console.log(pcResponse);

          pcLeaderboard = [];
          for (var i = 0; i < 100; i++) {

            pcLeaderboard.push({

              'name': pcResponse.data.result.leaderboard.users[i].name,
              'score': $scope.formatScore(pcResponse.data.result.leaderboard.users[i].score),
              'plat': 'pc'

            });
          }

          return;

        }, function pcFail(response) {

          console.log(response);
          $scope.res = "PC leaderboard request failed!";

        }).then(function() {

          console.log("Calling xbox 1");

          $http({

            method: 'POST',
            url:'https://mec-gw.ops.dice.se/jsonrpc/prod_default/prod_default/xboxone/api',
            data: {"jsonrpc":"2.0","method":"Pamplona.getRunnersRouteLeaderboard","params":{"challengeId": runID},"id":"b64fd849-c1be-4964-bc2f-d7404b34c7dc"},
            headers: {
              'Content-Type': "application/json"
            }

          }).then (function xboxSuccess(xResponse) {

            console.log(xResponse);
            xboxLeaderboard = [];

            for (var i = 0; i < 100; i++) {

              xboxLeaderboard.push({

                'name': xResponse.data.result.leaderboard.users[i].name,
                'score': $scope.formatScore(xResponse.data.result.leaderboard.users[i].score),
                'plat': 'x1'

              });
            }

            return;

          }, function xboxFail(response) {

            console.log(response);
            $scope.res = "xbox leaderboard request failed!";

          }).then(function consolidateLeaderboards() {

            for (var i = 0; i < 100; i++) {
              $scope.leaderboard.push(ps4Leaderboard[i]);
              $scope.leaderboard.push(xboxLeaderboard[i]);
              $scope.leaderboard.push(pcLeaderboard[i]);
            }

            console.log($scope.leaderboard);
          });
        
        });

      });

    };

});