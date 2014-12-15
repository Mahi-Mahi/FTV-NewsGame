'use strict';

angular.module('newsGameApp')
	.factory('dataService', function($http, $q, config, baseurl) {
		return {
			data: {},
			load: function(id) {
				var defer = $q.defer();
				var data = this.data;

				$http.get(baseurl + '/data/settings.json')
					.success(function(response) {
						data.settings = response;
						// defer.resolve(response);

						$http.get(baseurl + '/data/' + id + '.json')
							.success(function(response) {
								data[id] = response;
								defer.resolve(response);
							});

					});

				return defer.promise;
			}
		};
	});