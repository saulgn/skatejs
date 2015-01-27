'use strict';

import helpers from '../lib/helpers';
import skate from '../../src/skate';

describe('Lifecycle Callbacks', function () {
  var MyEl;
  var myEl;
  var tagName;
  var created = false;
  var attached = false;
  var detached = false;

  beforeEach(function () {
    tagName = helpers.safeTagName('my-el');
    created = false;
    attached = false;
    detached = false;
    MyEl = skate(tagName.safe, {
      created: function () {
        created = true;
      },
      attached: function () {
        attached = true;
      },
      detached: function () {
        detached = true;
      }
    });
    myEl = new MyEl();
  });

  it('should call the created() callback when the element is created', function () {
    expect(created).to.equal(true);
    expect(attached).to.equal(false);
    expect(detached).to.equal(false);
  });

  it('should call the attached() callback when the element is attached', function (done) {
    helpers.fixture().appendChild(myEl);
    helpers.afterMutations(function () {
      expect(created).to.equal(true);
      expect(attached).to.equal(true);
      expect(detached).to.equal(false);
      done();
    });
  });

  it('should call the detached() callback when the element is detached', function (done) {
    helpers.fixture().appendChild(myEl);
    helpers.afterMutations(function () {
      helpers.fixture().removeChild(myEl);
      helpers.afterMutations(function () {
        expect(created).to.equal(true);
        expect(attached).to.equal(true);
        expect(detached).to.equal(true);
        done();
      });
    });
  });

  it('should not call the attached() callback when the element is initialised', function () {
    skate.init(myEl);
    expect(created).to.equal(true);
    expect(attached).to.equal(false);
    expect(detached).to.equal(false);
  });
});

describe('Unresolved attribute', function () {
  it('should remove the "unresolved" attribute after the created callback is called', function () {
    var tagName = helpers.safeTagName('my-element');
    skate(tagName.safe, {
      created: function (element) {
        expect(element.hasAttribute('unresolved')).to.equal(true);
        expect(element.hasAttribute('resolved')).to.equal(false);
      }
    });

    skate.init(helpers.fixture('<my-element unresolved></my-element>', tagName));
  });

  it('should remove the "unresolved" attribute before the attached callback is called', function () {
    var tagName = helpers.safeTagName('my-element');
    skate(tagName.safe, {
      attached: function (element) {
        expect(element.hasAttribute('unresolved')).to.equal(false);
        expect(element.hasAttribute('resolved')).to.equal(true);
      }
    });

    skate.init(helpers.fixture('<my-element unresolved></my-element>', tagName));
  });
});

describe('Lifecycle scenarios', function () {
  var calls;
  var El;

  beforeEach(function () {
    calls = {
      created: 0,
      attached: 0,
      detached: 0
    };

    var {safe: tagName} = helpers.safeTagName('my-element');
    El = skate(tagName, {
      created: function () {
        ++calls.created;
      },
      attached: function () {
        ++calls.attached;
      },
      detached: function () {
        ++calls.detached;
      }
    });
  });

  describe('use the constructor then add it to the DOM', function () {
    beforeEach(function () {
      helpers.fixture(new El());
    });

    it('should call created', function (done) {
      helpers.afterMutations(function () {
        expect(calls.created).to.greaterThan(0);
        done();
      });
    });

    it('should call attached', function (done) {
      helpers.afterMutations(function () {
        expect(calls.attached).to.greaterThan(0);
        done();
      });
    });
  });

  describe('attached multiple times', function () {
    function expectNumCalls (num, val, done) {
      var el = new El();

      el.textContent = 'gagas';

      helpers.fixture(el);
      helpers.afterMutations(function () {
        helpers.fixture().removeChild(el);
        helpers.afterMutations(function () {
          helpers.fixture(el);
          helpers.afterMutations(function () {
            helpers.fixture().removeChild(el);
            helpers.afterMutations(function () {
              expect(calls[num]).to.equal(val);
              done();
            });
          });
        });
      });
    }

    it('should have called created only once', function (done) {
      expectNumCalls('created', 1, done);
    });

    it('should have called attached twice', function (done) {
      expectNumCalls('attached', 2, done);
    });

    it('should have called detached twice', function (done) {
      expectNumCalls('detached', 2, done);
    });
  });
});
