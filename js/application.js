window.BootCampSuite = angular.module('BootCampSuite', []);

BootCampSuite.run(['$rootScope','Reporter', function($rootScope, Reporter) {
  $rootScope._ = window._;
  window.Reporter = Reporter;
}]);

BootCampSuite.factory('Refs', function() {
  var rootRef = new Firebase("https://bootcamp-suite.firebaseio.com/");
  var username = localStorage.getItem("username");
  while(!username) {
    username = prompt('Please enter your name');
    localStorage.setItem("username", username);
  }

  return {
    cohort:  rootRef.child('class-4'),
    students: rootRef.child('class-4').child('students'),
    exercises: rootRef.child('class-4').child('exercises').child(lab_name),
    currentUser: rootRef.child('class-4').child('students').child(username)
  };
});

BootCampSuite.factory('Reporter', ['Refs', function(Refs) {
  var username = localStorage.getItem("username");
  var timestamp = Number(new Date());
  return {
    push: function(result, cb) {
      Refs.exercises.child(username).remove(function(err) {
        if(err) {
          console.log("something broke in exercise child remove: ", err);
        }
        else {
          Refs.exercises.child(username).push(result, cb);
        }
      });
      Refs.currentUser.child(lab_name).remove(function(err) {
        if(err) {
          console.log("something broke in currentUser labname remove: ", err);
        }
        else {
          Refs.currentUser.child(lab_name).push(result, cb);
        }
      });
    }
  };
}]);

BootCampSuite.controller('SuiteCtrl', ['Refs','Reporter', function(Refs, Reporter) {
  jasmine.getEnv().addReporter(new JsKoansReporter());
  jasmine.getEnv().execute();
}]);
