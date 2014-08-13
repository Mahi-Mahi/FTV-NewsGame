'use strict';

describe('Controller: OutroCtrl', function () {

  // load the controller's module
  beforeEach(module('newsGameApp'));

  var OutroCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    OutroCtrl = $controller('OutroCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
