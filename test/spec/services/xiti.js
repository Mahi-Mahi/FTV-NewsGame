'use strict';

describe('Service: Xiti', function () {

  // load the service's module
  beforeEach(module('newsGameApp'));

  // instantiate service
  var Xiti;
  beforeEach(inject(function (_Xiti_) {
    Xiti = _Xiti_;
  }));

  it('should do something', function () {
    expect(!!Xiti).toBe(true);
  });

});
