window.BootCampSuite = angular.module('BootCampSuite', []);

BootCampSuite.run(['$rootScope','Reporter', function($rootScope, Reporter) {
  $rootScope._ = window._;
  window.Reporter = Reporter;
}]);

BootCampSuite.factory('Refs', ['$rootScope',
  function($rootScope) {
    var rootRef = new Firebase("https://andelabs-dev.firebaseio.com/");

    var uid = window.localStorage.getItem("uid");
    while(!uid) {
      uid = prompt('Please enter your name');
      window.localStorage.setItem("uid", uid);
    }
    $rootScope.uid = uid;
    var userRef = rootRef.child('users').child(uid);
    return {
      root: rootRef,
      queue: rootRef.child('queue'),
      user: userRef,
      started: userRef.child('started_labs'),
      completed: userRef.child('completed_labs'),
      session: rootRef.child('sessions').child(uid).child(LabSlug)
    };
}]);

BootCampSuite.factory('Authentication', ['Refs', '$rootScope', function(Refs, $rootScope) {
  return {
    auth: function (uid, cb) {
      var that = this;
      Refs.user.once('value', function(snap) {
        if(snap.val()) {
          cb(snap.val());
        }
        else {
          alert('Invalid `user-id`\n\nPlease, sign up at Andelabs and get a valid `user-id`');
          that.logout();
        }
      });
    },
    login: function() {
      Refs.root.authWithOAuthPopup('google', function(err,data) {
      }, {remember: true, scope: 'email'});
    },
    logout: function() {
      window.localStorage.removeItem('uid');
      delete $rootScope.uid;
      window.location.reload();
      return false;
    }
  };
}]);

BootCampSuite.factory('Reporter', ['Refs', '$rootScope', function(Refs, $rootScope) {

  return {
    reportComplete: function(cb) {
      //remove from started_labs
      var uid = $rootScope.uid;
      Refs.started.once('value', function(startedSnap) {
        var startedArray = startedSnap.val();
        if(startedArray) {
          var labIndex = startedArray.indexOf(LabSlug);
          var completedLab = startedArray.splice(labIndex, 1);
          Refs.started.set(startedArray, function(error) {
            if(!error) {
              //add to completed labs
              Refs.completed.once('value', function(completedSnap) {
                var completedArray = [];
                if(completedSnap.val()) {
                  completedArray = completedSnap.val();
                }
                completedArray.push(completedLab[0]);
                Refs.completed.set(completedArray);
              });
            }
          });
          //add completed timestamp to sessions
          Refs.session.child('completed_at').set(Firebase.ServerValue.TIMESTAMP, function(err) {
            if(!err) {
              //write to queue
              Refs.queue.push({
                organization_id: 'andela',
                    metric_id: CategoryId,
                    created_at: Firebase.ServerValue.TIMESTAMP,
                    user_id: uid,
                    value: 1,
              });
            }
          });
        }
      });
    }
  };
}]);

BootCampSuite.controller('SuiteCtrl', ['Refs', 'Authentication','Reporter','$scope', '$rootScope',
  function(Refs, Authentication, Reporter, $scope, $rootScope) {

  $rootScope.$watch('uid', function(newValue) {
    if(newValue) {
      Authentication.auth($rootScope.uid, function(authData) {
        if(authData) {
          jasmine.getEnv().addReporter(new JsKoansReporter());
          jasmine.getEnv().execute();
        }
        console.log($rootScope.uid, 'reporter initialized');
      });
    }
  });

  $scope.logout = function() {
   if(confirm('Are you sure you want to end your session?')) {
    Authentication.logout();
   }
  };
}]);
