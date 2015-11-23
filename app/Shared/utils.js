/*global angular, $, jQuery*/
angular.module('OUtils',[]).directive("oFocus", [function() {
  return {
    restrict: "A",
    link: function link(scope, element, attribs) {
      attribs.$observe('oFocus', function(value) {
        if (value != false) {
          setTimeout(element.focus.bind(element), 10);
        }
      });
    }
  }
}]).directive("oTap", ["$parse", "isMobile", function($parse, isMobile) {
  var lastTapped = null;
  window.addEventListener("popstate", function(e) {
    $('.o-tap').removeClass("o-tap");
  });
  return {
    restrict: "A",
    link: function link(scope, element, attribs) {
      var condiFun = $parse(attribs.oTap);
      var firstTarget = null;
      element.on('touchend', function(e) {
        if (!element.hasClass('o-tap')) {
          if (lastTapped != null) {
            lastTapped.removeClass('o-tap');
          }
          if (location.hash != "#otap") {
            history.pushState(null, null, "#otap");
          }
          element.addClass('o-tap');
          lastTapped = element;
          firstTarget = e.target;
        } else {
          if (e.target == firstTarget || e.target == element.get(0)) {
            element.removeClass('o-tap');
            firstTarget = null;
          }
        }
      });
      element.on('click', function(e) {
        if (isMobile() && element.prop('tagName').toUpperCase() == "A" && condiFun(window) && element.hasClass('o-tap')) {
          e.preventDefault();
        }
      });
      element.on('mouseenter', function(e) {
        element.addClass('o-tap');
      });
      element.on('mouseleave', function(e) {
        element.removeClass('o-tap');
      });
    }
  };
}]).directive("oMasked", [function() {
  var ua = navigator.userAgent,
    iPhone = /iphone/i.test(ua),
    chrome = /chrome/i.test(ua),
    android = /android/i.test(ua);
  var defaults = { // Predefined character definitions
    definitions: {
      '9': "[0-9]",
      'a': "[A-Za-z]",
      '*': "[A-Za-z0-9]"
    },
    placeholder: '_'
  };
  return {
    priority: 2,
    restrict: 'A',
    scope: false,
    require: '?^oValidateon',
    link: function oMaskedPostLink($scope, $element, $attrs, oValidateOn) {
      var caretTimeoutId = null;
      var validatorState = null;
      var firstInvokeWatchFunction = true;
      var tests, partialPosition, firstNonMaskPos, lastRequiredNonMaskPos, len, oldVal;
      var mask = $attrs.oMasked;
      var focusText = null;
      var settings = {
        autoclear: !$attrs.oMaskedNoclear,
        placeholder: defaults.placeholder
      };
      tests = [];
      partialPosition = len = mask.length;
      firstNonMaskPos = null;
      mask.split("").forEach(function(c, i) {
        "?" == c ? (len--, partialPosition = i) : defaults.definitions[c] ? (tests.push(new RegExp(defaults.definitions[c])), null === firstNonMaskPos && (firstNonMaskPos = tests.length - 1), partialPosition > i && (lastRequiredNonMaskPos = tests.length - 1)) : tests.push(null);
      });
      var buffer = mask.split("").map(function(c, i) {
        return "?" != c ? defaults.definitions[c] ? getPlaceholder(i) : c : void 0;
      });
      var defaultBuffer = buffer.join("");
      focusText = $element.val();

      function caret(begin, end) {
        var range;
        var rawElement = $element.get(0);
        if ($element.attr("hidden") == null) return "number" == typeof begin ? (end = "number" == typeof end ? end : begin, rawElement.setSelectionRange ? rawElement.setSelectionRange(begin, end) : rawElement.createTextRange && (range = rawElement.createTextRange(), range.collapse(!0), range.moveEnd("character", end), range.moveStart("character", begin), range.select())) : (rawElement.setSelectionRange ? (begin = rawElement.selectionStart, end = rawElement.selectionEnd) : document.selection && document.selection.createRange && (range = document.selection.createRange(), begin = 0 - range.duplicate().moveStart("character", -1e5), end = begin + range.text.length), {
          begin: begin,
          end: end
        });
      }

      function tryFireCompleted() {
        for (var i = firstNonMaskPos; lastRequiredNonMaskPos >= i; i++)
          if (tests[i] && buffer[i] === getPlaceholder(i)) {
            return false;
          }
        return true;
      }

      function getPlaceholder(i) {
        return settings.placeholder.charAt(i < settings.placeholder.length ? i : 0);
      }

      function seekNext(pos) {
        for (; ++pos < len && !tests[pos];);
        return pos;
      }

      function seekPrev(pos) {
        for (; --pos >= 0 && !tests[pos];);
        return pos;
      }

      function shiftL(begin, end) {
        var i, j;
        if (!(0 > begin)) {
          for (i = begin, j = seekNext(end); len > i; i++)
            if (tests[i]) {
              if (!(len > j && tests[i].test(buffer[j]))) break;
              buffer[i] = buffer[j], buffer[j] = getPlaceholder(j), j = seekNext(j);
            }
          writeBuffer(), caret(Math.max(firstNonMaskPos, begin));
        }
      }

      function shiftR(pos) {
        var i, c, j, t;
        for (i = pos, c = getPlaceholder(pos); len > i; i++)
          if (tests[i]) {
            if (j = seekNext(i), t = buffer[i], buffer[i] = c, !(len > j && tests[j].test(t))) break;
            c = t;
          }
      }

      function androidInputEvent() {
        var curVal = $element.val(),
          pos = caret();
        if (oldVal && oldVal.length && oldVal.length > curVal.length) {
          for (checkVal(!0); pos.begin > 0 && !tests[pos.begin - 1];) pos.begin--;
          if (0 === pos.begin)
            for (; pos.begin < firstNonMaskPos && !tests[pos.begin];) pos.begin++;
          caret(pos.begin, pos.begin);
        } else {
          for (checkVal(!0); pos.begin < len && !tests[pos.begin];) pos.begin++;
          caret(pos.begin, pos.begin);
        }
      }

      function blurEvent() {
        checkVal(), $element.val() != focusText && $element.change();
      }

      function keydownEvent(e) {
        if (!$element.prop("readonly")) {
          var pos, begin, end, k = e.which || e.keyCode;
          oldVal = $element.val(), 8 === k || 46 === k || iPhone && 127 === k ? (pos = caret(), begin = pos.begin, end = pos.end, end - begin === 0 && (begin = 46 !== k ? seekPrev(begin) : end = seekNext(begin - 1), end = 46 === k ? seekNext(end) : end), clearBuffer(begin, end), shiftL(begin, end - 1), e.preventDefault()) : 13 === k ? blurEvent.call(this, e) : 27 === k && ($element.val(focusText), caret(0, checkVal()), e.preventDefault());
        }
      }

      function keypressEvent(e) {
        if (!$element.prop("readonly")) {
          var p, c, next, k = e.which || e.keyCode,
            pos = caret();
          if (!(e.ctrlKey || e.altKey || e.metaKey || 32 > k) && k && 13 !== k) {
            if (pos.end - pos.begin !== 0 && (clearBuffer(pos.begin, pos.end), shiftL(pos.begin, pos.end - 1)), p = seekNext(pos.begin - 1), len > p && (c = String.fromCharCode(k), tests[p].test(c))) {
              if (shiftR(p), buffer[p] = c, writeBuffer(), next = seekNext(p), android) {
                setTimeout(caret.bind($element, next), 0);
              } else caret(next);
              p == lastRequiredNonMaskPos && $element.change();
            }
            e.preventDefault();
          }
        }
      }

      function clearBuffer(start, end) {
        var i;
        for (i = start; end > i && len > i; i++) tests[i] && (buffer[i] = getPlaceholder(i));
      }

      function writeBuffer() {
        $element.val(buffer.join(""));
      }

      function checkVal(allow) {
        var i, c, pos, test = $element.val(),
          lastMatch = -1;
        for (i = 0, pos = 0; len > i; i++) {
          if (tests[i]) {
            for (buffer[i] = getPlaceholder(i); pos++ < test.length;) {
              c = test.charAt(pos - 1);
              if (tests[i].test(c)) {
                buffer[i] = c, lastMatch = i;
                break;
              }
            }
            if (pos > test.length) {
              clearBuffer(i + 1, len);
              break;
            }
          } else {
            buffer[i] === test.charAt(pos) && pos++, partialPosition > i && (lastMatch = i);
          }
        }
        return allow ? writeBuffer() : partialPosition > lastMatch + 1 ? settings.autoclear || buffer.join("") === defaultBuffer ? ($element.val() && $element.val(""), clearBuffer(0, len)) : writeBuffer() : (writeBuffer(), $element.val($element.val().substring(0, lastMatch + 1))), partialPosition ? i : firstNonMaskPos;
      }

      function regularInputEvents() {
        if ($element.prop("readonly")) {
          return;
        }
        setTimeout(function() {
          var pos = checkVal(true);
          caret(pos);
        }, 0);
      }
      if (oValidateOn) {
        oValidateOn.registerValidator($element.prop('name'), 'oMasked', tryFireCompleted);
      } /* init */
      checkVal();
      if ($attrs.ngModel) {
        $scope.$watch($attrs.ngModel, function(newVal, oldVal) {
          if (newVal != oldVal || firstInvokeWatchFunction) {
            checkVal();
          }
        });
      }
      $element.on("focus", function() {
        if ($element.prop("readonly")) {
          return;
        }
        clearTimeout(caretTimeoutId);
        focusText = $element.val();
        var pos = checkVal();
        caretTimeoutId = setTimeout(function() {
          if ($element.get(0) !== document.activeElement) {
            return;
          }
          writeBuffer();
          if (pos == mask.replace("?", "").length) {
            caret(0, pos);
          } else {
            caret(pos);
          }
        }, 10);
      }).on("blur", blurEvent).on("keydown", keydownEvent).on("keypress", keypressEvent);
      var evts = "paste";
      if (chrome && android) {
        $element.on('input', androidInputEvent);
      } else {
        evts = "input paste";
      }
      $element.on(evts, regularInputEvents);
    }
  };
}]).directive("oValidateon", ['$http', '$q', '$timeout', function oValidateonDirective($http, $q, $timeout) {
  return {
    restrict: "A",
    /** * @param {Attributes} *            $attrs */
    controller: function oValidateonCtrl($scope, $element, $attrs, $http) {
      var validated = resetValidatedToInit();
      $scope.validated = validated;
      var eventName = $attrs.oValidateon ? $attrs.oValidateon : "blur";
      var evts = [];
      var externalRegistered = {};
      var evtsParametrizedGlobal = {};
      var maxTimeDeferStateHold = 400; //time in ms to wait for defered validator state without set it to undefined
      var previousInputValues = {};
      /* is 'load' word present */
      this.validateOnload = eventName.split(" ").reduce(function(p, n) {
        var r = n.indexOf("load") > -1;
        if (!r) evts.push(n);
        return p || r;
      }, false);
      evtsParametrizedGlobal = parseEventsParams(evts); /* clear vars */
      delete eventName;
      delete evts;
      var validateDefered = $attrs.oDefer ? $attrs.oDefer : false;
      var clearEventName = $attrs.oReseton ? $attrs.oReseton : "focus";
      var stopOnFirst = $attrs.oNostop ? !($attrs.oNostop === true || $attrs.oNostop === 'true') : true;
      var intentFormAction = $attrs.action ? clearDynamoArtifacts($attrs.action) : false; /* * place to declare validators this.{name} declarative name of * validator = function {stackName} to get readable name on stack * trace main contract here is to return true on valid state or * false on invalid, also a promise can be returned wich in turn on * resolution must return bool or object with 'value' bool property */
      var _emailRegex = new RegExp('^[A-Z0-9\\._%\\+\\-]+@[A-Z0-9\\.\\-]+\\.(?:[A-Z]{2}|com|org|net|edu|gov|mil|biz|info|mobi|name|aero|asia|jobs|museum)$', 'i'); /* Taken from validation.js */
      var _passwordPattern = /^[a-zA-Z0-9!@#$%^&*]+$/;
      var _passwordAuthPattern = /^[a-zA-Z0-9!@#$%^&*]+$/;
      var _userNamePattern = /^[A-Za-z--\s-]+$/;
      var _phonePattern = /^\+\d[\d\-\(\)]{14}$/;
      var _textRegex = /^[\d\+\-\(\)\\\/\.,!&\sA-Za-z--]+$/;
      var _reviewRegex = /^[^\u0000-\u001F]+$/;
      var _startsDWRegex = /^[\dA-Za-z--]/;
      var registeredValidators = { /* * required non empty value */
        req: function oValidateRequired($el) {
          return $el.val().length > 0;
        },
        /* not equal to placeholder */
        noph: function oValidateAsPlaceHolder($el) {
          return $el.val() != $el.prop('placeholder');
        },
        /* not equal with static value */
        neq: function oValidateNotEqualTo($el, def) {
          if ($el.val().length == 0) return true;
          return $el.val() != def;
        },
        checked: function oValidateRequired($el) {
          return $el.is(":checked");
        },
        minlen: function oValidateRequired($el, len) {
          return $el.val().length >= len;
        },
        email: function oValidateEmail($el) {
          if ($el.val().length == 0) return true;
          return _emailRegex.test($el.val());
        },
        text: function oValidateText($el) {
          if ($el.val().length == 0) return true;
          return _textRegex.test($el.val());
        },
        trim: function oValidateTrim($el) {
          return ($el.val().trim(/\s/).length > 0);
        },
        review: function oValidateReview($el) {
          return (_reviewRegex.test($el.val()) && $el.val().trim(/\s/).length > 10);
        },
        startswithdw: function oValidateStartsWithDigitalOrAlpha($el) {
          if ($el.val().length == 0) return true;
          return _startsDWRegex.test($el.val());
        },
        phone: function oValidatePhone($el) {
          if ($el.val().length == 0) return true;
          return _phonePattern.test($el.val());
        },
        pass: function oValidatePass($el) {
          if ($el.val().length == 0) return true;
          return _passwordPattern.test($el.val());
        },
        /* special version of password (used on authentication page) */
        passauth: function oValidatePass($el) {
          if ($el.val().length == 0) return true;
          return _passwordAuthPattern.test($el.val());
        },
        username: function oValidateUsername($el) {
          if ($el.val().length == 0) return true;
          return _userNamePattern.test($el.val());
        },
        /* same as other input field */
        sameas: function oValidateSameAs($el, as) {
          if (as == null) {
            throw new TypeError(arguments.callee.toString() + ": required parameter is missing");
          }
          var sourceElement = null;
          if (as.indexOf("#") == 0) {
            sourceElement = $(as);
          } else {
            sourceElement = $el.prop('form');
            if (sourceElement != null) {
              sourceElement = sourceElement[as];
            } else {
              console.error(arguments.callee.toString() + ": can't find form for element '" + $el.prop('name') + "'");
            }
          }
          if (sourceElement != null) {
            return $el.val() == sourceElement.value;
          } else {
            console.error(arguments.callee.toString() + ": can't find element '" + as + "' to compare");
            return false;
          }
        },
        /* request a server validation */
        rest: function oValidateRest($el, url) {
          if (url == null) return false;
          url = url.indexOf('/rest/model') == 0 ? url : '/rest/model' + url;
          return $http.post(url, $element.serializeArray().reduce(function(p, n) {
            p[n.name] = n.value;
            return p;
          }, {})).then(function(result) {
            var reslt = {
              value: true
            };
            angular.extend(reslt, result.data);
            reslt.value = checkRestForErrors(reslt);
            return reslt;
          });
        }
      }

      function resetValidatedToInit() {
        return {
          $all: void(0),
          $restResult: {},
          $systemError: null,
          $pristine: true,
          $lastInvalid: null,
          $lastValidated: null,
          $submitted: false
        };
      }

      function resetValidatorToInit() {
        return {
          $all: void(0),
          $reseted: false,
          $pristine: true
        };
      }

      function checkRestForErrors(reslt) {
        var errorPresent = false;
        for (var i in reslt) {
          switch (i) {
            case "errors":
            case "formExceptions":
              errorPresent = true;
              break;
            case "success":
              errorPresent = (reslt[i] == false || reslt[i] == "false");
              break;
            case "result":
              errorPresent = (reslt[i] == "errors" || reslt[i] == "error");
              break;
            default:
              break;
          }
        }
        return !errorPresent;
      } /* make events list */
      function parseEventsParams(evts) {
        if (angular.isString(evts)) {
          evts = evts.split(" ");
        }
        var output = {
          notimeout: []
        };
        evts.forEach(function(el, ind, arr) {
          var params = el.split(":");
          if (params.length > 1) {
            var timeout = parseInt(params[1]);
            if (timeout > 0) {
              if (output[timeout] == null) {
                output[timeout] = [params[0]];
              } else {
                output[timeout].push(params[0]);
              }
            } else {
              output.notimeout.push(params[0]);
            }
          } else {
            output.notimeout.push(params[0]);
          }
        });
        return output;
      } /* clear DARG from action */
      function clearDynamoArtifacts(uri) {
        var url = uri.split("?");
        var params = [];
        if (url.length > 1) {
          var preparams = url[1].split("&");
          url = url[0];
          params = preparams.reduce(function(p, n) {
            var param = n.split("=");
            if (param[0] != "_DARGS") {
              p.push(param[0] + "=" + param[1]);
            }
            return p;
          }, params)
        }
        if (params.length > 0) {
          url += "?" + params.join("&");
        }
        return url;
      }

      function oClearEventHandler(e) {
        oValidatorResetValidation(e.target.name);
        $scope.$apply();
      }

      function oValidatorResetValidation(elName) {
        if (validated[elName] != null) {
          validated[elName].$reseted = true;
        }
      }

      function setSystemErrorStatus(message) {
        if (message == null) {
          message = ' ,   ! ,   .';
        }
        validated.$systemError = message;
      }

      function clearRestErrorStatus() {
        validated.$systemError = null;
        validated.$restResult = {};
        return true;
      }
      this.clearRestErrorStatus = $scope.clearRestErrorStatus = clearRestErrorStatus;

      function setValidationAs(name, vldName, state) {
        if (validated[name] != null) {
          if (vldName == '$all') {
            resetValidators(validated[name], !!state);
            return true;
          } else if (validated[name][vldName] != null) {
            if (validated[name][vldName].fn != null) {
              validated[name][vldName].value = !!state;
              recalcOverallValidationStatus();
              return true;
            }
            return false;
          } else {
            validated[name].$all = !!vldName;
            if (!validated[name].$all) {
              validated.$all = false;
            };
            return true;
          }
        }
        return false;
      }
      this.setValidationAs = $scope.setValidationAs = setValidationAs;
      this.doRest = function oValidatorDoRest(url, e) {
        e.preventDefault();
        clearRestErrorStatus();
        oValidatorValidateAll(false);
        validated.$submitted = true;
        if (validated.$all) {
          $http.post(url, $element.serializeArray().reduce(function(p, n) {
            p[n.name] = n.value;
            return p;
          }, {})).then(function(result) {
            if (result.data.redirectURL) {
              document.location.href = result.data.redirectURL;
            }
            var noErrors = checkRestForErrors(result.data);
            validated.$restResult = angular.extend({}, result.data);
            if (intentFormAction && noErrors) document.location.href = intentFormAction;
          }).catch(function(result) {
            if (result.status == 409) {
              setSystemErrorStatus('   ');
              setTimeout(function() {
                if ($attrs.oIfexpire != null && $attrs.oIfexpire.length > 0) {
                  location.href = $attrs.oIfexpire;
                } else {
                  location.reload();
                }
              }, 3000);
            } else {
              setSystemErrorStatus();
            }
          });
        } else {
          validated.$pristine = false;
          for (var vld in validated) {
            if (vld[0] != "$") {
              validated[vld].$pristine = false;
            }
          }
        }
        $scope.$apply();
      }

      function resetValidators(validators, val, norecalc) {
        for (var vld in validators) {
          if (vld[0] != "$" && !validators[vld].$isDefered) {
            validators[vld].value = val;
          }
        }
        if (!norecalc) {
          recalcOverallValidationStatus();
        }
      }

      function fullValidationReset() {
        angular.extend(validated, resetValidatedToInit());
        previousInputValues = {};
        for (var vld in validated) {
          if (vld[0] != "$") {
            var validators = validated[vld];
            angular.extend(validators, resetValidatorToInit());
            resetValidators(validators, void(0), true);
          }
        }
      }

      function recalcOverallValidationStatus() {
        var falsePresent = false;
        var voidPresent = false;
        validated.$lastInvalid = "";
        for (var vld in validated) {
          if (vld[0] != "$") {
            recalcOverallValidatorStatus(validated[vld]);
            if (validated[vld].$doSkip && validated[vld].$doSkip() && "false" != validated[vld].$doSkip()) {
              validated[vld].$all = void(0);
              continue;
            }
            if (typeof(validated[vld].$all) == 'undefined') {
              voidPresent = true;
            } else if (!validated[vld].$all) {
              falsePresent = true;
              if (validated.$lastValidated == vld) {
                validated.$lastInvalid = validated.$lastValidated;
              }
            }
          }
        }
        validated.$all = falsePresent ? false : voidPresent ? void(0) : true;
      }

      function recalcOverallValidatorStatus(validators) {
        var falsePresent = false;
        var voidPresent = false;
        validators.$all = true;
        for (var vld in validators) {
          if (vld[0] != "$") {
            if (typeof(validators[vld].value) == 'undefined') {
              voidPresent = true;
            } else if (validators[vld].value === false) {
              falsePresent = true;
            }
          }
        }
        validators.$all = falsePresent ? false : voidPresent ? void(0) : true;
      }

      function oValidatorValidateAll(doDeffered, fromBroadCast) {
        validated.$lastValidated = "$all";
        for (var vld in validated) {
          if (vld[0] != "$") {
            var $el = $element.find('[name="' + vld + '"]');
            if ($el.length > 0) {
              if (fromBroadCast) { /* * Only used if called from * broadcast event */
                validated[vld].$reseted = false;
                checkPreviousInput($el);
              }
              oValidatorValidateElement($el, validated[vld], doDeffered);
            }
          }
        }
        recalcOverallValidationStatus();
      }
      this.validateAll = oValidatorValidateAll; /* works in conjuction with the deferID variable */
      function oOneTimeDeferFactory(timeout, func) {
        var deferID = null;
        return function() {
          if (deferID != null) {
            clearTimeout(deferID);
            deferID = null;
          }
          deferID = setTimeout(function() {
            func();
            deferID = null;
          }, timeout);
        }
      }

      function checkPreviousInput($el) {
        var elName = $el.prop('name');
        var elVal = $el.val();
        if (['checkbox'].indexOf($el.prop('type')) < 0) {
          if (previousInputValues[elName] == null) {
            if ($el.prop('defaultValue') == elVal) {
              return true;
            }
          } else {
            if (previousInputValues[elName] == elVal) {
              return true;
            }
          }
        }
        if (validated[elName] != null) {
          validated[elName].$pristine = false;
          validated.$pristine = false;
          validated.$submitted = false;
          clearRestErrorStatus();
        }
        return false;
      }

      function oValidatorEventHandler($el, validators) {
        var elName = $el.prop('name');
        var elVal = $el.val();
        validators.$reseted = false;
        validated.$lastValidated = elName;
        if (checkPreviousInput($el)) return true;
        oValidatorValidateElement($el, validators, true);
        $scope.$apply(recalcOverallValidationStatus);
      }

      function oValidatorValidateElement($el, validators, doDeffered) {
        var elName = $el.prop('name');
        var elVal = $el.val();
        var digestTimeout = null;
        previousInputValues[elName] = elVal;
        resetValidators(validators, void(0), true);
        for (var vld in validators) {
          if (vld[0] != "$" && validators[vld].fn != null) {
            var reslt = validators[vld].fn();
            if (reslt.then != null && angular.isFunction(reslt.then)) {
              validators[vld].$isDefered = true;
              if (doDeffered) {
                digestTimeout = $timeout(function() {
                  validators[vld].value = void(0);
                }, maxTimeDeferStateHold);
                reslt.then(function(vld_name, val) {
                  $timeout.cancel(digestTimeout);
                  if (typeof(val) === 'boolean') {
                    validators[vld_name].value = val;
                  } else if (angular.isObject(val)) {
                    angular.extend(validators[vld_name], val);
                  } else {
                    validators[vld].value = void(0);
                    throw new TypeError('validator ' + vld_name + ' promise resolved with incompatible type ' + typeof(val));
                  }
                  recalcOverallValidationStatus();
                }.bind(this, vld)).catch(function(e) {
                  setSystemErrorStatus();
                });
              } else {

                validators[vld].value = true;
              }
            } else {
              validators[vld].value = reslt;
              if (stopOnFirst && !validators[vld].value) {
                break;
              }
            }
          }
        }
      }
      this.registerValidator = function oRegisterValidator(el, validatorName, clb) {
        var $el = null;
        if (angular.isObject(el) && ($el = $(el)).prop('name') != null) {
          el = $el.prop('name');
        }
        if (!angular.isString(el)) {
          return null;
        }
        externalRegistered[el + "_" + validatorName] = clb;
      }
      this.addElement = function oValidatorAddElement($el, $subattrs, elValidators) {
        var validators = resetValidatorToInit();
        var onEvents = null;
        elValidators.forEach(function(val) {
          var validatorName = val.split(":");
          var validatorFn = externalRegistered[$el.prop('name') + "_" + validatorName[0]];
          if (validatorFn = validatorFn ? validatorFn : registeredValidators[validatorName[0]]) {
            validators[validatorName[0]] = {
              value: void(0)
            };
            if (validatorName.length > 1) {
              validators[validatorName[0]].fn = validatorFn.bind($el.get(0), $el, validatorName[1]);
            } else {
              validators[validatorName[0]].fn = validatorFn.bind($el.get(0), $el);
            }
          }
        });
        validators.$doSkip = function() {
          return $subattrs.oSkip;
        }
        $subattrs.$observe('oSkip', recalcOverallValidationStatus);
        $scope.validated[$el.prop('name')] = validators;
        if ($subattrs.oOn == null) {
          onEvents = evtsParametrizedGlobal;
        } else {
          onEvents = parseEventsParams($subattrs.oOn);
        }
        for (var timeout in onEvents) {
          if (timeout == 'notimeout') {
            if (validateDefered && validateDefered.length > 0) {
              $el.on(onEvents.notimeout.join(" "), oOneTimeDeferFactory(parseInt(validateDefered), oValidatorEventHandler.bind(this, $el, validators)));
            } else {
              $el.on(onEvents.notimeout.join(" "), oValidatorEventHandler.bind(this, $el, validators));
            }
          } else {
            $el.on(onEvents[timeout].join(" "), oOneTimeDeferFactory(timeout, oValidatorEventHandler.bind(this, $el, validators)));
          }
        }
        if (clearEventName) {
          $el.on(clearEventName, oClearEventHandler);
        }
      }
      $scope.$on('validate.$all', oValidatorValidateAll.bind(this, true, true));
      $scope.$on('validate.$all.nochange', oValidatorValidateAll.bind(this, true, false));
      $scope.$on('validate.$fullReset', fullValidationReset);
    },
    scope: true,
    compile: function oValidateonCompile() {
      return {
        pre: function oValidateonPreLink($scope, $element, $attrs, ctrls) {},
        post: function oValidateonPostLink($scope, $element, $attrs, ctrls) {
          if ($attrs.oRest) {
            $element.on('submit', ctrls.doRest.bind(ctrls, $attrs.oRest.indexOf('/rest/model') == 0 ? $attrs.oRest : '/rest/model' + $attrs.oRest));
          }
          if (ctrls.validateOnload) {
            ctrls.validateAll(true);
          }
        }
      };
    }
  };
}]).directive("oValidate", function oValidateDirective() {
  return {
    restrict: "A",
    priority: 3,
    require: "^^oValidateon",
    compile: function oValidateCompile() {
      return {
        pre: function oValidatePreLink($scope, $element, $attrs, validator) {},
        post: function oValidatePostLink($scope, $element, $attrs, validator) {
          if ($attrs.name != null && $attrs.name.indexOf('_D:') < 0 && $attrs.oValidate != null) {
            var validators = $attrs.oValidate.split(" ");
            if (validators.length > 0) {
              validator.addElement($element, $attrs, validators);
            }
          }
        }
      };
    }
  };
});
