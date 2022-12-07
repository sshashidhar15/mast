/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}

/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {
	document.querySelector('html').classList.add('reg-demo');

	/*jshint -W069 */
	$(document).ready(function() {
		if (localStorage) {
			const tracking = localStorage.getItem('visitor-tracking');
			if (tracking) {
				$('input[name="tracking_info"]').val(tracking);
			}
		}

		$('#step_1').fadeIn(0);

		$(document).on('readyToRegisterDemo', function(e) {
	        registerDemo();
	    });

	    registerDemo();

		function initCountriesByRegulatorRules (branchedCountries) {
			var temp_serverCountries = branchedCountries;
			if (temp_serverCountries.length) {
				branchedCountries = temp_serverCountries;
				if ($('html').is('.country-cy.branch-2')) {
					// leave only CySEC countries for Cyprus
					// branchedCountries = temp_serverCountries.filter((c) => (c && c.code == 'XX') || (c && c.branching && c.branching.find(b => b.branch == 2 && b.status == 1)));
				}
			} else {
				console.error('Error DB settings: all branches of all countries has status = 4;');
			}

			if (window['forceRegulator']) { // WEB-1167
				temp_serverCountries = [];
				for (var i in branchedCountries) {
					var c = branchedCountries[i];
					if (c && c.branching) {
						var temp_c = {
							code: c.code,
							id: c.id,
							name: c.name,
							status: c.status,
							tel: c.tel
						};
						var forceBranchOptions = c.branching.find(function (item) {
							return item && item.branch === window['forceRegulator'] && item.status === '1';
						});
						if (forceBranchOptions) {
							temp_c.branching = [{
								'branch': window['forceRegulator'],
								'status': '1',
								'default': true
							}];
							temp_serverCountries.push(temp_c);
						}
					}
				}
				if (temp_serverCountries.length) {
					branchedCountries = temp_serverCountries;
				} else {
					console.error('Error value in REGULATOR url parameter:', window['forceRegulator']);
				}
			}
			if(window['currentBranch'] == '2') {
				//branchedCountries = branchedCountries.filter(c => (c && c.branching && !c.branching.every(b => (b.branch == 1 || b.branch == 3 || b.branch == 4 || b.branch == 5))));
				branchedCountries = branchedCountries.filter(c => (c && c.branching && c.branching.find(b => b.branch == 2 && b.status == 1)));
			} else if(window['currentBranch'] == '6') {
				//branchedCountries = branchedCountries.filter(c => (c && c.branching && !c.branching.every(b => (b.branch == 1 || b.branch == 3 || b.branch == 4 || b.branch == 5))));
				branchedCountries = branchedCountries.filter(c => (c && c.branching && c.branching.find(b => b.branch == 6 && b.status == 1)));
			} else {
				// remove countries where all branches has status 4, but keep separator in the list
				branchedCountries = branchedCountries.filter(c => (c && c.branching && !c.branching.every(b => b.status == 4)));
			}
			branchedCountries.sort((a, b) => a.name.localeCompare(b.name));
			window['serverCountries'] = branchedCountries;
		}

		function registerDemo () {
	        if (!$('.wp-icm-open-account.demo').length) return;
	        window['request_from'] = 'WWW2 Branched demo';
	        window['personalAreaURL'] = $('.wp-icm-open-account.demo a.personal-area-url').attr('href');
            window['serverBranches'] = [];
			window['currentBranch'] = $('html').attr('data-branch');
	        window['serverCountries'] = [];
	        window['serverQuestions'] = [];
	        window['landingPage'] = false;
	        window['unsupportedCountries'] = [
	            'United States'
	        ];
	        window['disallowedCountries'] = [
	            'New Zealand',
	            'Chatham Island (New Zealand)'
	        ];
			window['forceRegulator'] = null;

	        window.getSignTokenDemo = function () {
	            var $def = $.Deferred();
	            $.get(window['serverURL'] + '~get~sign~token~?nocache=' + Date.now()).done(function (token) {
	                $def.resolve(token);
	            }).fail(function () {
	                $def.resolve(null);
	            });

	            return $def.promise();
	        };

	        // $('.wp-icm-open-account.demo .reg_overlay').fadeIn();
	        $('.wp-icm-open-account.demo a.link-to-personal-area').each(function() {
	            $(this).attr('href', window['personalAreaURL']);
	        });
	        $('.wp-icm-open-account.demo a.link-to-personal-area-downloads').each(function() {
	            $(this).attr('href', window['personalAreaURL'] + '/Downloads');
	        });

	        var startTimeoutDemo = setTimeout(function() {
	            window['userLocationByIP'] = {
	                countryName: '',
	                countryCode: 'XX'
	            };
	            window['serverCountries'] = [{
	                code: 'XX',
	                id: 888,
	                name: '',
	                tel: '+000'
	            }];
	            startRegistrationDemo();
	        }, 59000); // for show form if something wrong

	        setTimeout(function() { // for show waiting indicator
	            var getDataAndContinueDemo = function(ip) {
	                window['userIP'] = ip;
	                getSignTokenDemo().then(function(token) {
	                    $.ajax({
	                        dataType: "json",
	                        url: window['serverURL'] + "?getData&ip=" + ip + '&request_from=' + window['request_from'] + '&sign=' + token,
	                        success: function(data) {
	                        	if (window['forceCountryFrom']) {
									data.locationByIP.countryCode = window['forceCountryFrom'];
								}
	                            window['userLocationByIP'] = data.locationByIP;
                                window['serverBranches'] = data.branches;
                                initBranchesList();
                                initCountriesByRegulatorRules(data.countries);
	                            window['serverSuitableTraits'] = data.suitableTraits;
	                            clearTimeout(startTimeoutDemo);
	                            startRegistrationDemo();
	                        },
	                        fail: function (err) {
	                            console.error('FAIL', err);
	                        }
	                    });
	                });
	            };
	            var userIP = Cookies.get('userIPAddress');
	            if (userIP && userIP !== 'timeout') {
	                getDataAndContinueDemo(userIP);
	            } else {
	                getSignTokenDemo().then(function(token) {
	                    $.ajax({
	                        dataType: "json",
	                        url: window['serverURL'] + '?getIncrement' + '&request_from=' + window['request_from'] + '&sign=' + token,
	                        success: function( data ){
	                            // console.log('counter = ' + data);
	                        },
	                        error: function( data ){
	                            // console.log('counter = ' + data);
	                        }
	                    });
	                });
	                var ipTimeoutReachedDemo = false;
	                var ipTimeoutDemo = setTimeout(function () {
	                    ipTimeoutReachedDemo = true;
	                    var ip = 'timeout';
	                    Cookies.set('userIPAddress', ip, { expires: 1 });
	                    getDataAndContinueDemo(ip);
	                }, 55000);
	                $.get("https://pro.ip-api.com/json/?key=xylJvTwPTjbRGfQ").done(function(done) {
	                    // console.log('DONE: https://pro.ip-api.com/json/?key=xylJvTwPTjbRGfQ', done);
	                    if (!ipTimeoutReachedDemo) {
	                        clearTimeout(ipTimeoutDemo);
	                        var ip = done.query;
	                        if (ip) {
	                            Cookies.set('userIPAddress', ip, { expires: 1 });
	                            getDataAndContinueDemo(ip);
	                        }
	                    }
	                }).fail(function(fail) {
	                    console.log('FAIL: https://pro.ip-api.com/json/?key=xylJvTwPTjbRGfQ', fail);
	                });
	            }
	        }, 300);
	        $('.show_verification_and_compensation').on('click', function(e) {
	            $('#verification_and_compensation').fadeIn();
	        });
	        $('#verification_and_compensation').on('click', function(e) {
	            $('#verification_and_compensation').fadeOut();
	        });
	    }
	});

	function getDefaultBranchByCountryCode(countryCode) {
		var countries = window['serverCountries'];
		var branch = '3';
		if (countries && countries.length) {
			for (var i in countries) {
				var countryObject = countries[i];
				if (countryObject && countryObject.code === countryCode && countryObject.branching) {
					var branchOptions = countryObject.branching.find(function (item) {
						return item && item.status === "1" && item.default === true;
					});
					if (branchOptions) {
						branch = branchOptions.branch;
					}
					break;
				}
			}
		}
		return branch;
	}

	function _changeBranch ($branchInput, countryCode, branchID) {
		// debugger;
		var step1branch = $('#branch_id').attr('data-orig');
		var canRedirect = branchID !== null;
		var defaultBranchByCountry = {};
		var isCurrentBranchAllowedForSelectedCountry = false;
		var isSelectedBranchAllowedForSelectedCountry = false;
		if (countryCode) {
			var country = window['serverCountries'].find(function (item) {
				return item && item.code === countryCode;
			});
			if (country && country.branching) {
				var currentBranchForSelectedCountry = country.branching.find(function (item) {
					return item && item.branch === currentBranchID;
				});
				if (currentBranchForSelectedCountry && currentBranchForSelectedCountry.status !== '4') {
					isCurrentBranchAllowedForSelectedCountry = true;
				}

				var selectedBranchForSelectedCountry = country.branching.find(function (item) {
					return item && item.branch === branchID;
				});
				if (selectedBranchForSelectedCountry && selectedBranchForSelectedCountry.status !== '4') {
					isSelectedBranchAllowedForSelectedCountry = true;
				}

				// default with status 1
				// default branch from currentBranchID
				defaultBranchByCountry = country.branching.find(function (item) {
					return item && item.status === '1' /*&& item.default === true*/  && item.branch === currentBranchID && (isItCySECWebSite || item.branch !== '2');
				});
				if (!defaultBranchByCountry) {
					// any allowed status for current branch
					defaultBranchByCountry = country.branching.find(function (item) {
						return item && item.status !== '4' && item.branch === currentBranchID && (isItCySECWebSite || item.branch !== '2');
					});
				}
				if (!defaultBranchByCountry) {
					// status 1 for default by country branch
					defaultBranchByCountry = country.branching.find(function (item) {
						return item && item.status === '1' && item.default === true && (isItCySECWebSite || item.branch !== '2');
					});
				}
				if (!defaultBranchByCountry) {
					// any with status 1
					defaultBranchByCountry = country.branching.find(function (item) {
						return item && item.status === '1';
					});
				}
				if (!defaultBranchByCountry) {
					// any with status 2
					defaultBranchByCountry = country.branching.find(function (item) {
						return item && item.status === '2';
					});
				}
				if (!defaultBranchByCountry) {
					// any with status 3
					defaultBranchByCountry = country.branching.find(function (item) {
						return item && item.status === '3';
					});
				}
			}
		}

		if (isSelectedBranchAllowedForSelectedCountry && branchID) {
			window['currentBranch'] = branchID;
		} else if (isCurrentBranchAllowedForSelectedCountry && branchID) {
				window['currentBranch'] = window['currentBranch'];
		} else if (defaultBranchByCountry.branch) {
			window['currentBranch'] = defaultBranchByCountry.branch;
		} else {
			window['currentBranch'] = Cookies.get('regulator') || branchID || defaultBranchByCountry.branch || window['currentBranch'];
		}

		var defaultBranch = defaultBranchByCountry.branch;
		var branch = defaultBranch;
		var branched = window['serverBranches'].find(function (item) {
			return item && item.ID === window['currentBranch'];
		});
		if (branched && branched.ID) {
			var name = $('.cached-translation.reg_form_branch_' + branched.Name.toLowerCase()).text();
			var description = $('.cached-translation.reg_form_branch_' + branched.Name.toLowerCase() + '_description').html();
			$branchInput.val(name);
			$branchInput.attr(
				'data-orig',
				branched.ID
			);
			$branchInput.parent().addClass('has-label');
			branch = branched.ID;
			$('.branch-description').html(description);
		} else {
			$branchInput.attr(
				'data-orig',
				defaultBranch
			);
			$branchInput.parent().removeClass('has-label');
			$('.branch-description').html('');
		}
		toggleAsknowledge(countryCode);
	}

	function setBranch ($branchInput, countryCode, branchID, isForce) {
		if (!$branchInput || !$branchInput.length) return;
		var eu_user_confirm_com = Cookies.get('eu_user_confirm_com')
		if (isForce) {
			_changeBranch($branchInput, countryCode, branchID);
			let selectedCountry_Object = serverCountries.find(c => c.code === countryCode.toUpperCase());
			let branchDefault = null;
			let branchFrom = ICMBranchID;
			let branchTo = currentBranch || currentBranchID;
			let canRegisterInBranchFrom = false;
			let canRegisterInBranchTo = true;
			let selectedCountry = countryCode.toLowerCase();
			let selectedCountry_Name = null;
			let isSupportedCurrentBranchForSelectedCountry = false;
			if (selectedCountry_Object) {
				let branchFromData = selectedCountry_Object.branching.find(b => b.branch === branchFrom)
				if (!branchFromData) {
					branchFromData = {
						branch: branchFrom,
						status: '4',
						default: false
					}
				}
				canRegisterInBranchFrom = branchFromData.status === '1'
				canRegisterInBranchTo = selectedCountry_Object.branching.find(b => b.branch === branchTo).status === '1'
				selectedCountry_Name = selectedCountry_Object.name
				isSupportedCurrentBranchForSelectedCountry = canRegisterInBranchFrom && branchFromData.default;

				let branchDefaultData = selectedCountry_Object.branching.find(b => b.default === true);
				branchDefault = branchDefaultData ? branchDefaultData.branch : null;
			}
			if (cysecCountriesString.includes(selectedCountry) && branchFrom !== '2') {
				isSupportedCurrentBranchForSelectedCountry = false
				branchTo = '2'
			}
			$('.hint-go-eu').hide();
			$('.hint-go-au').hide();

			// display canada states dropdown
			if (selectedCountry_Object.code === 'CA') {
				collectCanadaStates();

				$('.wp-icm-open-account.demo .input-select-state').attr("style", "display: block;");
				$('.wp-icm-open-account.demo .hint-canada-state').attr("style", "display: block;");
				$('.wp-icm-open-account.demo #state').attr('required', true);
			} else {
				$('.wp-icm-open-account.demo .input-select-state').attr("style", "display: none;");
				$('.wp-icm-open-account.demo .hint-canada-state').attr("style", "display: none;");
				$('.wp-icm-open-account.demo #state').removeAttr('required');
			}

			// enable all input fields
			$(".register_form :input:not([name=country]), .register_form :button").prop("disabled", false);
			let branchFrom_Name = serverBranches.find(b => b.ID === branchFrom).Name;
			let branchTo_Name = serverBranches.find(b => b.ID === branchTo).Name;

			if (!selectedCountry_Name) {
				// if we unable to define the country from where user come, then
				// allow for him to select available country from the list without aby popups
			} else {
				if (!isSupportedCurrentBranchForSelectedCountry) {
					let camp = Cookies.get('camp');
					let params = `?reg_force_country=${selectedCountry}${camp && camp.length ? '&camp=' + camp : ''}`;

					if (branchFrom == "1" && selectedCountry == 'gb') {
						// disable all input fields
						$(".register_form :input:not([name=country]), .register_form :button").prop("disabled", true);
						$('body').toggleClass('popup-modal-active-warning-only', true);
						$('.popup-modal.warning-only .content').fadeIn();
						$('.popup-modal.warning-only .current-branch-name').text(branchFrom_Name);
						$('.popup-modal.warning-only .selected-country-name').text(selectedCountry_Name);
						$('.popup-modal.warning-only .content').on('click', '.popup-modal-button', function (e) {
							$('body').toggleClass('popup-modal-active-warning-only', false);
							$('.popup-modal.warning-only .content').fadeOut(300);
						});
					} else if (branchFrom == "4") {
						// disable all input fields
						$(".register_form :input:not([name=country]), .register_form :button").prop("disabled", true);
						$('body').toggleClass('popup-modal-active-expected-redirect-only', true);
						$('.popup-modal.expected-redirect-only .content').fadeIn();
						$('.popup-modal.expected-redirect-only .current-branch-name').text(branchFrom_Name)
						$('.popup-modal.expected-redirect-only .selected-country-name').text(selectedCountry_Name)
						$('.popup-modal.expected-redirect-only .redirect-to-branch-name').text(branchTo_Name)
						$('.popup-modal.expected-redirect-only .content').off('click', '.popup-modal-button');
						$('.popup-modal.expected-redirect-only .content').on('click', '.popup-modal-button', function (e) {
							$('body').toggleClass('popup-modal-active-expected-redirect-only', false);
							$('.popup-modal.expected-redirect-only .content').fadeOut(300);
							Cookies.remove('regulator');
							let protocol = window.location.protocol
							let host = window.location.host
							if (!host.includes('localhost') && !host.includes('icmarkets.com')) {
								host = 'icmarkets.com'
							}
							let prefix = ''
							switch (branchDefault) {
								case '1':
									prefix = '/au/en'
									break;
								case '2':
									prefix = '/eu/en'
									break;
								case '3':
									prefix = '/global/en'
									break;
								case '4':
									prefix = '/intl/en'
									break;
								case '6':
									prefix = '/uk/en'
									break;
								case '8':
									prefix = '/mu/en'
									break;
								case '9':
									prefix = '/ky/en'
									break;
							}
							window.location = protocol + '//' + host + prefix + '/open-trading-account/demo/' + params;
						});
					} else if (canRegisterInBranchFrom) {
						if (cysecCountriesString.includes(selectedCountry)) {
							branchDefault = '2';
						}

						// Andrew: show 2 options popup for Australia in FSA and SCB!
						// It's should be a common logic solution for any country, which is allowed to register
						// in the current branch, but the default branch is different
						if (branchDefault && ((branchDefault !== branchFrom && selectedCountry === 'au') || (branchDefault !== branchFrom && cysecCountriesString.includes(selectedCountry)))) {
							// In FSA only: hide the 2 option popup, but show the Notice for EU clients
							if (branchFrom == '3' && branchDefault == '2' && cysecCountriesString.includes(selectedCountry)) {
								// Notice for EU country to go CySEC
								$('.hint-go-eu').show();
							} else {
								const forbiddenCountries = ["fr", "pl", "cy" ];
								if (cysecCountriesString.includes(selectedCountry) && !forbiddenCountries.includes(selectedCountry) && branchFrom ==='1') return;
								let branchDefault_Name = {
									"1": "International Capital Markets Pty Ltd (Australia)",
									"2": "IC Markets (EU) Ltd",
									"3": "Raw Trading Ltd",
									"4": "IC Markets Ltd",
									"6": "IC Markets (UK) Ltd",
									"8": "Raw Trading (Mauritius) Ltd",
									"9": "IC Markets (KY) Ltd"
								}[branchDefault];
								// show popup with 2 options (leave here or redirect)
								$('body').toggleClass('popup-modal-active-goto-default', true);
								$('.popup-modal.goto-default .redirect-default-branch-name').text(branchDefault_Name)
								$('.popup-modal.goto-default .content').off('click', '.popup-modal-button');
								$('.popup-modal.goto-default .content').on('click', '.popup-modal-button', function (e) {
									$('body').toggleClass('popup-modal-active-goto-default', false);
									var btn = $(this);
									if (btn.is('.accept-button')) {
										Cookies.remove('regulator');
										let protocol = window.location.protocol
										let host = window.location.host
										if (!host.includes('localhost') && !host.includes('icmarkets.com')) {
											host = 'icmarkets.com'
										}
										let prefix = ''
										switch (branchDefault) {
											case '1':
												prefix = '/au/en'
												break;
											case '2':
												prefix = '/eu/en'
												break;
											case '3':
												prefix = '/global/en'
												break;
											case '4':
												prefix = '/intl/en'
												break;
											case '6':
												prefix = '/uk/en'
												break;
											case '8':
												prefix = '/mu/en'
												break;
											case '9':
												prefix = '/ky/en'
												break;
										}
										window.location = protocol + '//' + host + prefix + '/open-trading-account/demo/' + params;
									}
								});
							}
						}
					} else if (canRegisterInBranchTo) {
						// show popup with 1 option (expected redirect only)
						// disable all input fields
						$(".register_form :input:not([name=country]), .register_form :button").prop("disabled", true);
						$('body').toggleClass('popup-modal-active-expected-redirect-only', true);
						$('.popup-modal.expected-redirect-only .content').fadeIn();
						$('.popup-modal.expected-redirect-only .current-branch-name').text(branchFrom_Name)
						$('.popup-modal.expected-redirect-only .selected-country-name').text(selectedCountry_Name)
						$('.popup-modal.expected-redirect-only .redirect-to-branch-name').text(branchTo_Name)
						$('.popup-modal.expected-redirect-only .content').off('click', '.popup-modal-button');
						$('.popup-modal.expected-redirect-only .content').on('click', '.popup-modal-button', function (e) {
							$('body').toggleClass('popup-modal-active-expected-redirect-only', false);
							$('.popup-modal.expected-redirect-only .content').fadeOut(300);
							Cookies.remove('regulator');
							let protocol = window.location.protocol
							let host = window.location.host
							if (!host.includes('localhost') && !host.includes('icmarkets.com')) {
								host = 'icmarkets.com'
							}
							let prefix = ''
							switch (branchTo) {
								case '1':
									prefix = '/au/en'
									break;
								case '2':
									prefix = '/eu/en'
									break;
								case '3':
									prefix = '/global/en'
									break;
								case '4':
									prefix = '/intl/en'
									break;
								case '6':
									prefix = '/uk/en'
									break;
								case '8':
									prefix = '/mu/en'
									break;
								case '9':
									prefix = '/ky/en'
									break;
							}
							window.location = protocol + '//' + host + prefix + '/open-trading-account/demo/' + params;
						});
					} else {
						console.error('Branching ERROR: please contact us for advice')
					}
				} else {
					// For FSA clients that we recommend them to choose au
					const recommendCountries = ['za'];
					if (branchFrom == '3' && recommendCountries.includes(selectedCountry)) {
						let href = $('.hint-go-au > a').attr('href').split('?');
						href = href[0];
						$('.hint-go-au > a').attr('href', href + '?reg_force_country=' + selectedCountry)
						$('.hint-go-au').show();
					}
				}
			}
		} else if (window['isUserFromCySECCountry'] && !window['isItCySECWebSite'] && window['cysecCountriesString'].indexOf(countryCode.toLowerCase()) !== -1) {
			// user from EU country on the .com website selected EU country in the dropdown
			if (branchID === '1') {
				$('body').toggleClass('popup-modal-active-eu-proceed-to-com', true);
				$('.popup-modal.eu-proceed-to-com .content').off('click', '.popup-modal-button');
				$('.popup-modal.eu-proceed-to-com .content').on('click', '.popup-modal-button', function (e) {
					$('body').toggleClass('popup-modal-active-eu-proceed-to-com', false);
					var btn = $(this);
					if (btn.is('.accept-button')) {
						Cookies.set('eu_user_confirm_com', 'confirmed')
					} else { // restore CySEC in selector
						Cookies.remove('regulator');
						window.location = window['cysecRegformURL']
					}
				});
			} else if (branchID === '3') {
				$('body').toggleClass('popup-modal-active-eu-proceed-to-com', true);
				$('.popup-modal.eu-proceed-to-com .content').off('click', '.popup-modal-button');
				$('.popup-modal.eu-proceed-to-com .content').on('click', '.popup-modal-button', function (e) {
					$('body').toggleClass('popup-modal-active-eu-proceed-to-com', false);
					var btn = $(this);
					if (btn.is('.accept-button')) {
						Cookies.set('eu_user_confirm_com', 'confirmed')
					} else { // restore CySEC in selector
						Cookies.remove('regulator');
						window.location = window['cysecRegformURL']
					}
				});
			}
		} else {
			_changeBranch($branchInput, countryCode, branchID);
		}

		$('.branch-select').toggleClass('hide-alone', $('.branch-select ul li').length < 2);

		if (window['currentBranchID'] == '4' && window['countryFrom'] == 'au' && countryCode == 'AU') {
			$('body').toggleClass('popup-modal-active-au-continue-with-bs', true);
			$('.popup-modal.au-continue-with-bs .content').off('click', '.popup-modal-button');
			$('.popup-modal.au-continue-with-bs .content').on('click', '.popup-modal-button', function (e) {
				$('body').toggleClass('popup-modal-active-au-continue-with-bs', false);
				var btn = $(this);
				if (btn.is('.accept-button')) {
					Cookies.set('au_continue_with_bs', 'confirmed')
				} else { // go to AU website
					Cookies.remove('au_continue_with_bs');
					window.location = 'https://icmarkets.com/au/en/open-trading-account/demo';
				}
			});
		}
	}

	function collectCanadaStates() {
		var options_list = $('.wp-icm-open-account.demo .input-select-state .searchDropdown .options_list');
		if (!options_list.length) {
			$('.wp-icm-open-account.demo .input-select-state .searchDropdown input').after('<ul class="options_list"></ul>');
		}

		var list = $('.input-select-state').find('.options_list');
		var CanadaStates = [
			{
				code: 'AB',
				state_province: 'Alberta'
			},
			{
				code: 'MB',
				state_province: 'Manitoba'
			},
			{
				code: 'NB',
				state_province: 'New Brunswick'
			},
			{
				code: 'NF',
				state_province: 'Newfoundland and Labrador'
			},
			{
				code: 'NT',
				state_province: 'Northwest Territories'
			},
			{
				code: 'NS',
				state_province: 'Nova Scotia'
			},
			{
				code: 'NU',
				state_province: 'Nunavut'
			},
			{
				code: 'PE',
				state_province: 'Prince Edward Island'
			},
			{
				code: 'PQ',
				state_province: 'Quebec'
			},
			{
				code: 'SK',
				state_province: 'Saskatchewan'
			},
			{
				code: 'YT',
				state_province: 'Yukon'
			}
		];

		$.each(CanadaStates, function(value, item) {
			list.append("<li data-sc='" + item.code + "' data-sn='" + item.state_province + "'>" + item.state_province + "</li>");
		});
	}

	function collectUnsupportedAndDisallowedCountriesDemo() {
		window['unsupportedCountries'] = [];
		window['disallowedCountries'] = [];
		var branch = window['currentBranch'];
		for (var i in window['serverCountries']) {
			var c = window['serverCountries'][i];
			if (c && c.branching) {
				var b = c.branching.find(function (item) {
					return item && item.branch === branch;
				});

				if (b) {
					if (b.status === '2') {
						window['unsupportedCountries'].push(c.name);
					} else if (b.status === '3') {
						window['disallowedCountries'].push(c.name);
					}
				}
			}
		}
	}

	function startRegistrationDemo() {
	    $(document).on('localizeParsley', function() {
	        localizeParsleyMessagesDemo();
	    });

	    localizeParsleyMessagesDemo();
		toggleRefferControls();
		toggleAsknowledge();

	    $('.wp-icm-open-account.demo .reg_overlay').fadeOut();
	    window.console.log = function() {};
	    (function($) {
	        $.fn.removeClassWild = function(mask) {
	            return this.removeClass(function(index, cls) {
	                var re = mask.replace(/\*/g, '\\S+');
	                return (cls.match(new RegExp('\\b' + re + '', 'g')) || []).join(' ');
	            });
	        };
	    })(jQuery);

	    ;
	    (function(window) {
	        "use strict";

	        if ("ontouchstart" in window) {
	            document.body.addEventListener("touchstart", showDemo, false);
	        }
	        document.body.addEventListener("mousedown", showDemo, false);

	        function showDemo(e) {
	            var element = null;
	            var target = e.target || e.srcElement;
	            while (target.classList && target.parentElement !== null) {
	                if (target.classList.contains("wave-effect")) {
	                    element = target;
	                    break;
	                }
	                target = target.parentElement;
	            }
	            if (element === null) {
	                return false;
	            }
	            var wave = document.createElement("div");
	            wave.className = "wave";
	            element.appendChild(wave);
	            var position = getRelativeEventPostionDemo(element, e);
	            var radius = getRadiusDemo(element, position);
	            var scale = "scale(1)";
	            wave.style.left = (position.x - radius) + "px";
	            wave.style.top = (position.y - radius) + "px";
	            wave.style.width = (radius * 2) + "px";
	            wave.style.height = (radius * 2) + "px";
	            wave.style["-webkit-transform"] = scale;
	            wave.style["-moz-transform"] = scale;
	            wave.style["-ms-transform"] = scale;
	            wave.style["-o-transform"] = scale;
	            wave.style.transform = scale;

	            element.addEventListener("mouseup", hideDemo, false);
	            element.addEventListener("mouseleave", hideDemo, false);
	            if ("ontouchstart" in window) {
	                document.body.addEventListener("touchend", hideDemo, false);
	            }
	        }

	        function hideDemo(e) {
	            var element = this;
	            var wave = null;
	            var waves = element.getElementsByClassName("wave");
	            if (waves.length > 0) {
	                wave = waves[waves.length - 1];
	            } else {
	                return false;
	            }
	            wave.style.opacity = 0;
	            setTimeout(function() {
	                try {
	                    element.removeChild(wave);
	                } catch (e) {
	                    return false;
	                }
	            }, 2000);
	        }

	        function getRelativeEventPostionDemo(element, e) {
	            var offset = {
	                top: element.getBoundingClientRect().top + window.pageYOffset - element.clientTop,
	                left: element.getBoundingClientRect().left + window.pageXOffset - element.clientLeft
	            };
	            return {
	                y: e.pageY - offset.top,
	                x: e.pageX - offset.left
	            };
	        }

	        function getRadiusDemo(element, position) {
	            var w = Math.max(position.x, element.clientWidth - position.x);
	            var h = Math.max(position.y, element.clientHeight - position.y);
	            return Math.ceil(Math.sqrt(Math.pow(w, 2) + Math.pow(h, 2)));
	        }
	    })(window);

	    $('.wp-icm-open-account.demo .field-input').each(function() {
	        if ($(this).val().length) {
	            $(this).parent().addClass('has-label');
	        }
	    });

	    $('.wp-icm-open-account.demo .fields_individual').fadeIn().addClass('firstClick');
	    $('.wp-icm-open-account.demo .birthdate input').on('keyup change', function() {
	        var fieldName = $(this).data('fieldName'),
	            field = $('.wp-icm-open-account.demo .birthdate input[data-field-name="' + fieldName + '"]'),
	            fieldVal = $(this).val();
	        	field.val(fieldVal);
	        if (fieldVal) {
	            field.parent().addClass('has-label');
	        }
	    });

	    $('.wp-icm-open-account.demo .select_btns_group .select_btn').each(function() {
	        var inType;
	        if ($(this).parent().hasClass('single_select')) {
	            inType = 'radio';
	        } else if ($(this).parent().hasClass('multi_select')) {
	            inType = 'checkbox';
	        }
	        $(this).append('<input type="' + inType + '" data-parsley-multiple="' + $(this).data('id') + '" name="' + $(this).data('id') + '" value="' + $(this).data('value') + '" required="">');
	    });

	    $('.wp-icm-open-account.demo .australian_test_wrap .radio_btns_group').each(function(i) {
	        $(this).attr('data-name', 'q' + i);
	    });
	    $('.wp-icm-open-account.demo .australian_test_wrap label').each(function(i) {
	        var fieldName = $(this).parent().data('name'),
	            fieldValue = $(this).html();
	        $(this).attr('for', 'test_' + i).before('<input type="radio" class="radio au_test" id="test_' + i + '" name="' + fieldName + '" value="q' + i + '">');
	    });
	    $('.wp-icm-open-account.demo .australian_test_wrap label:not(:last-child)').after('<br><br>');

	    $('.wp-icm-open-account.demo .invitation-guid').hide();
	    $('.wp-icm-open-account.demo .info').hide();

	    function addJointStepsDemo() {
	        // for live only
	    }

	    function removeJointStepsDemo() {
	        // for live only
	    }

	    $('.wp-icm-open-account.demo .registered_address_fields input').on('change keyup', function() {
	        if ($('.wp-icm-open-account.demo #busaddr').prop('checked') == true) {
	            var val = $(this).val(),
	                fieldName = $(this).data('fieldName');
	            $('.wp-icm-open-account.demo input[name="business_' + fieldName + '"]').val(val).parsley().validate();
	            if (val) {
	                $('.wp-icm-open-account.demo input[name="business_' + fieldName + '"]').parent().addClass('has-label');
	            } else {
	                $('.wp-icm-open-account.demo input[name="business_' + fieldName + '"]').parent().removeClass('has-label');
	            }
	        }
	    });

	    updateCustomValidatorsDemo();

	    $('.wp-icm-open-account.demo .searchDropdown.searched input').after('<ul class="options_list"></ul>');
	    $('.wp-icm-open-account.demo .searchDropdown.notSearched input').prop('readonly', 'readonly');
	    if (!window['landingPage']) {
	        $('.wp-icm-open-account.demo .searchDropdown.notSearched .options_list').mCustomScrollbar({
	            theme: "dark",
	            autoExpandScrollbar: false,
	            autoHideScrollbar: false,
	            scrollButtons: { enable: false },
	            scrollInertia: 0
	        });
	    }

	    function countriesLoadedAutocompleteDemo(countries, evType, list, sVal) {
			let added = [];
            $.each(countries, function(value, item) {
                var cName = item.name.toLowerCase();
                var cCode = item.code;

				if (!added.includes(cCode)) {
					added.push(cCode);
					if (evType == 1) {
						list.addClass('newlist');
						if (cCode === 'XX') {
							list.append("<li class='list-separator'>&nbsp;</li>");
						} else {
							list.append("<li data-ml='" + 'reg_form_country_' + cCode + "' data-cn='" + getCountryNameByCodeDemo(cCode).orig /*item.name*/ + "' data-cc='" + cCode + "'><span class='flag flag-" + (item.code).toLowerCase() + "' ></span>" + getCountryNameByCodeDemo(cCode).localized /*item.name*/ + "</li>");
						}
					} else {
						list.removeClass('newlist');
						if (cName.indexOf(sVal) >= 0) {
							if (cCode === 'XX') {
								list.append("<li class='list-separator'>&nbsp;</li>");
							} else {
								list.append("<li data-ml='" + 'reg_form_country_' + cCode + "' data-cn='" + getCountryNameByCodeDemo(cCode).orig /*item.name*/ + "' data-cc='" + cCode + "'><span class='flag flag-" + (item.code).toLowerCase() + "' ></span>" + getCountryNameByCodeDemo(cCode).localized /*item.name*/ + "</li>");
							}
						}
					}
				}
            });
	        if (!window['landingPage']) {
	            setTimeout(function() {
	                list.mCustomScrollbar({
	                    theme: "dark",
	                    autoExpandScrollbar: false,
	                    autoHideScrollbar: false,
	                    scrollButtons: { enable: false },
	                    scrollInertia: 500,
	                    live: "once"
	                });
	            }, 0);
	        }
	    }

		function handleKeyDown (event, $target, $list, action) {
			event.preventDefault();
			event.stopPropagation();
			let $selected = $list.find('li.selected');
			switch (action) {
				case 0:
					// click on selected (if present) item
					if ($selected.length) {
						$selected.click();
						setTimeout(() => {
							$('#first_name').focus();
						}, 200)
					}
					break;
				default:
					// change selected item
					let $arr = $list.find('li');
					let indexNow = $.inArray($selected.length ? $selected[0] : null, $arr);
					let newIndex = indexNow += action;
					if (newIndex > $arr.length - 1) {
						newIndex = $arr.length - 1;
					}
					if (newIndex < 0) {
						newIndex = 0;
					}
					if ($selected.length) {
    					$selected.toggleClass('selected', false);
					}
					let $nextSelected = $($arr.get(newIndex));
					$nextSelected.toggleClass('selected', true);
					$list.mCustomScrollbar("scrollTo", $nextSelected[0].offsetTop);
			}
		}

	    $(document).on('input focusin focus keydown', '.wp-icm-open-account.demo .searchDropdown input', function(event) {
	        // console.log(event.type);
	        var sVal = $(this).val().toLowerCase();
	        var list = $(this).parent().find('.options_list');
			if (event.type == 'keydown') {
				if (event.keyCode == 13/*ENTER*/) {
					handleKeyDown(event, $(this), list, 0);
					return false;
				}
				if (event.keyCode == 38/*ArrowUP*/) {
					handleKeyDown(event, $(this), list, -1);
					return false;
				}
				if (event.keyCode == 40/*ArrowDOWN*/) {
					handleKeyDown(event, $(this), list, 1);
					return false;
				}
			}
	        var evType;
	        if (event.type == 'focus' || event.type == 'focusin') {
	            evType = 1;
	            var save_this = $(this);
	            if (window.selectTimeout) {
	                clearTimeout(window.selectTimeout);
	            }
	            window.selectTimeout = setTimeout(function() {
	                save_this.select();
	            }, 100);
	        }
	        if (list.hasClass('searched'))
	            if (!window['landingPage']) {
	                list.mCustomScrollbar("destroy");
	            }
	        if ($(this).is('.searchDropdown.searched input')) {
	            if (!window['landingPage']) {
	                list.mCustomScrollbar("destroy");
	            }
	            list.find('li').remove();

	            if (window['serverCountries']) {
	                countriesLoadedAutocompleteDemo(window['serverCountries'], evType, list, sVal);
	            }
	        }
	    });

	    function getAccountTypeDemo() {
	        var ar = serializeFormToArrayDemo(); //$('.wp-icm-open-account.demo form').serializeArray();
	        var accType = 'individual';
	        for (var i = 0; i < ar.length; i++) {
	            var fieldName = ar[i].name;
	            var fieldValue = ar[i].value;
	            if (fieldName == 'reg_type' && fieldValue) {
	                accType = fieldValue;
	                break;
	            }
	        }
	        return accType;
	    }

	    $(document).on('click', '.wp-icm-open-account.demo', function(event) {
	        var target = $(event.target);
	        if (target.parent().hasClass('select_btn')) {
	            target = target.parent();
	        }

	        if (target.hasClass('select_btn')) {
	            var step = $('.wp-icm-open-account.demo .active_step');
	            if (target.parent().hasClass('trading_exp')) {
	                var ar = serializeFormToArrayDemo(); //$('.wp-icm-open-account.demo form').serializeArray();

	                function fillQuestionsByAccountTypeDemo(accType) {
	                    var questions = window['serverQuestions'][accType];
	                    var $container = $('#australian_test_container');
	                    $container.html('');
	                    var createOneQuestion = function(qData, index) {
	                        var id = "q_" + qData.id;
	                        var q = qData.question;
	                        var az = qData.answers;
	                        if (q && az && az.length) {
	                            var $c = $('<div class="radio_btns_group" data-name="' + id + '"></div>');
	                            var $q = $('<div class="test_ask"><h3>Q' + index + '. ' + q + '</h3></div>');
	                            if (index === 1) {
	                                $q.addClass('first_test_ask');
	                            }
	                            $c.append($q);
	                            for (var i = 0, len = az.length, $a; i < len; i++) {
	                                $a = $('<br /><input type="radio" class="radio au_test" id="test_' + id + '_' + (i + 1) + '" name="' + id + '" value="a_' + (i + 1) + '"><label for="test_' + id + '_' + (i + 1) + '">' + az[i] + '</label><br />');
	                                $c.append($a);
	                            }
	                            return $c;
	                        }
	                        return '';
	                    };
	                    if (questions && questions.length) {
	                        for (var i = 0, len = questions.length; i < len; i++) {
	                            $container.append(createOneQuestion(questions[i], i + 1));
	                            if (i === len - 1) {
	                                $container.append('<br /><br /><br />');
	                            }
	                        }
	                    }
	                }
	            }
	            if (!target.hasClass('disabled_select')) {
	                if (target.hasClass('ctrader')) {
	                    $(step).find('.acctype_standart').addClass('disabled_select').removeClass('selected');
	                    $(step).find('.acctype_ecn').addClass('selected').find('input').prop('checked', 'checked').parsley().validate();
	                } else if (target.hasClass('metatrader')) {
	                    $(step).find('.acctype_standart').removeClass('disabled_select');
	                }
	                if (target.parent().hasClass('single_select')) {
	                    if (!target.hasClass('selected')) {
	                        target.parent().find('.select_btn').each(function() {
	                            $(this).removeClass('selected');
	                            $(this).find('input').removeAttr('checked');
	                        });
	                    }
	                    if (target.parent().hasClass('acctype')) {
	                        if (!target.hasClass('selected')) {
	                            var val = target.data('value'),
	                                curParlseyGroup = step.data('n') - 1,
	                                fields1step = JSON.parse(Cookies.get('step_1'));

	                            if (!$('.wp-icm-open-account.demo .select_btns_group.acctype').hasClass('success')) {
	                                for (var i = 0; i < fields1step.length; i++) {
	                                    var fieldName = fields1step[i].name,
	                                        field = $('.wp-icm-open-account.demo .fields_corporate input[name="' + fieldName + '"]'),
	                                        fieldValue = fields1step[i].value;
	                                    if (fieldName == 'country') {
	                                        $('.wp-icm-open-account.demo #registered_countries').val(fieldValue);
	                                        $('.wp-icm-open-account.demo #business_countries').val(fieldValue);
	                                    }
	                                    field.val(fieldValue).parent().addClass('has-label');
	                                }
	                            }
	                            if (val == 'individual' && $('.wp-icm-open-account.demo .fields_individual').hasClass('firstClick')) {
	                                $('.wp-icm-open-account.demo .fields_individual').removeClass('firstClick');
	                            } else {
	                                if (target.data('value') == 'joint') {
	                                    val = 'individual';
	                                    addJointStepsDemo();
	                                } else {
	                                    removeJointStepsDemo();
	                                }
	                                $('.wp-icm-open-account.demo .acctype_fields').fadeOut().find('input').each(function() {
	                                    $(this).removeAttr('required data-parsley-group').parent().removeClass('success error');
	                                    $(this).parsley().reset();
	                                });
	                                $('.wp-icm-open-account.demo .fields_' + val + ' input').attr({
	                                    'data-parsley-group': 'block-' + curParlseyGroup,
	                                    'required': ''
	                                });
	                                $('.wp-icm-open-account.demo #busaddr').removeAttr('required');
	                                $('.wp-icm-open-account.demo .fields_' + val).fadeIn(function() {}).find('input').each(function() {
	                                    if ($(this).val().length)
	                                        $(this).parsley().validate();
	                                });
	                            }
	                            if ($('.wp-icm-open-account.demo .fields_individual').hasClass('firstClick')) {
	                                $('.wp-icm-open-account.demo .fields_individual').removeClass('firstClick');
	                            }
	                        }
	                    }
	                    target.addClass('selected');
	                    target.find('input').prop('checked', 'checked');
	                } else {
	                    target.toggleClass('selected');
	                    if (target.find('input').attr('checked')) {
	                        target.find('input').removeAttr('checked');
	                    } else {
	                        target.find('input').prop('checked', 'checked');
	                    }
	                }
	                target.parent().removeClass('error').addClass('success').each(function() {
	                    target.find('input').removeAttr('required');
	                });
	            }
	            target.parent().find('input').each(function() {
	                $(this).parsley().validate();
	            });
	        } else { // if target not select btn
	            if (target.is('.options_list li')) {
	                var curDropdown = target.closest('.searchDropdown');
	                if (curDropdown.hasClass('searched')) {
	                    var cCode = target.data('cc'),
	                        cName = target.data('cn');

	                    $('.wp-icm-open-account.demo .active_step .searchDropdown.opened input').attr('data-orig', cName).attr('data-mlkey', target.attr('data-ml')).val(target.text()); //.parsley().validate();
	                    $('.wp-icm-open-account.demo .active_step .searchDropdown').removeClass('opened');

	                    let countryCode = cCode.toLowerCase();
						toggleRefferControls(countryCode);
	                    showPopupModalIfNeeded(countryCode);

						// reset state on country change
						$('.wp-icm-open-account.demo #state').val('');
						$('.wp-icm-open-account.demo #state').removeAttr('required');

                        var $branchInput = $('.wp-icm-open-account.demo input#branch_id');
                        if ($branchInput) {
                            var countryObject = getCountryObjectByCode(cCode);
                            initBranchesList(countryObject);
                            setBranch($branchInput, cCode, null, true);
                        }

                        fillPhoneCodeLabelByCountryNameDemo(cName);
	                } else {
	                    $selectInput = $('.wp-icm-open-account.demo .active_step .searchDropdown.opened input');
	                    if ($selectInput.is('#birth_month, #signatory_birth_month, #incorporation_birth_month')) {
	                        $selectInput.attr('data-orig', target.attr('data-id')).attr('data-mlkey', target.attr('data-ml')).val(target.text()).parsley().validate();
	                        $selectInput.change();
						} else if ($selectInput.is('#branch_id')) {
							var countryObject;
							var $countriesInput = $('.wp-icm-open-account.demo #countries');
							if ($countriesInput && $countriesInput.val()) {
								countryObject = getCountryObjectByName($countriesInput.attr('data-orig'));
							}
	                        $selectInput.attr('data-orig', target.attr('data-id')).attr('data-mlkey', target.attr('data-ml')).val(target.text()).parsley().validate();
	                        $selectInput.change();
							if (countryObject) setBranch($selectInput, countryObject.code, target.attr('data-id'));
						} else if ($selectInput.is('#joint_branch_id')) {
							var countryObject;
							var $countriesInput = $('.wp-icm-open-account.demo #joint_countries');
							if ($countriesInput && $countriesInput.val()) {
								countryObject = getCountryObjectByName($countriesInput.attr('data-orig'));
							}
	                        $selectInput.attr('data-orig', target.attr('data-id')).attr('data-mlkey', target.attr('data-ml')).val(target.text()).parsley().validate();
	                        $selectInput.change();
							if (countryObject) setBranch($selectInput, countryObject.code, target.attr('data-id'));
						} else {
	                        $selectInput.attr('data-orig', target.attr('data-id')).attr('data-mlkey', target.attr('data-ml')).val(target.text()).parsley().validate();
						}

	                    curDropdown.removeClass('opened');
	                }
	                if (curDropdown.hasClass('error')) {
	                    if (!window['landingPage']) {
	                        curDropdown.removeClass('error').addClass('success').find('.options_list').mCustomScrollbar("destroy");
	                    }
	                    curDropdown.find('input').parsley().validate();
	                }
	            } else if (!target.is('[class*="mCSB"]')) {
	                if (target.hasClass('rounded_el') && target.closest('.searchDropdown').length && !target.closest('.searchDropdown').hasClass('opened')) {
	                    target.closest('.searchDropdown').addClass('opened');
	                } else if (target.hasClass('rounded_el') && target.parent().is('.notSearched.opened')) {
	                    $('.wp-icm-open-account.demo .active_step .searchDropdown').removeClass('opened');
	                } else if ($('.wp-icm-open-account.demo .active_step .searchDropdown').hasClass('opened') && !$('.wp-icm-open-account.demo .active_step .searchDropdown.opened input').is(':focus')) {
	                    var curVal = $('.wp-icm-open-account.demo .active_step .searchDropdown.opened input');
	                    if ($('.wp-icm-open-account.demo .active_step .searchDropdown.opened').hasClass('searched') && curVal.length && !$('.wp-icm-open-account.demo .opened .options_list').hasClass('newlist')) {
	                        var valFromList = $('.wp-icm-open-account.demo .opened .options_list li:first').data('cn');
	                        $('.wp-icm-open-account.demo .active_step .searchDropdown.opened input').val(valFromList);
	                        $('.wp-icm-open-account.demo .active_step .searchDropdown.opened input').parsley().validate();
	                    }
	                    $('.wp-icm-open-account.demo .active_step .searchDropdown.opened').removeClass('opened');
	                    if ($('.wp-icm-open-account.demo .active_step .searchDropdown.opened').hasClass('searched')) {
	                        if (!window['landingPage']) {
	                            $('.wp-icm-open-account.demo .active_step .searchDropdown.searched.opened').find('.options_list').mCustomScrollbar("destroy");
	                        }
	                    }
	                } else if (target.closest('.checkbox_wrap').length) {
	                    var $input = target.closest('.checkbox_wrap').find('input');
	                    $input[0].checked = !$input[0].checked;
	                    $input.trigger('change');
					} else if (target.closest('.acknowledgment_wrap').length) {
						var $input = target.closest('.acknowledgment_wrap').find('input[type="checkbox"]');
						$input[0].checked = !$input[0].checked;
						var $acknowledgment_input = target.closest('.acknowledgment_wrap').find('input[name="eu_client_acknowledgment"]');
						if ($input[0].checked) {
							$acknowledgment_input.val(encodeURIComponent(target.closest('.acknowledgment_wrap').find('label').text()));
						} else {
							$acknowledgment_input.val(encodeURIComponent('WARNING: Unchecked acknowledgement'));
						}
						$input.trigger('change');
					}
	            }
	        }
	    });

	    $(document).on('change', '.wp-icm-open-account.demo .reffer_check input, .wp-icm-open-account.demo .joint_reffer_check input', function() {
	        if ($(this).prop('checked') == true) {
	            $('.wp-icm-open-account.demo .reffer_id, .wp-icm-open-account.demo .joint_reffer_id').fadeIn();
	            $('.wp-icm-open-account.demo #reffer_id, .wp-icm-open-account.demo #joint_reffer_id').attr('required', '');
	        } else {
	            $(this).removeProp('checked');
	            $('.wp-icm-open-account.demo #reffer_id, .wp-icm-open-account.demo #joint_reffer_id').removeAttr('required');
	            $('.wp-icm-open-account.demo .reffer_id, .wp-icm-open-account.demo .joint_reffer_id').fadeOut();
	        }
	    });

	    $('.wp-icm-open-account.demo .busaddr_check input').on('change', function() {
	        if ($(this).prop('checked') != true) {
	            $('.wp-icm-open-account.demo .busaddr_field').fadeIn();
	            $('.wp-icm-open-account.demo .busaddr_field input').attr('required', '');
	        } else {
	            $(this).prop('checked', 'checked');
	            $('.wp-icm-open-account.demo .busaddr_field input').removeAttr('required');
	            $('.wp-icm-open-account.demo .busaddr_field').fadeOut(function() {
	                $('.wp-icm-open-account.demo .registered_address_fields input').each(function() {
	                    var val = $(this).val(),
	                        fieldName = $(this).data('fieldName');
	                    $('.wp-icm-open-account.demo input[name="business_' + fieldName + '"]').val(val).parsley().validate();
	                    if (val) {
	                        $('.wp-icm-open-account.demo input[name="business_' + fieldName + '"]').parent().addClass('has-label');
	                    } else {
	                        $('.wp-icm-open-account.demo input[name="business_' + fieldName + '"]').parent().removeClass('has-label');
	                    }
	                });
	            });
	        }
	    });
		$('.wp-icm-open-account.demo #branch_id').attr('data-parsley-excluded', 'true');
	    $('.wp-icm-open-account.demo .register_form_wrap').on('blur', 'input[id*="mail"]', function() {
	        var el = $(this),
	            elP = $(this).parsley(),
	            val = $(this).val();

	        elP.removeError('emailUsed');
	        elP.reset();
	        if ($(el).val().length) {
	            el.attr({
	                'data-parsley-trigger': 'blur',
	                'data-parsley-excluded': 'true'
	            });
	            elP.validate();
	        }
	        if ($(this).parsley().isValid()) {
	            el.addClass('waiting_validation');
	            getSignTokenDemo().then(function(token) {
	                $.ajax({
	                    url: window['serverURL'] + '',
	                    data: { 'data': val, 'branch': window['currentBranchID'], 'getAction': 'check_branched_email', 'ip': window['userIP'], 'request_from': window['request_from'], 'sign': token },
	                    async: true,
	                    success: function(data) {
	                        el.attr({
	                            'data-parsley-excluded': 'false'
	                        }).removeClass('waiting_validation');
	                        el.removeAttr('data-parsley-validation-threshold data-parsley-email').parent().addClass('success').removeClass('error');
	                        elP.reset();
	                        elP.removeError('emailUsed');

	                        function getJoint1Email() {
	                            var ar = serializeFormToArrayDemo();
	                            var joint1Email = '';
	                            for (var i = 0; i < ar.length; i++) {
	                                var fieldName = ar[i].name;
	                                var fieldValue = ar[i].value;
	                                if (fieldName == 'email') {
	                                    joint1Email = fieldValue;
	                                    break;
	                                }
	                            }
	                            return joint1Email;
	                        }

	                        if (data == 'used') {
	                            elP.reset();
	                            elP.addError('emailUsed', { message: $('.reg_form_email_already_used').text(), updateClass: true });
	                            el.attr({
	                                'data-parsley-excluded': 'true'
	                            }).parent().addClass('error').removeClass('success');
	                        } else if (val === getJoint1Email() && getAccountTypeDemo() === 'joint') {
	                            elP.reset();
	                            elP.addError('emailUsed', { message: $('.reg_form_email_already_used_first_joint').text(), updateClass: true });
	                            el.attr({
	                                'data-parsley-excluded': 'true'
	                            }).parent().addClass('error').removeClass('success');
	                        }
	                    }
	                });
	            });
	        }
	    });
		function adformSubmitHandler() {
			window._adftrack = Array.isArray(window._adftrack) ? window._adftrack : (window._adftrack ? [window._adftrack] : []);
    		window._adftrack.push({
        		HttpHost: 'track.adform.net',
        		pm: 2514467,
        		divider: encodeURIComponent('|'),
        		pagename: encodeURIComponent('ICM_Demo_Subscription')
    		});
    		(function () { var s = document.createElement('script'); s.type = 'text/javascript';
			s.async = true; s.src = 'https://s2.adform.net/banners/scripts/st/trackpoint-async.js';
			var x = document.getElementsByTagName('script')[0]; x.parentNode.insertBefore(s, x); })();
		}
	    function continueOkDemo(curForm, curFormId, nextForm, nextFormId, block, _this) {
	        $('input#reg_type').val('demo');
	        var curProcLine = $('.wp-icm-open-account.demo .process_line[data-n="' + curFormId + '"]');
	        var nextProcLine = $('.wp-icm-open-account.demo .process_line[data-n="' + nextFormId + '"]');

	        if ($(_this).attr('type') == 'submit') {
				if(window['isItCySECWebSite'] || window.location.pathname.includes("global/de") || window.location.host.includes("-zht") ){
					adformSubmitHandler()
				}

	            var _that = _this;

	            var errorFields = preSubmitFormValidationDemo();
	            if (errorFields.length != 0) {
	                clearAllStepsCookiesDemo(false);
	                var err = errorFields.toString();
	                $('.wp-icm-open-account.demo .reg_modal_fail .reg_modal_explain').html(err);
	                $('.wp-icm-open-account.demo .reg_modal_fail, .wp-icm-open-account.demo .reg_overlay').fadeIn();
	                return false;
	            }

	            // sendGaDataDemo('submit', function () {
				if (window.location.pathname.includes("eu") || window.location.pathname.includes("au") || window.location.pathname.includes("intl") || window.location.pathname.includes("uk") || window.location.hostname.includes("eu") || window.location.hostname.includes("uk")) {
					$('.wp-icm-open-account .input_group.reffer_id #reffer_id').val('');

					if (Cookies.get('camp')) {
						Cookies.remove('camp');
					}
				} else {
					var camp = getURLParameters()['camp'];
					var reff = $('.wp-icm-open-account.demo #reffer_id').val();
					if (camp && !reff) {
						camp = camp.replace(/\D/g, ''); // strip non-digits
						$('.wp-icm-open-account.demo #reffer_id').val(camp);
					}
				}

	            var form = serializeFormDemo(); //$('.wp-icm-open-account.demo form').serialize(),
	            var btn = $(_that);
				var registered_date = new Date().toLocaleString();
				var registered_type = 'demo';
				var registered_email = $('#email').val();
	            if ($('.wp-icm-open-account.demo form').parsley().validate({ group: 'block-' + block })) {
	                btn.addClass('valid_wait').attr('disabled', 'disabled');
	                getSignTokenDemo().then(function(token) {
	                    form = form + '&ip=' + window['userIP'] + '&request_from=' + window['request_from'] + '&sign=' + token;
	                    $.ajax({
	                        type: 'POST',
	                        url: window['serverURL'],
	                        dataType: "json",
	                        data: form
	                    }).done(function(data) {
	                        btn.removeAttr('disabled').removeClass('valid_wait');
	                        if (data && data.status == 'success') {
	                            //alert('success')
	                            //Remove invitation cookie ONLY after success register
	                            //as referred friend by transferred 'invitation_guid':
	                            if (data.registeredFriendGuid && data.registeredFriendGuid == Cookies.get('invitation_guid')) {
	                                sendGaDataDemo('refer_a_friend_registered', function() {
	                                    Cookies.remove('invitation_guid');
	                                });
	                            }
	                            var curProcLine = $('.wp-icm-open-account.demo .process_line.current');
	                            var nextProcLine = curProcLine.next();
	                            curProcLine.toggleClass('current', false);
	                            nextProcLine.toggleClass('current', true);
	                            if (data.link) {
	                                sendGaDataDemo('reg_success', function() {
										if (localStorage) {
											localStorage.setItem('already-client', registered_email);
											localStorage.removeItem('visitor-tracking');
											var new_tracking = [];
											new_tracking.push(`registered before as [${registered_type}] with email [${registered_email}] at [${registered_date}]`);
											localStorage.setItem('visitor-tracking', JSON.stringify(new_tracking));
										}
										setTimeout(function() {
	                                        clearAllStepsCookiesDemo(false);
											var domain = window.location.href;
											if (domain.includes('localhost')) {
												domain = 'icmarkets.com';
											} else if (domain.includes('icmarkets')) {
												domain = 'icmarkets' + domain.split('icmarkets')[1];
											}
											domain = domain.split('\.')[0];
	                                        var link = data.link;
	                                        if (link.indexOf('?') === -1) {
	                                            link += '?demoregok=demoregok';
	                                        } else {
	                                            link += '&demoregok=demoregok';
	                                        }
	                                        link = link.replace(/\/ \//g, '/').replace(/%2f/g, '/').replace(/%3f/g, '?');
	                                        var _link = link.split('\.')
											var link_domain = _link[1];
											if (link_domain.includes('icmarkets') && domain != link_domain) {
												_link[1] = domain;
												link = _link.join('\.');
											}
	                                        $('.wp-icm-open-account.demo .reg_modal_finish .link-to-personal-area').attr('href', link);
	                                        window.location = link;
	                                    }, 300);
	                                    $('.wp-icm-open-account.demo .reg_overlay').fadeIn();
	                                });
	                            } else {
	                                sendGaDataDemo('reg_success', function() {
	                                    clearAllStepsCookiesDemo(false);
	                                    $('.wp-icm-open-account.demo .reg_modal_finish, .wp-icm-open-account.demo .reg_overlay').fadeIn();
	                                });
	                            }
	                        } else if (data && data.status == 'error') {
	                            sendGaDataDemo('reg_failure', function() {
	                                var err = null;
	                                try {
	                                    // '{"Code":"109","ErrorMessage":"Partner not found","Field":"CampaignId"}'
	                                    var json = JSON.parse(data.error);
	                                    err = json['ErrorMessage'];
	                                    if (json['Field']) {
	                                        err += ': ' + json['Field'];
	                                    }
	                                    if (json['Code']) {
	                                        err = '(' + json['Code'] + ') ' + err;
	                                    }
	                                } catch(e) {
	                                    console.error('ERROR: unable to parse error description', e.message);
	                                }
	                                if (err) {
	                                    $('.wp-icm-open-account.demo .reg_modal_fail .reg_modal_explain').html(err);
	                                }
	                                $('.wp-icm-open-account.demo .reg_modal_fail, .wp-icm-open-account.demo .reg_overlay').fadeIn();
									if (localStorage) {
										var pre_tracking = localStorage.getItem('visitor-tracking');
										if (pre_tracking) {
											pre_tracking = JSON.parse(pre_tracking);
										} else {
											pre_tracking = []
										}
										pre_tracking.push(`ERROR registration as [${registered_type}] with email [${registered_email}] at [${registered_date}]`);
										localStorage.setItem('visitor-tracking', JSON.stringify(pre_tracking));
									}
	                            });
	                        }
	                    }).fail(function(data) {
	                        sendGaDataDemo('reg_failure', function() {
	                            btn.removeAttr('disabled').removeClass('valid_wait');
	                            var resp = {};
	                            var err = null;
	                            if (data && data.responseText) {
	                                resp = JSON.parse(data.responseText);
	                                err = resp['error']['ErrorMessage'];
	                                if (resp['error']['Field']) {
	                                    err += ': ' + resp['error']['Field'];
	                                }
	                                if (resp['error']['Code']) {
	                                    err = '(' + resp['error']['Code'] + ') ' + err;
	                                }
	                            } else {
	                                if (typeof data == 'string' && data.indexOf('[ErrorMessage]') !== -1) {
	                                    err = data.split('[ErrorMessage] => ')[1].split('    [')[0];
	                                } else {
	                                    err = data.responseText || data.statusText;
	                                }
	                            }
	                            if (err) {
	                                $('.wp-icm-open-account.demo .reg_modal_fail .reg_modal_explain').html(err);
	                            }
	                            $('.wp-icm-open-account.demo .reg_modal_fail, .wp-icm-open-account.demo .reg_overlay').fadeIn();
								if (localStorage) {
									var pre_tracking = localStorage.getItem('visitor-tracking');
									if (pre_tracking) {
										pre_tracking = JSON.parse(pre_tracking);
									} else {
										pre_tracking = []
									}
									pre_tracking.push(`ERROR registration as [${registered_type}] with email [${registered_email}] at [${registered_date}]`);
									localStorage.setItem('visitor-tracking', JSON.stringify(pre_tracking));
								}
							});
	                    });
	                });
	                return false;
	            }
	            // });
	        } else {
	            sendGaDataDemo('step' + curFormId, function() {
	                var formSerialized = serializeFormToArrayDemo($(curForm).find('input')); //$(curForm).find('input').serializeArray();
	                Cookies.set('step_' + curFormId, JSON.stringify(formSerialized), { expires: 365 });
	                Cookies.set('lastStep', curFormId, { expires: 365 });
	                if (curFormId == '2' && formSerialized[0].value == 'joint')
	                    Cookies.set('jointSteps', 1, { expires: 365 });
	                $('.wp-icm-open-account.demo .register_form').find('input').removeAttr('required');
	                if (!$('.wp-icm-open-account.demo input[id*="mail"]').hasClass('waiting_validation')) {
	                    curForm.fadeOut('fast', function() {
	                        setTimeout(function() {
	                            curProcLine.removeClass('current');
	                        }, 50);
	                        setTimeout(function() {
	                            curProcLine.addClass('complete');
	                        }, 150);
	                        nextForm.fadeIn('fast', function() {
	                            // $('body,html').animate({
	                            //     scrollTop: 0
	                            // }, 400);
	                        }).addClass('active_step').find('input').attr('required', '');
	                        $('.wp-icm-open-account.demo input[type="checkbox"]').removeAttr('required');
	                        $('.wp-icm-open-account.demo .australian_test_wrap input').removeAttr('required');
	                        $('.wp-icm-open-account.demo #reffer_id, .wp-icm-open-account.demo #joint_reffer_id, .wp-icm-open-account.demo #busaddr').removeAttr('required');
	                        $('.wp-icm-open-account.demo .fields_corporate input').removeAttr('required');
	                        $('.wp-icm-open-account.demo .australian_test_wrap input').removeAttr('required');
	                        nextProcLine.addClass('current');
	                    }).removeClass('active_step');
	                }
	            });
	        }
	    }

	    $('.wp-icm-open-account.demo .main_register_wrap ').on('click', '.next_btn button', function(e) {
	        e.preventDefault();
	        if ($(e.target).hasClass('valid_wait')) return false;

	        var curForm = $(this).parent().parent();
	        var prevForm = $(this).parent().parent().prev('.register_form');
	        var nextForm = $(this).parent().parent().next('.register_form');
	        var curFormId = curForm.data('n');
	        var nextFormId = curFormId + 1;
	        var block = curFormId - 1;

			if ($('.wp-icm-open-account.demo input[id*="mail"]').hasClass('parsley-error')) {
				return false;
			} else if ($('.wp-icm-open-account.demo form').parsley().validate({ group: 'block-' + block })) {
				if ($('.wp-icm-open-account.demo input[id*="mail"]').hasClass('waiting_validation')) {
	                $(this).addClass('valid_wait');
	                var nextBtn = $(this),
	                    waiValidat = setInterval(function() {
	                        if (!$('.wp-icm-open-account.demo input[id*="mail"]').hasClass('waiting_validation')) {
	                            nextBtn.removeClass('valid_wait');
	                            $(nextBtn).click();
	                            clearInterval(waiValidat);
	                        }
	                    }, 100);
					return false;
	            }

	            var $countriesInput = $('.wp-icm-open-account.demo #countries');
	            var btn = $(e.target);
	            btn.addClass('valid_wait').attr('disabled', 'disabled');
	            var _curForm = curForm,
	                _curFormId = curFormId,
	                _nextForm = nextForm,
	                _nextFormId = nextFormId,
	                _block = block,
					_this = this;
				if (curFormId == '1') collectUnsupportedAndDisallowedCountriesDemo();
	            if (curFormId == '1' && window['unsupportedCountries'].indexOf($countriesInput.val()) != -1) {
	                window['selectedAccountType'] = 'simple';
	                sendGaDataDemo('step' + curFormId, function() {
	                    $('input#reg_type').val('simple');
	                    var form = serializeFormDemo();
	                    if ($('.wp-icm-open-account.demo form').parsley().validate({ group: 'block-' + block })) {
	                        getSignTokenDemo().then(function(token) {
	                            form = form + '&ip=' + window['userIP'] + '&request_from=' + window['request_from'] + '&sign=' + token;
	                            $.ajax({
	                                type: 'POST',
	                                url: window['serverURL'],
	                                dataType: "json",
	                                data: form
	                            }).done(function() {
	                                btn.removeAttr('disabled').removeClass('valid_wait');
	                                var unsupportedCountryName = $countriesInput.val();
	                                showUnsupportedCountryPopupDemo(unsupportedCountryName, function() {
	                                    continueOkDemo(_curForm, _curFormId, _nextForm, _nextFormId, _block, _this);
	                                }, function() {
	                                    clearAllStepsCookiesDemo(true);
	                                    return false;
	                                });
	                            }).fail(function() {
	                                btn.removeAttr('disabled').removeClass('valid_wait');
	                                var unsupportedCountryName = $countriesInput.val();
	                                showUnsupportedCountryPopupDemo(unsupportedCountryName, function() {
	                                    continueOkDemo(_curForm, _curFormId, _nextForm, _nextFormId, _block, _this);
	                                }, function() {
	                                    clearAllStepsCookiesDemo(true);
	                                    return false;
	                                });
	                            });
	                        });
	                    }
	                });
	            } else if (curFormId == '1' && window['disallowedCountries'].indexOf($countriesInput.val()) != -1) {
	                window['selectedAccountType'] = 'simple';
	                sendGaDataDemo('step' + curFormId, function() {
	                    $('input#reg_type').val('simple');
	                    var form = serializeFormDemo();
	                    if ($('.wp-icm-open-account.demo form').parsley().validate({ group: 'block-' + block })) {
	                        getSignTokenDemo().then(function(token) {
	                            form = form + '&ip=' + window['userIP'] + '&request_from=' + window['request_from'] + '&sign=' + token;
	                            $.ajax({
	                                type: 'POST',
	                                url: window['serverURL'],
	                                dataType: "json",
	                                data: form
	                            }).done(function() {
	                                btn.removeAttr('disabled').removeClass('valid_wait');
	                                var disallowedCountryName = $countriesInput.val();
	                                showDisallowedCountryPopupDemo(disallowedCountryName, function() {
	                                    clearAllStepsCookiesDemo(true);
	                                    return false;
	                                }, function() {
	                                    clearAllStepsCookiesDemo(true);
	                                    return false;
	                                });
	                            }).fail(function() {
	                                btn.removeAttr('disabled').removeClass('valid_wait');
	                                var disallowedCountryName = $countriesInput.val();
	                                showDisallowedCountryPopupDemo(disallowedCountryName, function() {
	                                    clearAllStepsCookiesDemo(true);
	                                    return false;
	                                }, function() {
	                                    clearAllStepsCookiesDemo(true);
	                                    return false;
	                                });
	                            });
	                        });
	                    }
	                });
	                return false;
	            } else {
					continueOkDemo(curForm, curFormId, nextForm, nextFormId, block, this);
	            }
	        }
	    });

	    $('.wp-icm-open-account.demo .reg_lang').addClass('closed').on('click', function() {
	        $('.wp-icm-open-account.demo .reg_lang').removeClass('closed').addClass('opened');
	    });
	    $('.wp-icm-open-account.demo .register_form').each(function(index, section) {
	        $(section).find('input').attr({
	            'data-parsley-group': 'block-' + index,
	            'autocomplete': 'off',
	            'data-parsley-validation-threshold': '0',
	            'data-parsley-trigger': 'keyup change'
	        });
	    });
	    $('.wp-icm-open-account.demo form').parsley({
	        'data-parsley-focus': 'none'
	    });
	    $('.wp-icm-open-account.demo .fields_corporate input, .wp-icm-open-account.demo .fields_joint input').removeAttr('data-parsley-group');

	    var referFriendGuid = Cookies.get('invitation_guid');
	    var $referFriendGuid = $('.wp-icm-open-account.demo #invitation_guid');
	    if (referFriendGuid && $referFriendGuid.length) {
	        $referFriendGuid.val(referFriendGuid);
	    }

		clearAllStepsCookiesDemo(false);
	    goToStepDemo(1);

	    function goToStepDemo(id) {
	        if (Cookies.get('au_test_block')) {
	            $('.wp-icm-open-account.demo .reg_modal_block, .wp-icm-open-account.demo .reg_overlay').fadeIn();
	            $('.wp-icm-open-account.demo .main_register_wrap').addClass('disabled');
	            return false;
	        }
	        $('.wp-icm-open-account.demo .register_form').removeClass('active_step').find('input').removeAttr('required');
	        $('.wp-icm-open-account.demo .register_form[data-n="' + id + '"]').fadeIn()
	            .addClass('active_step')
	            .find('input').each(function() {
	                if ($(this).attr('id') != 'partner_id') {
	                    $(this).attr('required', '');
	                }
	            });
	        $('.wp-icm-open-account.demo input[type="checkbox"]').removeAttr('required');
	        $('.wp-icm-open-account.demo #reffer_id, .wp-icm-open-account.demo #joint_reffer_id, .wp-icm-open-account.demo #busaddr').removeAttr('required');
	        $('.wp-icm-open-account.demo .fields_corporate input').removeAttr('required');
	        $('.wp-icm-open-account.demo .australian_test_wrap input').removeAttr('required');
	        $('.wp-icm-open-account.demo .process_line').removeClass('complete').removeClass('current');
	        for (var i = 0; i < id; i++) {
	            $('.wp-icm-open-account.demo .process_line[data-n="' + i + '"]').addClass('complete');
	        }
	        $('.wp-icm-open-account.demo .process_line:first-child').addClass('complete');
	        $('.wp-icm-open-account.demo .process_line[data-n="' + id + '"]').addClass('current');
	        $('.wp-icm-open-account.demo #invitation_guid').removeAttr('required');
	        $('.wp-icm-open-account.demo #info').removeAttr('required');

	        if (id === 1) {
	            referFriendGuid = Cookies.get('invitation_guid');
	            $referFriendGuid = $('.wp-icm-open-account.demo #invitation_guid');
	            if (referFriendGuid && $referFriendGuid.length) {
	                $referFriendGuid.val(referFriendGuid);
	            }

				if (window.location.pathname.includes("eu") || window.location.pathname.includes("au") || window.location.pathname.includes("intl") || window.location.pathname.includes("uk") || window.location.hostname.includes("eu") || window.location.hostname.includes("uk")) {
					$('.wp-icm-open-account .input_group.reffer_id #reffer_id').val('');

					if (Cookies.get('camp')) {
						Cookies.remove('camp');
					}
				} else {
					var camp = Cookies.get('camp');
					var $ref = $('.wp-icm-open-account.demo #reffer_id');
					if (camp && $ref.length) {
						camp = camp.replace(/\D/g, ''); // strip non-digits
						$ref.val(camp);
						$ref.parent().toggleClass('has-label', true);
						$('.wp-icm-open-account.demo .reffer_check input').prop('checked', true).change();
					}
				}

	            var cName;
	            var $input;
	            var $countriesInput = $('.wp-icm-open-account.demo #countries');
	            if ($countriesInput.val() === '' && !($('html').is('.bs-host-1') && window['countryFrom'] == 'au')) {
					var cCode = window['userLocationByIP'].countryCode;
					if (window['isSupportedCurrentBranch'] !== '1') {
						// Auto prefill even not allowed countries (ex. Australia on CySEC)
						// cCode = window['suggestedCountry'].toUpperCase();
					}
					if (Cookies.get('reg_force_country')) {
						cCode = Cookies.get('reg_force_country').toUpperCase();
						Cookies.remove('reg_force_country');
					}
					if (cCode) {
						var n = getCountryNameByCodeDemo(cCode);
						var cOrig = n.orig;
						cName = cOrig;
						$countriesInput.val(cName);
						$countriesInput.attr('data-orig', cOrig);
						$countriesInput.attr('data-mlkey', n.mlkey);
						$countriesInput.focusout();
						toggleRefferControls(cCode.toLowerCase());
						fillPhoneCodeLabelByCountryNameDemo(cOrig);

						var countryObject;
						countryObject = getCountryObjectByName(cOrig);
						initBranchesList(countryObject, $('#branchesList'));
						var sg_branch = null;
						if (Cookies.get('regulator')) {
							sg_branch = Cookies.get('regulator');

							var isSelectedBranchAllowedForSelectedCountry = false;
							var country = window['serverCountries'].find(function (item) {
								return item && item.code === cCode;
							});
							if (country && country.branching) {
								var selectedBranchForSelectedCountry = country.branching.find(function (item) {
									return item && item.branch === sg_branch;
								});
								if (selectedBranchForSelectedCountry && selectedBranchForSelectedCountry.status !== '4') {
									isSelectedBranchAllowedForSelectedCountry = true;
								}
							}
						}
						setBranch($('.wp-icm-open-account.demo #branch_id'), cCode, sg_branch, true);
						showPopupModalIfNeeded(cCode.toLowerCase());
					}
				}
	        }
	    }

	    function getCountryNameByCodeDemo(countryCode) {
	        var countries = window['serverCountries'];
	        var orig = window['userLocationByIP'].countryName; // default from IP location
	        var localized = orig;
	        var mlkey = 'reg_form_country_';
	        if (countries && countries.length) {
	            for (var i = 0, len = countries.length; i < len; i++) {
	                var countryObject = countries[i];
	                if (countryObject && countryObject.code === countryCode) {
	                    orig = countryObject.name; // from server countries list
	                    localized = orig;
	                    mlkey += countryCode;
	                    break;
	                }
	            }
	        }
	        return {
	            orig: orig,
	            localized: localized,
	            mlkey: mlkey
	        };
	    }

	    function getCountryNameByIDDemo(countryID) {
	        if (typeof countryID == 'string') {
	            countryID = parseInt(countryID, 10);
	        }
	        var countries = window['serverCountries'];
	        var orig = window['userLocationByIP'].countryName; // default from IP location
	        var localized = orig;
	        var mlkey = 'reg_form_country_';
	        if (countries && countries.length) {
	            for (var i = 0, len = countries.length; i < len; i++) {
	                var countryObject = countries[i];
	                if (countryObject && countryObject.id === countryID) {
	                    orig = countryObject.name; // from server countries list
	                    var countryCode = countryObject.code;
	                    if (countryCode) {
	                        localized = orig;
	                        mlkey += countryCode.toLowerCase();
	                    }
	                    break;
	                }
	            }
	        }
	        return {
	            orig: orig,
	            localized: localized,
	            mlkey: mlkey
	        };
	    }

        function getBranchByCountryNameDemo(countryName) {
            var countries = window['serverCountries'];
            var branch = '3';
            if (countries && countries.length) {
                for (var i = 0, len = countries.length; i < len; i++) {
                    var countryObject = countries[i];
                    if (countryObject && countryObject.name === countryName) {
                        branch = countryObject.branch; // from server countries list
                        break;
                    }
                }
            }
            return branch;
        }

        function fillPhoneCodeLabelByCountryNameDemo(countryName) {
            var tel = getPhoneCodeByCountryNameDemo(countryName);
            var branch = window['currentBranch'];
            $input = $('.wp-icm-open-account.demo input#phone');
            var form = $('.wp-icm-open-account.demo .register_form.active_step');
            $input.val(tel);
            $input.parent().toggleClass('has-label', true);
        }

        function getPhoneCodeByCountryNameDemo(countryName) {
            var countries = window['serverCountries'];
            var tel = '';
            if (countries && countries.length) {
                for (var i = 0, len = countries.length; i < len; i++) {
                    var countryObject = countries[i];
                    if (countryObject && countryObject.name === countryName) {
                        tel = countryObject.tel; // from server countries list
                        break;
                    }
                }
            }
            tel = tel.replace(/ /g, '');
            return tel;
        }

	    $(document).on('click', '.wp-icm-open-account.demo .reg_overlay, .wp-icm-open-account.demo .reg_modal_close_btn', function() {
	        if (!$('.wp-icm-open-account.demo .main_register_wrap').hasClass('disabled')) {
	            $('.wp-icm-open-account.demo .reg_modal_continue, .wp-icm-open-account.demo .reg_overlay, .wp-icm-open-account.demo .reg_modal_test, .wp-icm-open-account.demo .reg_modal_fail').fadeOut();
	            if ($('.reg_modal_finish').css('display') !== 'none') {
	                clearAllStepsCookiesDemo();
	                goToStepDemo(1);
	                $('.reg_modal_finish').fadeOut();
	            }
	        }
	    }).on('click', '.wp-icm-open-account.demo #fail_try_again', function() {
	        $('.wp-icm-open-account.demo .reg_modal_fail').fadeOut();
	        clearAllStepsCookiesDemo();
	        goToStepDemo(1);
	    });

	    function clearAllStepsCookiesDemo(force_reload_page) {
	        if (typeof force_reload_page == 'undefined') {
	            force_reload_page = true;
	        }
	        Cookies.remove('au_test');
	        Cookies.remove('au_test_block');
	        Cookies.remove('lastStep');
	        Cookies.remove('jointSteps');
	        Cookies.remove('step_1');
	        Cookies.remove('step_2');
	        Cookies.remove('step_3');
	        Cookies.remove('step_4');
	        Cookies.remove('step_5');
	        Cookies.remove('step_6');
	        Cookies.remove('step_7');
	        if (force_reload_page) {
				$('.wp-icm-open-account.demo form').find('input').val('');
				window.location.reload(true); // for initialize form properly
	        }
	    }

	    window.Parsley.on('field:error', function() {
	        if (this.$element.parent().find('li').hasClass('parsley-emailUsed'))
	            this.$element.parent().find('li.parsley-emailUsed').remove();
	        if (this.$element.parent().hasClass('select_btn')) {
	            this.$element.parent().parent().addClass('error').removeClass('success');
	        } else {
	            this.$element.parent().addClass('error').removeClass('success');
	        }
	    });

	    window.Parsley.on('field:success', function() {
	        if (this.$element.parent().hasClass('select_btn')) {
	            this.$element.parent().parent().removeClass('error').addClass('success');
	        } else {
	            this.$element.parent().removeClass('error').addClass('success');
	        }
	        if (this.$element.data('fieldName') == 'birth_month') {
	            $('.wp-icm-open-account.demo .birthdate input[data-field-name="birth_month"]').val(this.$element.val());
	        }
	    });

	    window.Parsley.on('form:error', function() {});

	    function localizeParsleyMessagesDemo() {}

	    function updateCustomValidatorsDemo() {
	        if (window.Parsley._validatorRegistry.validators && window.Parsley._validatorRegistry.validators['phoneprefix']) {
	            window.Parsley.removeValidator('phoneprefix');
	        }
	        window.Parsley.addValidator('phoneprefix', {
	            validateString: function(val) {
	                function checkPhone(data) {
	                    var check = false;
	                    var country = $('#countries').val();
	                    var tel = getPhoneCodeByCountryNameDemo(country);
	                    if (data.length > tel.length && data.length > 6) {
	                        if ((/^\+(\d[\s\-_]?){8,}$/g).test(data)) {
	                            check = true;
	                        }
	                    }
	                    return check;
	                }
	                return checkPhone(val);
	            },
	            messages: {
	                en: $('.reg_form_inputs_phone_number').text()
	            }
	        });

	        if (window.Parsley._validatorRegistry.validators && window.Parsley._validatorRegistry.validators['dropdown']) {
	            window.Parsley.removeValidator('dropdown');
	        }
	        window.Parsley.addValidator('dropdown', {
	            // requirementType: 'string',
	            validateString: function(val) {
	                function getCountriesCheck(countries) {
	                    var check = false;
	                    $.each(countries, function(value, item) {
	                        if (item.name.toLowerCase() === val.toLowerCase()) {
	                            check = true;
	                        }
	                        var countryCode = item.code;
	                        var localizedName = item.name;
	                        if (localizedName) {
	                            if (localizedName.toLowerCase() === val.toLowerCase()) {
	                                check = true;
	                            }
	                        }
	                    });
	                    return check;
	                }

	                function checkDrop() {
	                    var check = false;
	                    if (window['serverCountries']) {
	                        check = getCountriesCheck(window['serverCountries']);
	                    } else {
	                        console.error('ERROR: no serverCountries');
	                    }
	                    return check;
	                }
	                return checkDrop();
	            },
	            messages: {
	                en: $('.reg_form_inputs_use_letters').text()
	            }
	        });
	    }

	    function serializeFormToArrayDemo(form) {
	        form = form || $('.wp-icm-open-account.demo form');
	        // change country val to en
	        var $countriesInput = $('.wp-icm-open-account.demo input#countries');
	        var localizedValue = $countriesInput.val();
	        var enValue = $countriesInput.attr('data-orig');
	        $countriesInput.val(enValue);
            // change branch value to id
            var $branchInput = $('.wp-icm-open-account.demo input#branch_id');
            var branchValue = $branchInput.val();
            $branchInput.val($branchInput.attr('data-orig'));

            var serialized = form.serializeArray();

	        // change country val to localize
	        $countriesInput.val(localizedValue);
            // change branch val to temp
            $branchInput.val(branchValue);

	        return serialized;
	    }

	    function serializeFormDemo() {
	        var form = $('.wp-icm-open-account.demo form');
	        // change country val to en
	        var $countriesInput = $('.wp-icm-open-account.demo input#countries');
	        var localizedValue = $countriesInput.val();
	        var enValue = $countriesInput.attr('data-orig');
	        $countriesInput.val(enValue);
            // change branch value to id
            var $branchInput = $('.wp-icm-open-account.demo input#branch_id');
            var branchValue = $branchInput.val();
            $branchInput.val($branchInput.attr('data-orig'));

	        var serialized = form.serialize();

	        // change country val to localize
	        $countriesInput.val(localizedValue);
            // change branch val to temp
            $branchInput.val(branchValue);

	        return serialized;
	    }

	    function preSubmitFormValidationDemo() {
	        var errorFields = [];
	        var requiredFields = [
	            "first_name",
	            "last_name",
	            "email",
	            //"newsletter",
	            "country",
	            //"state",
	            "phone",
	            //"reffer_id",
	            //"invitation_guid",
	            "reg_type"
	        ];
	        var form = serializeFormToArrayDemo();
	        var isFieldPresent = function(fields, field_name) {
	            var res = false;
	            var field = null;
	            for (var i in fields) {
	                if (fields.hasOwnProperty(i)) {
	                    field = fields[i];
	                    if (field['name'] == field_name) {
	                        res = true;
	                        break;
	                    }
	                }
	            }
	            return res;
	        };
	        var field = null;
	        for (var i in form) {
	            if (form.hasOwnProperty(i)) {
	                field = form[i];
	                if (!field['value'] && requiredFields.indexOf(field['name']) != -1) {
	                    errorFields.push(field['name'] + " (invalid value)");
	                }
	            }
	        }
	        for (var i in requiredFields) {
	            if (requiredFields.hasOwnProperty(i)) {
	                var field_name = requiredFields[i];
	                if (!isFieldPresent(form, field_name)) {
	                    errorFields.push(field_name + " (absent property)");
	                }
	            }
	        }

	        return errorFields;
	    }

	    function showUnsupportedCountryPopupDemo(countryName, callback_ok, callback_cancel) {
	        $('.wp-icm-open-account.demo .reg_modal_unsupported_country .unsupported_country').html(countryName);
	        $('.wp-icm-open-account.demo .reg_modal_unsupported_country, .wp-icm-open-account.demo .reg_overlay').fadeIn();

	        function cancelHandler(e, callback_cancel) {
	            $('.wp-icm-open-account.demo .reg_modal_unsupported_country, .wp-icm-open-account.demo .reg_overlay').fadeOut();
	            if (callback_cancel) {
	                callback_cancel();
	            }
	        }

	        $('.wp-icm-open-account.demo .reg_modal_unsupported_country .unsupported_ok').off('click');
	        $('.wp-icm-open-account.demo .reg_modal_unsupported_country .unsupported_cancel').off('click', cancelHandler);
	        $('.wp-icm-open-account.demo .reg_modal_unsupported_country .reg_modal_close_btn').off('click', cancelHandler);
	        $('.wp-icm-open-account.demo .reg_overlay').off('click', cancelHandler);

	        $('.wp-icm-open-account.demo .reg_modal_unsupported_country .unsupported_ok').on('click', function() {
	            $('.wp-icm-open-account.demo .reg_modal_unsupported_country, .wp-icm-open-account.demo .reg_overlay').fadeOut();
	            if (callback_ok) {
	                callback_ok();
	            }
	        });
	        $('.wp-icm-open-account.demo .reg_modal_unsupported_country .unsupported_cancel').on('click', function(e) {
	            cancelHandler(e, callback_cancel);
	        });
	        $('.wp-icm-open-account.demo .reg_modal_unsupported_country .reg_modal_close_btn').on('click', function(e) {
	            cancelHandler(e, callback_cancel);
	        });
	        $('.wp-icm-open-account.demo .reg_overlay').on('click', function(e) {
	            cancelHandler(e, callback_cancel);
	        });
	    }

	    function showDisallowedCountryPopupDemo(countryName, callback_ok) {
	        $('.wp-icm-open-account.demo .reg_modal_disallowed_country .disallowed_country').html(countryName);
	        $('.wp-icm-open-account.demo .reg_modal_disallowed_country, .wp-icm-open-account.demo .reg_overlay').fadeIn();

	        function okHandler() {
	            $('.wp-icm-open-account.demo .reg_modal_disallowed_country, .wp-icm-open-account.demo .reg_overlay').fadeOut();
	            if (callback_ok) {
	                callback_ok();
	            }
	        }

	        $('.wp-icm-open-account.demo .reg_modal_disallowed_country .disallowed_ok').off('click');
	        $('.wp-icm-open-account.demo .reg_modal_disallowed_country .reg_modal_close_btn').off('click', okHandler);
	        $('.wp-icm-open-account.demo .reg_overlay').off('click', okHandler);

	        $('.wp-icm-open-account.demo .reg_modal_disallowed_country .disallowed_ok').on('click', okHandler);
	        $('.wp-icm-open-account.demo .reg_modal_disallowed_country .reg_modal_close_btn').on('click', okHandler);
	        $('.wp-icm-open-account.demo .reg_overlay').on('click', okHandler);
	    }

	    function sendGaDataDemo(data, callback) {
	        if (data && callback) {
                var gaDemoAvailable = true;
                var gaDemoFired = false;
                var gaDemoTimeout = setTimeout(function () {
                    if (!gaDemoFired) {
                        gaDemoAvailable = false;
                        callback();
                    }
                }, 2000);
				try{
					ga('send', 'event', 'Register New Demo Account' + (window['landingPage'] ? ' (from Landing Page)' : ''), 'demo_' + data, {
						hitCallback: function() {
							if (gaDemoAvailable) {
								gaDemoFired = true;
								if (gaDemoTimeout) clearTimeout(gaDemoTimeout);
								callback();
							}
						}
					});
				}catch(error){}

	        } else {
	            console.error('ERROR: function sendGaDataDemo (data, callback)', data, callback);
	        }
	    }

        function getCountryObjectByCode(countryCode) {
            if (!countryCode) return null;
            return window['serverCountries'].find(function (sc) { return sc.code === countryCode; });
        }

        function getCountryObjectByName(countryName) {
            if (!countryName) return null;
            return window['serverCountries'].find(function (sc) { return sc.name === countryName; });
        }
    }
	function initBranchesList (countryObject, $branchesSelect) {
		var branchesList = window['serverBranches'];
		$branchesSelect = $branchesSelect || $('#branchesList');
		var supportedBranches = [];
		if (countryObject) {
			// remove FSA branch from the list on .eu website
			var is_it_eu = $('html').is('.branch-2')
			supportedBranches = countryObject.branching.filter(function (cb) { return is_it_eu ? cb.status != '4' && cb.branch != '1' : cb.status != '4'; });
			if (supportedBranches && supportedBranches.length) {
				supportedBranches = supportedBranches.map(function (sb) { return sb.branch; });
			}
		}
		$branchesSelect.html('');
		if (branchesList && branchesList.length) {
			branchesList.reduce(
				function(parent, item) {
					if (supportedBranches && supportedBranches.length) {
						var isBranchSupported = supportedBranches.indexOf(item.ID) !== -1;
						if (isBranchSupported) {
							var name = $('.cached-translation.reg_form_branch_' + item.Name.toLowerCase()).text();
							return parent.append($('<li data-id="' + item.ID + '" data-orig="' + item.ID + '">' + name + '</li>'));
						}
					}
					return parent;
				},
				$branchesSelect
			);
		}
	}
	function getURLParameters() {
		var url = window.location.href;
		var result = {};
		var searchIndex = (typeof url == 'string') ? url.indexOf("?") : -1;
		if (searchIndex == -1) return result;
		var sPageURL = url.substring(searchIndex + 1);
		var sURLVariables = sPageURL.split('&');
		for (var i = 0; i < sURLVariables.length; i++) {
			var sParameterName = sURLVariables[i].split('=');
			result[sParameterName[0]] = sParameterName[1];
		}
		return result;
	}

/***/ })
/******/ ]);

