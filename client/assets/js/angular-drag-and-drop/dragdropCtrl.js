var app = angular.module("app");
app.controller("dragDropCtrl", ["$scope", function ($scope) {
    $scope.data = [
        { name: "Anik Islam", age: 22, gender: "Male" },
        { name: "Mofijul Islam", age: 21, gender: "Male" },
        { name: "Tanveer Islam", age: 24, gender: "Male" },
        { name: "Arifa Akter", age: 22, gender: "Female" },
        { name: "Shayla Islam", age: 22, gender: "Female" }

    ];
    $scope.dataWithProperty = [
        { name: "Anik Islam", age: 22, gender: "Male" },
        { name: "Mofijul Islam", age: 21, gender: "Male" },
        { name: "Tanveer Islam", age: 24, gender: "Male" },
        { name: "Arifa Akter", age: 22, gender: "Female" },
        { name: "Shayla Islam", age: 22, gender: "Female" }

    ];
    $scope.properties = "age,gender";
    $scope.dataComplex = [
        {
            name: "Anik Islam", age: 22, gender: "Male", education: [{
                institution: "American International University"
            }, {
                institution: "Dania College"
            },
            {
                institution: "A.K. High School"
            }]
        },
         {
             name: "Mofijul Islam", age: 21, gender: "Male", education: [{
                 institution: "University of Dhaka"
             }, {
                 institution: "Dania College"
             },
             {
                 institution: "A.K. High School"
             }]
         },
          {
              name: "Tanveer Islam", age: 24, gender: "Male", education: [{
                  institution: "United University"
              }, {
                  institution: "East West University"
              },  {
                  institution: "American International University"
              }, {
                  institution: "Dania College"
              },
              {
                  institution: "A.K. High School"
              }]
          },
           {
               name: "Shayla Islam", age: 22, gender: "Male", education: [{
                   institution: "Eden College"
               }, {
                   institution: "Dania College"
               },
               {
                   institution: "A.K. High School"
               }]
           }

    ];
    $scope.ondrop = function (e) {
        console.log(e);
    }
}]);