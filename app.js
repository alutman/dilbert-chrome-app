var app = angular.module("dilbert", []);

app.controller("MainCtrl", ["$scope", "$filter", "$http", function($scope, $filter, $http) {
    var xmlLoad = function(url, callback) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'blob';
        xhr.onload = function(e) {
          document.getElementById("comic").src = window.URL.createObjectURL(this.response);
          callback();
        };

        xhr.send();
    }
    var formatDate = function(date) {
        return $filter('date')(date, 'yyyy-MM-dd');
    }
    var saveDate = function() {
        chrome.storage.local.set({'lastDate': $scope.date});
    }

    chrome.storage.local.get('lastDate', function(res){
        if(res != undefined && res.lastDate != undefined) {
            var d = new Date(res.lastDate);
            if(!isNaN(d.valueOf())) {
                $scope.date = res.lastDate;
                $scope.load();
                return;
            }
        }
        $scope.today();
    });
    
    $scope.today = function() {
        $scope.date = formatDate(new Date());
        $scope.load();
    };

    $scope.back = function() {
        var dObj = new Date($scope.date);
        dObj.setDate(dObj.getDate()-1);
        $scope.date = formatDate(dObj);
        $scope.load();
    };
    $scope.forward = function() {
        var dObj = new Date($scope.date);
        dObj.setDate(dObj.getDate()+1);
        $scope.date = formatDate(dObj);
        $scope.load();
    };

    $scope.setLoading = function(b) {
        $scope.loading = b;
    }
    var baseUrl = "http://dilbert.com/strip";
    $scope.load = function() {
        $scope.setLoading(true);
        var req = {
            method: 'GET',
            url: baseUrl+"/"+$scope.date
        };
        $http(req).then(
            function(data) {
                var elements = $.parseHTML(data.data);
                var found  = $('.img-comic', elements)[0].src;
                var cb = function() {
                    $scope.setLoading(false);
                    $scope.$digest();
                };
                xmlLoad(found, cb);
                saveDate();
            },
            function(data) {
                console.error(data);
                $scope.setLoading(false);
            });

    };



}]);