function toggleRefferControls (countryCode) {
	$('.wp-icm-open-account .input_group.reffer_id').hide();
	if (window.location.pathname.includes("eu") || window.location.pathname.includes("au") || window.location.pathname.includes("intl") || window.location.pathname.includes("uk") || window.location.hostname.includes("eu") || window.location.hostname.includes("uk")) {
		$('.wp-icm-open-account .input_group.reffer_check').hide();
		$('.wp-icm-open-account .input_group.reffer_id #reffer_id').val('');

		if (Cookies.get('camp')) {
			Cookies.remove('camp');
		}
	} else {
		$('.wp-icm-open-account .input_group.reffer_check').show();
		if ($('.wp-icm-open-account .input_group.reffer_check').prop('checked') == true) {
			$('.wp-icm-open-account .input_group.reffer_id').show();
		}
	}
}

function toggleAsknowledge (countryCode) {
	let branch = window['currentBranch'];
	$('.register_form_wrap').attr('data-branch', branch);
	$('body').attr('data-branch', branch);
	// just uncomment it only when will required!
	if (!window['isItCySECWebSite'] && branch == 2) {
		$('#redirect-country').html($('#countries').val());
		$('#redirect-url').html('<a id="demo_registration_link" href="' + window['cysecWebsiteURL'] + '/open-trading-account/demo">' + window['cysecWebsiteName'] + '</a>');
		$('body').toggleClass('redirect', true);
	} else {
		$('#redirect-country').html('');
		$('#redirect-url').html('');
		$('body').toggleClass('redirect', false);
	}

	var $acknowledgment = $('#acknowledgment');
	var $acknowledgment_wrap = $acknowledgment.parent();
	if (!window['isItCySECWebSite'] && branch != 2 && window['cysecCountriesString'].indexOf((countryCode || '**').toLowerCase()) !== -1) {
		$acknowledgment_wrap.find('label').html($('.cached-translation.reg_form_eu_clients_acknowledgment_branch' + branch).html());
		$acknowledgment.attr('required', '');
		$acknowledgment_wrap.show();
	} else {
		$acknowledgment_wrap.find('label').html('');
		$acknowledgment.removeAttr('required');
		$acknowledgment_wrap.hide();
	}
}
