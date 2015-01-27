window.BootCampSuite = angular.module('BootCampSuite', []);
window.LabSlug = 'missing_number';
window.CategoryId = 'BootCamp';

BootCampSuite.run(['$rootScope','Reporter', function($rootScope, Reporter) {
  $rootScope._ = window._;
  window.Reporter = Reporter;
}]);

BootCampSuite.factory('Refs', function() {
  var rootRef = new Firebase("https://andelab-dev.firebaseio.com/");
  var uid = localStorage.getItem("username");
  while(!uid) {
    uid = prompt('Please enter your name');
    localStorage.setItem("username", uid);
  }

  return {
    queue: rootRef.child('queue'),
    started: rootRef.child(uid).child('started_labs'),
    completed: rootRef.child(uid).child('completed_labs'),
    session: rootRef.child('sessions').child(uid).child(LabSlug)
  };
});

BootCampSuite.factory('Reporter', ['Refs', function(Refs) {
  var uid = localStorage.getItem("username");
  var timestamp = Number(new Date());
  return {
    reportComplete: function(cb) {
      //remove from started_labs
      Refs.started.once('value', function(startedSnap) {
        if(startedSnap.val()) {
          var startedArray = startedSnap.val();
          var labIndex = startedArray.indexOf(LabSlug);
          var completedLab = startedArray.splice(labIndex, 1);
          Refs.started.set(started, function(error) {
            if(!error) {
              //add to completed labs
              Refs.completed.once('value', function(completedSnap) {
                if(completedSnap.val()) {
                  var completedArray = completedSnap.val();
                  completedArray.push(completedLab);
                  Refs.completed.set(completedArray);
                }
              });
            }
          });
        }
      });

      //add completed timestamp to sessions

      Refs.session.child('completed_at').set(Firebase.ServerValue.TIMESTAMP);

      //write to queue

      Ref.queue.set({
        organization_id: 'andela',
            metric_id: CategoryId,
            created_at: Firebase.ServerValue.TIMESTAMP,
            user_id: uid,
            value: 1,
      });
    }
  };
}]);

BootCampSuite.controller('SuiteCtrl', ['Refs','Reporter', function(Refs, Reporter) {
  jasmine.getEnv().addReporter(new JsKoansReporter());
  jasmine.getEnv().execute();
}]);
