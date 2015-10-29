angular.module("OUtils",[])
	.value("isMobile",function(){
		var check = false;
		(function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))check = true})(navigator.userAgent||navigator.vendor||window.opera);
		return check;
	})
	.directive("oTap",["$parse","isMobile",function($parse,isMobile){
		var lastTapped=null;
		window.addEventListener("popstate", function(e){
			$('.o-tap').removeClass("o-tap");
		});
		return {
		    restrict:"A",
		    link:function link(scope,element,attribs){
		    	  var condiFun=$parse(attribs.mwsTap);
		    	  var firstTarget=null;
		    	  element.on('touchend',function(e){
		    		  if (!element.hasClass('o-tap')) {
		    			  if (lastTapped!=null){
		    				  lastTapped.removeClass('o-tap');
		    			  }
		    			  if (location.hash!="#otap"){
		    				  history.pushState(null,null,"#otap");
		    			  }
			        	element.addClass('o-tap');
			        	lastTapped=element;
			        	firstTarget=e.target;
		    		  }else{
		    			  if (e.target==firstTarget||e.target==element.get(0)){
		    				  element.removeClass('o-tap');
		    				  firstTarget=null;
		    			  }
		    		  }
		    	  });
		    	  element.on('click',function(e){
			    	  if (isMobile() && element.prop('tagName').toUpperCase()=="A" && condiFun(window) && element.hasClass('o-tap')){
		    				e.preventDefault();
			    	  }
		    	  });

		    	  element.on('mouseenter',function(e){
		    		  element.addClass('o-tap');
		    	  });
		    	  element.on('mouseleave',function(e){
		    		  element.removeClass('o-tap');
		    	  });
		    }
		  };
		}])
