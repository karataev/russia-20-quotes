/**
 * Created by postepenno on 06.07.2015.
 */

;(function() {
  var nav = angular.module("myNav", []);

  nav.controller("NavController", function () {
    var vm = this;

    var $menu = $(".nav-menu");
    function open() {
      $menu.css({left:0});
    }

    function close() {
      $menu.css({left:"-320px"});
    }

    // exports
    vm.open = open;
    vm.close = close;
  })

  nav.directive("myNav", function () {
    return {
      replace:true,
      templateUrl:'my-nav/my-nav-view.html'
    }
  })
})();
