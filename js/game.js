/**
 * Created by postepenno on 07.07.2015.
 */

var app = angular.module("app", ["ngSocial", "ngAnimate", "myNav"]);

app.controller("MainController", function ($scope, DataService) {
  var vm = this;

  var nextLevelId = undefined;
  vm.curItem = undefined;
  vm.gameComplete = false;
  vm.correctAnswers = 0;

  DataService.load(function (data) {
    vm.curItem = DataService.getItem(0);
  })

  function nextClick($event) {
    $($event.target).attr("disabled", true); // disable next button to avoid extra clicks
    nextLevelId = vm.curItem.id + 1;
    vm.curItem = undefined; // start 'leave' animation
    //$scope.$apply();
  }

  // callback from animation. egggh, ugly
  function contentLeaveComplete() {
    if (DataService.isItemExist(nextLevelId)) {
      vm.curItem = DataService.getItem(nextLevelId);
    } else {
      doGameComplete();
    }
  }


  function playerAnswered(answer) {
    answer.selected = true;
    if (answer.correct) {
      vm.correctAnswers++;
      //console.log("RIIIGHT!");
    } else {
      //console.log("wrong :(");
    }
    vm.curItem.answers.forEach(function (x) {
      x.disable = true;
    })
  }

  function isLevelComplete() {
    var selectedItems = vm.curItem.answers.filter(function (x) {
      return x.selected === true;
    })
    return selectedItems.length === 0 ? false : true;
  }

  function doGameComplete() {
    vm.curItem = undefined;
    vm.gameComplete = true;
  }

  // exports
  vm.isLevelComplete = isLevelComplete;
  vm.playerAnswered = playerAnswered;
  vm.contentLeaveComplete = contentLeaveComplete;
  vm.nextClick = nextClick;
  vm.getTotalItems = DataService.getTotalItems;
  vm.doGameComplete = doGameComplete;
})

app.factory("DataService", function ($http) {
  return {
    items:undefined,
    load: function (callback) {
      $http.get("data/quotes.json")
        .success(function (data) {
          items = data
            .map(function (x, i) {
              x.id = i;
              x.answers[0].correct = true;
              x.answers = x.answers.map(function (answer) {
                if (answer.avatar === "") answer.avatar = "img/150x200.png";
                else answer.avatar = "img/" + answer.avatar;
                return answer;
              })
              x.answers = _.shuffle(x.answers);
              return x;
            })
          //.filter(function (x) { return x.id < 2; })
          callback(items);
        })
    },
    getTotalItems: function () {
      return items.length;
    },
    isItemExist: function (id) {
      return items[id] !== undefined;
    },
    getItem: function (id) {
      return items[id];
    }
  }
})

app.directive("answerBox", function () {
  return {
    link: function (scope, el, attrs) {
      el.on('mouseenter', function () {
        el.css({"background-color":"#dddddd"})
      });
      el.on('mouseleave', function () {
        el.css({"background-color":"#ffffff"})
      })
      el.on('click', function () {
        scope.main.playerAnswered(scope.answer);
        scope.$apply();
      })

      scope.$watch('answer.disable', function (newVal) {
        if (newVal === true) {
          el.off();
          el.removeClass('clickable');
          if (scope.answer.correct) {
            el.css({
              "background-color":"rgb(71, 221, 71)",
              "border-color": "#267326"
            });
          }
          if (scope.answer.selected && !scope.answer.correct) {
            el.css({
              "background-color":"rgb(203, 73, 73)",
              "border-color": "#832929"
            });
          }

        }
      })
    },
    replace:true,
    template:'<div class="answer clickable">' +
    '<img ng-src="{{answer.avatar}}" alt="" class="img-person"/>' +
    '<h3>{{answer.author}}</h3>' +
    '</div>'

  }
})

app.animation(".tweens", function () {
  return {
    enter: function (element, done) {
      TweenMax.from(element, 0.5, {opacity:0, x:"+=40", onComplete:done});
    },
    leave: function (element, done) {
      var scope = element.scope();
      TweenMax.to(element, 0.5, {opacity:0, x:"-=40", onComplete: function () {
        done();
        scope.main.contentLeaveComplete();
      }});
    }
  }
})


// ************** CONSOLE HELPERS ***********************
function gameComplete() {
  var scope = $("body").scope();
  scope.main.gameComplete = true;
  scope.$apply();
}