.directive("oMasked",[function(){
	var ua = navigator.userAgent,
	iPhone = /iphone/i.test(ua),
	chrome = /chrome/i.test(ua),
	android = /android/i.test(ua)

	var defaults={
			// Predefined character definitions
			definitions: {
				'9': "[0-9]",
				'a': "[A-Za-z]",
				'*': "[A-Za-z0-9]"
			},
			placeholder: '_'
		};

  return {
	priority: 0,
    restrict: 'A',
    scope: false,
    require: '?^oValidateon',
    link: function oMaskedPostLink($scope, $element, $attrs, oValidateOn) {
    	var caretTimeoutId=null;
    	var validatorState=null;

    	var tests,
		partialPosition,
		firstNonMaskPos,
        lastRequiredNonMaskPos,
        len,
        oldVal;
    	var mask=$attrs.oMasked;

    	var focusText=null;

    	var settings = {
                autoclear: !$attrs.oMaskedNoclear,
                placeholder: defaults.placeholder
            };
    	tests = [];
    	partialPosition = len = mask.length;
    	firstNonMaskPos = null;
    	mask.split("").forEach(function(c,i) {
                "?" == c ?
                		(len--, partialPosition = i)
                		: defaults.definitions[c] ?
                				(
                						tests.push(new RegExp(defaults.definitions[c])),
                						null === firstNonMaskPos &&
                							(firstNonMaskPos = tests.length - 1),
                						partialPosition > i &&
                							(lastRequiredNonMaskPos = tests.length - 1)
                				)
                				: tests.push(null);
            });
    	buffer = mask.split("").map(function(c, i) {
                    return "?" != c ?
                    		defaults.definitions[c] ?
                    				getPlaceholder(i)
                    				: c
                    		: void 0;
                });
    	defaultBuffer = buffer.join("");
    	focusText = $element.val();

    	function caret(begin, end) {
            var range;
            var rawElement=$element.get(0);
            if ($element.attr("hidden")==null)
            	return "number" == typeof begin ? (
            			end = "number" == typeof end ? end : begin,
            			rawElement.setSelectionRange ? rawElement.setSelectionRange(begin, end) : rawElement.createTextRange && (
            					range = rawElement.createTextRange(),
            					range.collapse(!0),
            					range.moveEnd("character", end),
            					range.moveStart("character", begin),
            					range.select())
            	) : (
            			rawElement.setSelectionRange ? (
            					begin = rawElement.selectionStart,
            					end = rawElement.selectionEnd
            					) :
            						document.selection && document.selection.createRange && (
            								range = document.selection.createRange(),
            								begin = 0 - range.duplicate().moveStart("character", -1e5),
            								end = begin + range.text.length
            								),
            {
                begin: begin,
                end: end
            }
            );
        }
    	function tryFireCompleted(apply) {
            if (validatorState) {
                for (var i = firstNonMaskPos; lastRequiredNonMaskPos >= i; i++) if (tests[i] && buffer[i] === getPlaceholder(i)) {
                	validatorState.setState(false);
                	apply && $scope.$apply();
                	return;
                }
                validatorState.setState(true);
                apply && $scope.$apply();
            }
        }
        function getPlaceholder(i) {
            return settings.placeholder.charAt(i < settings.placeholder.length ? i : 0);
        }
        function seekNext(pos) {
            for (;++pos < len && !tests[pos]; ) ;
            return pos;
        }
        function seekPrev(pos) {
            for (;--pos >= 0 && !tests[pos]; ) ;
            return pos;
        }
        function shiftL(begin, end) {
            var i, j;
            if (!(0 > begin)) {
                for (i = begin, j = seekNext(end); len > i; i++) if (tests[i]) {
                    if (!(len > j && tests[i].test(buffer[j]))) break;
                    buffer[i] = buffer[j], buffer[j] = getPlaceholder(j), j = seekNext(j);
                }
                writeBuffer(), caret(Math.max(firstNonMaskPos, begin));
            }
        }
        function shiftR(pos) {
            var i, c, j, t;
            for (i = pos, c = getPlaceholder(pos); len > i; i++) if (tests[i]) {
                if (j = seekNext(i), t = buffer[i], buffer[i] = c, !(len > j && tests[j].test(t))) break;
                c = t;
            }
        }
        function androidInputEvent() {
            var curVal = $element.val(), pos = caret();
            if (oldVal && oldVal.length && oldVal.length > curVal.length) {
                for (checkVal(!0); pos.begin > 0 && !tests[pos.begin - 1]; ) pos.begin--;
                if (0 === pos.begin) for (;pos.begin < firstNonMaskPos && !tests[pos.begin]; ) pos.begin++;
                caret(pos.begin, pos.begin);
            } else {
                for (checkVal(!0); pos.begin < len && !tests[pos.begin]; ) pos.begin++;
                caret(pos.begin, pos.begin);
            }
           tryFireCompleted(true);
        }
        function blurEvent() {
            checkVal(), $element.val() != focusText && $element.change();
        }
        function keydownEvent(e) {
            if (!$element.prop("readonly")) {
                var pos, begin, end, k = e.which || e.keyCode;
                oldVal = $element.val(), 8 === k || 46 === k || iPhone && 127 === k ?
                		(
                				pos = caret(),begin = pos.begin, end = pos.end,
                				end - begin === 0 && (
                						begin = 46 !== k ?
                								seekPrev(begin)
                								: end = seekNext(begin - 1),
                						end = 46 === k ?
                								seekNext(end)
                								: end
                						),
                				clearBuffer(begin, end),
                				shiftL(begin, end - 1),
                				e.preventDefault(),
                				(validatorState && validatorState.setState(false) && $scope.$apply())
                		)
                		: 13 === k ?
                				blurEvent.call(this, e)
                				: 27 === k && (
                						$element.val(focusText),
                						caret(0, checkVal()),
                						e.preventDefault()
                						);
            }
        }
        function keypressEvent(e) {
            if (!$element.prop("readonly")) {
                var p, c, next, k = e.which || e.keyCode, pos = caret();
                if (!(e.ctrlKey || e.altKey || e.metaKey || 32 > k) && k && 13 !== k) {
                    if (pos.end - pos.begin !== 0 && (clearBuffer(pos.begin, pos.end), shiftL(pos.begin, pos.end - 1)),
                    p = seekNext(pos.begin - 1), len > p && (c = String.fromCharCode(k), tests[p].test(c))) {
                        if (shiftR(p), buffer[p] = c, writeBuffer(), next = seekNext(p), android) {
                            setTimeout(caret.bind($element,next), 0);
                        } else caret(next);
                        pos.begin <= lastRequiredNonMaskPos && (validatorState && validatorState.setChanged()) && tryFireCompleted(true);
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
            var i, c, pos, test = $element.val(), lastMatch = -1;
            for (i = 0, pos = 0; len > i; i++) {
	            if (tests[i]) {
	                for (buffer[i] = getPlaceholder(i); pos++ < test.length; ) {
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
	            } else
	            	{
	            	buffer[i] === test.charAt(pos) && pos++, partialPosition > i && (lastMatch = i);
	            	}
            }
            return allow ?
            		writeBuffer()
            		: partialPosition > lastMatch + 1 ?
            				settings.autoclear || buffer.join("") === defaultBuffer ?
            						($element.val() && $element.val(""),clearBuffer(0, len))
            						: writeBuffer()
            				: (writeBuffer(), $element.val($element.val().substring(0, lastMatch + 1))),
            				partialPosition ?
            						i
            						: firstNonMaskPos;
        }

        function regularInputEvents() {
            if ($element.prop("readonly")){
                return;
            }
			setTimeout(function() {
				var pos=checkVal(true);
				caret(pos);
                tryFireCompleted(true);
			}, 0);
		}
        if (oValidateOn){
        	validatorState=oValidateOn.registerValidator($element.prop('name'),'oMasked');
        }

    	/* init */
    	checkVal();
    	tryFireCompleted();
    	/* ** */
    	if ($attrs.ngModel){
    		$scope.$watch($attrs.ngModel,function(newVal,oldVal){
    				regularInputEvents();
    		})
    	}
    	$element
		.on("focus", function() {
            if ($element.prop("readonly")){
                return;
            }
			clearTimeout(caretTimeoutId);
			focusText=$element.val();
			var pos = checkVal();

			caretTimeoutId = setTimeout(function(){
                if($element.get(0) !== document.activeElement){
                    return;
                }
				writeBuffer();
				if (pos == mask.replace("?","").length) {
					caret(0, pos);
				} else {
					caret(pos);
				}
			}, 10);
		})
		.on("blur", blurEvent)
		.on("keydown", keydownEvent)
		.on("keypress", keypressEvent);
    	var evts="paste";
        if (chrome && android)
        {
            $element.on('input', androidInputEvent);
        }else{
        	evts="input paste";
        }
        $element.on(evts,regularInputEvents );
    }
  };
}])
.directive("oValidateon",['$http','$q','$timeout',function($http,$q,$timeout){

	return {
		restrict:"A",
		/**
		 * @param {Attributes}
		 *            $attrs
		 */
		controller:function oValidatorCtrl($scope,$element,$attrs,$http){
			var validated=resetValidatedToInit();
			$scope.validated=validated;
			var eventName=$attrs.oValidateon?$attrs.oValidateon:"blur";
			var evts=[];
			var externalRegistered={};
			var evtsParametrizedGlobal={};
			var previousInputValues={};
			clearSystemErrorStatus();
			/* is 'load' word present */

			this.validateOnload=eventName.split(" ").reduce(function(p,n){var r=n.indexOf("load")>-1;if (!r) evts.push(n);return p || r;},false);
			evtsParametrizedGlobal=parseEventsParams(evts);
			/* clear vars */
			delete eventName;
			delete evts;

			var validateDefered=$attrs.oDefer?$attrs.oDefer:false;

			var clearEventName=$attrs.oReseton?$attrs.oReseton:"focus";
			var stopOnFirst=$attrs.oNostop?!($attrs.oNostop===true||$attrs.oNostop==='true'):true;
			var intentFormAction=$attrs.action?clearDynamoArtifacts($attrs.action):false;


			/*
			 * place to declare validators this.{name} declarative name of
			 * validator = function {stackName} to get readable name on stack
			 * trace main contract here is to return true on valid state or
			 * false on invalid, also a promise can be returned wich in turn on
			 * resolution must return bool or object with 'value' bool property
			 */
			var _emailRegex=new RegExp('^[A-Z0-9\\._%\\+\\-]+@[A-Z0-9\\.\\-]+\\.(?:[A-Z]{2}|com|org|net|edu|gov|mil|biz|info|mobi|name|aero|asia|jobs|museum)$','i');
			/* Taken from validation.js */
			var _passwordPattern = /^[a-zA-Z0-9!@#$%^&*]{6,}$/;
			var _passwordAuthPattern = /^[a-zA-Z0-9!@#$%^&*]+$/;
			var _userNamePattern = /^[A-Za-zА-ЯЁа-яё\s-]+$/;
			var _phonePattern = /^\+\d[\d\-\(\)]{14}$/;
			var _textRegex = /^[\d\+\-\(\)\\\/\.,!&\sA-Za-zА-ЯЁа-яё]+$/;
			var _startsDWRegex = /^[\dA-Za-zА-ЯЁа-яё]/;
			var registeredValidators={
				/*
				 * required non empty value
				 */

				req:function oValidateRequired($el){
					return $el.val().length>0;
				},
					/* not equal to placeholder */
				noph:function oValidateAsPlaceHolder($el){
					return $el.val()!=$el.prop('placeholder');
				},
					/* not equal with static value */
				neq:function oValidateNotEqualTo($el,def){
					if ($el.val().length==0) return true;
					return $el.val()!=def;
				},
				checked:function oValidateRequired($el){
					return $el.is(":checked");
				},
				minlen:function oValidateRequired($el,len){
					return $el.val().length>=len;
				},
				email:function oValidateEmail($el){
					if ($el.val().length==0) return true;
					return _emailRegex.test($el.val());
				},
				text:function oValidateText($el){
					if ($el.val().length==0) return true;
					return _textRegex.test($el.val());
				},
				startswithdw: function oValidateStartsWithDigitalOrAlpha($el){
					if ($el.val().length==0) return true;
					return _startsDWRegex.test($el.val());
				},
				phone:function oValidatePhone($el){
					if ($el.val().length==0) return true;
					return _phonePattern.test($el.val());
				},
				pass:function oValidatePass($el){
					if ($el.val().length==0) return true;
					return _passwordPattern.test($el.val());
				},
					/* special version of password (used on authentication page) */
				passauth:function oValidatePass($el){
					if ($el.val().length==0) return true;
					return _passwordAuthPattern.test($el.val());
				},
				username:function oValidateUsername($el){
					if ($el.val().length==0) return true;
					return _userNamePattern.test($el.val());
				},
					/* same as other input field */
					/* request a server validation */
				rest: function oValidateRest($el,url){
					if (url==null) return false;
					url=url.indexOf('/rest/model')==0?url:'/rest/model'+url;
					return $http.post(url,$element.serializeArray().reduce(function(p,n){p[n.name]=n.value;return p;},{})).then(function(result){
						var reslt={value:true};
						angular.extend(reslt,result.data);
						reslt.value=checkRestForErrors(reslt);
						return reslt;
					});
				}
			}

			function resetValidatedToInit(){
				return {$all:void(0),$restResult:{},$pristine:true,$lastInvalid:null,$lastValidated:null,$submitted:false};
			}
			function resetValidatorToInit(){
				return {$all:void(0),$reseted:false,$pristine:true};
			}

			function checkRestForErrors(reslt){
				var errorPresent=false;
				for(var i in reslt){
					switch(i){
						case "errors":
						case "formExceptions":
							errorPresent=true;
							break;
						case "success":
							errorPresent=(reslt[i]==false || reslt[i]=="false");
							break;
						case "result":
							errorPresent=(reslt[i]=="errors"||reslt[i]=="error");
							break;
						default:
							break;
					}
				}
				return !errorPresent;
			}




			/* make events list */
			function parseEventsParams(evts){
				if (angular.isString(evts)){
					evts=evts.split(" ");
				}
				var output={notimeout:[]};
				evts.forEach(function(el,ind,arr){
					var params=el.split(":");
					if (params.length>1){
						var timeout=parseInt(params[1]);
						if (timeout>0){
							if (output[timeout]==null){
								output[timeout]=[params[0]];
							}else{
								output[timeout].push(params[0]);
							}
						}else{
							output.notimeout.push(params[0]);
						}
					}else{
						output.notimeout.push(params[0]);
					}
				});
				return output;
			}
			/* clear DARG from action */
			function clearDynamoArtifacts(uri){
				var url=uri.split("?");
				var params=[];
				if (url.length>1){
					var preparams=url[1].split("&");
					url=url[0];
					params=preparams.reduce(function(p,n){
						var param=n.split("=");
						if (param[0]!="_DARGS"){
							p.push(param[0]+"="+param[1]);
						}
						return p;
					},params)
				}
				if (params.length>0){
					url+="?"+params.join("&");
				}
				return url;
			}

			function oClearEventHandler(e){
				oValidatorResetValidation(e.target.name);
				$scope.$apply();
			}

			function oValidatorResetValidation(elName){
				if (validated[elName]!=null){
					validated[elName].$reseted=true;
				}
			}
			function setSystemErrorStatus(message){
				if (message==null){
					message='К сожалению, возникла непредвиденная ситуация! Пожалуйста, повторите попытку позже.';
				}
				validated.$systemError=message;
			}

			function clearSystemErrorStatus(){
				validated.$systemError=null;
			}
			function setValidationAs(name,vldName,state){
				if (validated[name]!=null){
					if (vldName=='$all'){
						resetValidators(validated[name],!!state);
						return true;
					}else if(validated[name][vldName]!=null){
						if (validated[name][vldName].fn!=null){
							validated[name][vldName].value=!!state;
							recalcOverallValidationStatus();
							return true;
						}
						return false;
					}else{
						validated[name].$all=!!vldName;
						if (!validated[name].$all){
							validated.$all=false;
						};
						return true;
					}
				}
				return false;
			}
			this.setValidationAs=$scope.setValidationAs=setValidationAs;
			this.doRest=function oValidatorDoRest(url,e){
				e.preventDefault();
				validated.$restResult={};
				clearSystemErrorStatus();
				oValidatorValidateAll(false);
				validated.$submitted=true;
				if (validated.$all){
					$http.post(url,$element.serializeArray().reduce(function(p,n){p[n.name]=n.value;return p;},{})).then(function(result){

						if (result.data.redirectURL){
							document.location.href=result.data.redirectURL;
						}

						var noErrors=checkRestForErrors(result.data);
						validated.$restResult=angular.extend({},result.data);
						if (intentFormAction && noErrors) document.location.href=intentFormAction;
					}).catch(function(e){
						setSystemErrorStatus();
					});
				}else{
					validated.$pristine=false;
					for (var vld in validated){
						if (vld[0]!="$") {
							validated[vld].$pristine=false;
						}
					}
				}
				$scope.$apply();
			}
			function resetValidators(validators,val,norecalc){
				for (var vld in validators){
					if (vld[0]!="$" && !externalRegistered[vld]) {
						validators[vld].value=val;
					}
				}

				if (!norecalc){
					recalcOverallValidationStatus();
				}
			}
			function fullValidationReset(){
				validated=resetValidatedToInit();
				previousInputValues={};
				for (vld in validated){
					if (vld[0]!="$") {
						var validators=validated[vld];
						angular.extend(validators,resetValidatorToInit());
						resetValidators(validators,void(0),true);
					}
				}
			}
			function recalcOverallValidationStatus(){
				var falsePresent=false;
				var voidPresent=false;
				validated.$lastInvalid="";

				for (var vld in validated){

					if (vld[0]!="$") {
						recalcOverallValidatorStatus(validated[vld]);
						if (typeof(validated[vld].$all)=='undefined'){
							voidPresent=true;
						}else if(!validated[vld].$all){
							falsePresent=true;
							if (validated.$lastValidated==vld){
								validated.$lastInvalid=validated.$lastValidated;
							}
						}
					}
				}
				validated.$all=falsePresent?false:voidPresent?void(0):true;
			}

			function recalcOverallValidatorStatus(validators){
				var falsePresent=false;
				var voidPresent=false;
				validators.$all=true;
				for (var vld in validators){
					if (vld[0]!="$") {
						if (typeof(validators[vld].value)=='undefined') {
							voidPresent=true;
						}
						else if(validators[vld].value===false){
							falsePresent=true;
						}
					}
				}
				validators.$all=falsePresent?false:voidPresent?void(0):true;
			}

			function oValidatorValidateAll(doDeffered,fromBroadCast){
				validated.$lastValidated="$all";
				for (var vld in validated){
					if (vld[0]!="$") {
						var $el=$element.find('[name="'+vld+'"]');
						if($el.length>0){
							if (fromBroadCast){ /*
									     * Only used if called from
									     * broadcast event
									     */
								validated[vld].$reseted=false;
								checkPreviousInput($el);
							}
							oValidatorValidateElement($el,validated[vld],doDeffered);
						}
					}
				}
			}
			this.validateAll=oValidatorValidateAll;
			/* works in conjuction with the deferID variable */
			function oOneTimeDeferFactory(timeout,func){
				var deferID=null;
				return function(){
					if (deferID!=null){
						clearTimeout(deferID);
						deferID=null;
					}
					deferID=setTimeout(function(){func();deferID=null;}, timeout);
				}
			}
			function checkPreviousInput($el){
				var elName=$el.prop('name');
				var elVal=$el.val();
				if (['checkbox'].indexOf($el.prop('type'))<0){
					if (previousInputValues[elName]==null){
						if ($el.prop('defaultValue')==elVal){
							return true;
						}
					}
					else {
						if (previousInputValues[elName]==elVal){
							return true;
						}
					}
				}

				if (validated[elName]!=null) {
					validated[elName].$pristine=false;
					validated.$pristine=false;
					validated.$submitted=false;
					clearSystemErrorStatus();
				}
				return false;
			}

			function oValidatorEventHandler($el,validators){
				var elName=$el.prop('name');
				var elVal=$el.val();
				validators.$reseted=false;
				validated.$lastValidated=elName;
				if (checkPreviousInput($el)) return true;
				oValidatorValidateElement($el,validators,true);
				$scope.$apply();
			}

			function oValidatorValidateElement($el,validators,doDeffered){
				var elName=$el.prop('name');
				var elVal=$el.val();
				previousInputValues[elName]=elVal;
				resetValidators(validators,void(0),true);
				for (var vld in validators){
					if (vld[0]!="$" && validators[vld].fn!=null) {
						var reslt = validators[vld].fn();
						if (reslt.then!=null && angular.isFunction(reslt.then)) {
							if (doDeffered){
								validators[vld].value = void(0);
								reslt.then(function(vld_name,val) {
									if (typeof(val)==='boolean'){
										validators[vld_name].value=val;
									}else if (angular.isObject(val)){
										angular.extend(validators[vld_name],val);
									}else{
										throw new TypeError('validator '+vld_name+' promise resolved with incompatible type '+typeof(val));
									}

									recalcOverallValidationStatus();
								}.bind(this,vld)
								).catch(function(e){
									setSystemErrorStatus();
								});
							}else{//Считаем что валидатор валиден, doRest иначе не пройдет
								validators[vld].value=true;
							}
						} else {
							validators[vld].value = reslt;
							if (stopOnFirst && !validators[vld].value){
								break;
							}
						}

					}
				}

				recalcOverallValidationStatus();
			}
			this.registerValidator=function oRegisterValidator(el,validatorName,clbValidator){
				//clbValidator for future
				var $el=null;
				if (angular.isObject(el) && ($el=$(el)).prop('name')!=null){
					el=$el.prop('name');
				}
				if(!angular.isString(el)){
					return null;
				}
				if (validated[el]==null){
					validated[el]=resetValidatorToInit();
				}
				validated[el][validatorName]={value:(this.validateOnload?true:void(0))};
				externalRegistered[validatorName]=true;
				return {
					setState:function(state){
						validated[el][validatorName].value=state;
						recalcOverallValidationStatus();
						return true;
					},
					setChanged:function(){
						validated[el].$reseted=false;
						validated[el].$pristine=false;
						validated.$submitted=false;
						validated.$pristine=false;
						clearSystemErrorStatus();
						return true;
					},
					setReseted:function(){
						validated[el].$reseted=true;
						return true;
					}
				};
			}
			this.addElement=function oValidatorAddElement($el,elValidators,onEvents){
				var validators=resetValidatorToInit();
				elValidators.forEach(function(val){
					var validatorName=val.split(":");
					if (registeredValidators[validatorName[0]]!=null){
						validators[validatorName[0]]={value:void(0)};
						if (validatorName.length>1){
							validators[validatorName[0]].fn=registeredValidators[validatorName[0]].bind($el.get(0),$el,validatorName[1]);
						}else{
							validators[validatorName[0]].fn=registeredValidators[validatorName[0]].bind($el.get(0),$el);
						}
					}
				});
				$scope.validated[$el.prop('name')]=validators;
				if (onEvents==null){
					onEvents=evtsParametrizedGlobal;

				}else{
					onEvents=parseEventsParams(onEvents);
				}
				for(var timeout in onEvents){
					if (timeout=='notimeout'){
						if (validateDefered && validateDefered.length>0){
							$el.on(onEvents.notimeout.join(" "),oOneTimeDeferFactory(parseInt(validateDefered),oValidatorEventHandler.bind(this,$el,validators)));
						}else{
							$el.on(onEvents.notimeout.join(" "),oValidatorEventHandler.bind(this,$el,validators));
						}

					}else{
						$el.on(onEvents[timeout].join(" "),oOneTimeDeferFactory(timeout,oValidatorEventHandler.bind(this,$el,validators)));
					}
				}

				if (clearEventName){
					$el.on(clearEventName,oClearEventHandler);
				}

			}
			$scope.$on('validate.$all',oValidatorValidateAll.bind(this,true,true));
			$scope.$on('validate.$all.nochange',oValidatorValidateAll.bind(this,true,false));
			$scope.$on('validate.$fullReset',fullValidationReset);

    },
    scope:true,
    compile:function(){
      return {
        pre:function oValidatorPreLink($scope,$element,$attrs,ctrls){

        },
        post:function oValidatorPostLink($scope,$element,$attrs,ctrls){
          if ($attrs.oRest){
            $element.on('submit',ctrls.doRest.bind(ctrls,$attrs.oRest.indexOf('/rest/model')==0?$attrs.oRest:'/rest/model'+$attrs.oRest));

          }
          if (ctrls.validateOnload) {
        	  ctrls.validateAll(true);
          }
        }
      };
    }
  };
}]).directive("oValidate",function(){

  return {
    restrict:"A",
    require:"^^oValidateon",
    compile:function(){
      return {
        pre:function oValidatorPreLink($scope,$element,$attrs,validator){

        },
        post:function oValidatorPostLink($scope,$element,$attrs,validator){
          if ($attrs.name!=null && $attrs.name.indexOf('_D:')<0 && $attrs.oValidate!=null){
            var validators=$attrs.oValidate.split(" ");
            if (validators.length>0) {
            	validator.addElement($element,validators,$attrs.oOn);
            }
          }
        }
      };
    }
  };
}).directive("oRating",[function oRating(){
	var tpl= '<div class="rating-symbol" style="display: inline-block; position: relative;">'+
  	 '<div class="rating-symbol-background glyphicon glyphicon-star-empty">'+
	 '</div>'+
	 '<div class="rating-symbol-foreground glyphicon glyphicon-star" style="display: inline-block; position: absolute; overflow: hidden; left: 0px; width: 100%;visibility:hidden;">'+
	 '</div>'+
	 '</div>';



	return {
		    priority: 0,

		    transclude: false,
		    restrict: 'EA',
		    templateNamespace: 'html',
		    scope: {
		    	value:"=?oRatingValue"
		    },
		    controller: function($scope, $element, $attrs, $transclude) {

		    },
		    controllerAs: 'ctl',
		    bindToController: false,
		    compile: function compile(tElement, tAttrs, transclude) {

		      return {
		        /*pre: function preLink($scope, iElement, iAttrs, controller) {

		        },*/
		        post: function postLink($scope, iElement, iAttrs, controller) {

		        	var maxStars=iAttrs.oRatingMax?parseInt(iAttrs.oRatingMax):5;
		        	var fullTpl="";

		        	for(var i=0;i<maxStars;i++){
		        		fullTpl+=tpl;
		        	}
		        	var starsDom=angular.element(fullTpl);
		        	iElement.prepend(starsDom);
		        	if (!iAttrs.oRatingReadonly){
		        		var starsForeground=starsDom.children('.rating-symbol-foreground');
		        		iElement.on('mouseleave',function(leaveEvent){

			        		starsForeground.each(function(fgNum,fgEl){
		        				$(fgEl).css('visibility',(fgNum+1)>$scope.value?'hidden':'visible');
		        			});
			        	});
			        	starsDom.each(function(starNum,starEl){
			        		$(starEl).on('mouseenter',function(enterEvent){
			        			starsForeground.each(function(fgNum,fgEl){
			        				$(fgEl).css('visibility',fgNum>starNum?'hidden':'visible');
			        			});
			        		}).on('click',function(clickEvent){
			        			$scope.value=starNum+1;
			        			$scope.$apply();
			        		});
			        	});
		        	}else{
		        		var ratingValue=parseInt(iAttrs.oRatingReadonly);
		        		starsDom.children('.rating-symbol-foreground:lt('+ratingValue+')').css('visibility','visible');
		        	}
		        }
		      }

		    },

		  };
}]);
