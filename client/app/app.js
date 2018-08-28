'use strict';

angular.module('RouteSpeed', [
  'ngAnimate',
  'ngMaterial',
  'dndLists',
  'xeditable',
  'ui.router',
  // 'ui.bootstrap',
  'ui.filters',
  'ui.directives',
  'vsGoogleAutocomplete',
  'RouteSpeed.theme',
  'RouteSpeed.pages',
   // '720kb.datepicker',
   'datePicker',
   'ui.bootstrap',
   'dragularModule',
    'sc.select'
   // 'angular-toArrayFilter'
   // 'dragDrop'
])
.config(function ($httpProvider) {
  $httpProvider.defaults.headers.common = {};
  $httpProvider.defaults.headers.post = {};
  $httpProvider.defaults.headers.put = {};
  $httpProvider.defaults.headers.patch = {};
});
