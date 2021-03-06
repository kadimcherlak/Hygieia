

/**

* View controller for the build widget

*/

(function () {

    'use strict';

 

    angular

        .module(HygieiaConfig.module)

        .controller('BuildWidgetViewController', BuildWidgetViewController);

 

    BuildWidgetViewController.$inject = ['$scope', 'buildData','collectorData','DisplayState','$q','$uibModal','$http'];

    function BuildWidgetViewController($scope, buildData,collectorData,DisplayState,$q,$uibModal,$http) {

        var ctrl = this;

        var builds = [];

 

        //region Chart Configuration

        // line chart config

 

        ctrl.lineOptions = {

            plugins: [

                Chartist.plugins.gridBoundaries(),

                Chartist.plugins.lineAboveArea(),

                Chartist.plugins.tooltip(),

                Chartist.plugins.pointHalo()

            ],

            showArea: true,

            lineSmooth: false,

            fullWidth: true,

            chartPadding: 7,

            axisX: {

                showLabel: false

            },

            axisY: {

                labelInterpolationFnc: function(value) {

                    return value === 0 ? 0 : ((Math.round(value * 100) / 100) + '');

                }

            }

        };

 

        // bar chart config

        ctrl.buildDurationOptions = {

            plugins: [

                Chartist.plugins.threshold({

                    threshold: $scope.widgetConfig.options.buildDurationThreshold || 10

                }),

                Chartist.plugins.gridBoundaries(),

                Chartist.plugins.tooltip(),

                Chartist.plugins.axisLabels({

                    stretchFactor: 1.4,

                    axisX: {

                        labels: [

                            moment().subtract(14, 'days').format('MMM DD'),

                            moment().subtract(7, 'days').format('MMM DD'),

                            moment().format('MMM DD')

                        ]

                    }

                })

            ],

            stackBars: true,

            centerLabels: true,

            axisY: {

                offset: 30,

                labelInterpolationFnc: function(value) {

                    return value === 0 ? 0 : ((Math.round(value * 100) / 100) + '');

                }

            }

        };

 

        ctrl.buildDurationEvents = {

            'draw': draw

        };

        //endregion

        /*Dora Added the code Here - Start Region*/
       
        ctrl.selectedObject ="";
        $scope.loadApplication=function(item){
        	
         //  processResponse(item);
        	   
             ctrl.TowerName=item.jobName;
             
            
             if (ctrl.selectedObject == item.jobName) //reference equality should be sufficient
            	 
            	 ctrl.selectedObject = ""; //de-select if the same object was re-clicked
             else
            	 ctrl.selectedObject = item.jobName;
             console.log("this is click"+ctrl.selectedObject);
            var findvalue=_.filter($scope.jobData, {jobName:item.jobName});

            var valAry=[];

            if(!findvalue.length){

            valAry.push(findvalue);

            }

            else

            {

            valAry=findvalue;

            }

            var groups = _.groupBy(valAry, function(job){

                    return job.jobName+"#"+ job.ApplicationName;

                });

 

            console.log(groups); 

                $scope.ApplicationCount = _.map(groups, function(group){

                    var newvar= {

                        ApplicationName: group[0].ApplicationName,

                        status: group[0].status,

                        count: _.countBy(group, 'status')

                        

                    };

                    

                    if (!newvar.count.Success)

                    newvar.count.Success = 0;

                    

                    if (!newvar.count.Failure)

                    newvar.count.Failure = 0;

                    if (!newvar.count.Unstable)

                        newvar.count.Unstable = 0;
                    
                    if (!newvar.count.Aborted)

                        newvar.count.Aborted = 0;

                    return newvar;

                });

                

               

            };

 

            //endregion

 

            /*Dora Added the code Here - Start Region*/

            var newresponsearray=[];

            $scope.getData = function (filter) {

 

                   return collectorData.itemsByType('build', {"search": filter, "size": 20}).then(function (response){

            var index = 0;
           


                      // response.forEach(function(element){

            getAppData(response[0]);

                        function getAppData(element){

                       // console.log(element.id+"----"+element.description);

                        /*console.log(index);*/

                         var postData = {"name":"build","componentId":$scope.widgetConfig.componentId,"options":{"id":"build0","buildDurationThreshold":3,"consecutiveFailureThreshold":5},"collectorItemIds":[element.id]};

                         $http.put("http://localhost:3000/api/dashboard/5a35b1d4c9705812a0d0d109/widget/5a35b1e6c9705812a0d0d10b", postData)

                           .success(function(data, status, headers, config){
                        	  
                         /* console.log("IN SAVE WORK - SUCCESS");*/

                          // element.HelloDora=$scope.GetDataMethod();
                        	   
                            $http.get("http://localhost:3000/api/build/?componentId="+$scope.widgetConfig.componentId+"&numberOfDays=15").then(function (getResponse) {
                            	
                         
                           response[index].HelloDora = getResponse.data;

                           index++;

            if(index < response.length){

                           getAppData(response[index]);}

            else{

            ctrl.newData=response;

            /*console.log(response);*/

            ctrl.jobData = [];

                
                _.each(ctrl.newData, function(row) {

                

                _.each(row.HelloDora.result, function(url){
                
                	newresponsearray.push(url);
                

                ctrl.jobData.push({

                "jobName" : url.buildUrl.split("/")[4].replace("%20"," "),

                "status" : url.buildStatus,

                "ApplicationName":url.buildUrl.split("/")[6].replace("%20"," "),

                "EndTime": url.endTime

                });   

                

                });

                });

                $scope.jobData=ctrl.jobData;

                console.log($scope.jobData);

               // var counts = _.countBy(ctrl.jobData,'job');


                var groups = _.groupBy(ctrl.jobData, function(job){

                    return job.jobName;

                });

                ctrl.jobStatusCount = _.map(groups, function(group){

                    var newvar= {

                        jobName: group[0].jobName,

                        ApplicationName:group[0].ApplicationName,

                        status: group[0].status,
                        
                        EndTime: group[0].EndTime,

                        count: _.countBy(group, 'status')

                    };

                    if (!newvar.count.Success)

                    newvar.count.Success = 0;

                    

                    if (!newvar.count.Failure)

                    newvar.count.Failure = 0;

                    if (!newvar.count.Unstable)

                        newvar.count.Unstable = 0;
                    
                    if (!newvar.count.Aborted)

                        newvar.count.Aborted = 0;
                    
                    
                    return newvar;

                   

                });

                
                }  
        });

                            
                           })    

                            .error(function(){

 

                           console.log("ERROR IN SAVE WORK!");

                           index++;

                           if(index <= response.length){

                                           getAppData(response[index]);}

                           else{

                           ctrl.newData=response;
                        
                           /*console.log(response);*/

                           }

 

                        })          
                       
                        }
                        ctrl.rrr=newresponsearray;
                        
                        $scope.testTotalBuilds(newresponsearray);

                     // });
                       

                   /*console.log(response);*/

                });

                 
            }

 

       

        $scope.weDontLike = function(data) {

            return function(item) {

                  var x;

                  /*x.name=item.buildUrl.split("/")[4].replace("%20"," ");

                  x.status=item.buildStatus;*/

                  //console.log(item.buildUrl+"--"+ item.buildStatus);

                  /*+"--"+item.buildUrl.split("/")[6].replace("%20"," ")+"--"+item.buildStatus*/

                  /*x+=item.buildUrl.split("/")[4].replace("%20"," ")+",";*/

                  return x;

                  /*arraydata.push(x);

                  console.log(arraydata[0]);*/

                  /*console.log("this is the:"+item.length);*/

                  }

        }

        /*Dora Added the code Here - Start Region*/

       

        $scope.GetDataMethod=function() {

            return $http.get("http://localhost:3000/api/build/?componentId=5a280f0298955e20688c96f3&numberOfDays=15").then(function (response) {

                   return response.data;

               });

           }      

        

        $scope.PutDataMethod = function () {

            var postData = {"name":"build","componentId":"5a280f0298955e20688c96f3","options":{"id":"build0","buildDurationThreshold":3,"consecutiveFailureThreshold":5},"collectorItemIds":["5a280e3198955e0cbcf2b76b"]};

            $http.put("http://localhost:3000/api/dashboard/5a280f0298955e20688c96f4/widget/5a280f0998955e20688c96f6", postData)

                .success(function(data, status, headers, config){

                    console.log("IN SAVE WORK - SUCCESS");

                    console.log(data);

                })

                .error(function(){

                    console.log("ERROR IN SAVE WORK!");

                })

        }

        /*Dora Added the code Here - End Region*/

 

       

        ctrl.load = function() {

            var deferred = $q.defer();

            var params = {

                componentId: $scope.widgetConfig.componentId,

                numberOfDays: 15

            };

            buildData.details(params).then(function(data) {
            	ctrl.tempdataresults=data.result;
                builds = data.result;
                
                processResponse(builds);

                deferred.resolve(data.lastUpdated);

            });

           return deferred.promise;

        };

 

        ctrl.open = function (url) {

            window.open(url);

        };

 

        ctrl.detail = function(build) {

            $uibModal.open({

                templateUrl: 'components/widgets/build/detail.html',

                controller: 'BuildWidgetDetailController',

                controllerAs: 'detail',

                size: 'lg',

                resolve: {

                    build: function() {

                        return _.find(builds, { number: build.number });

                    },

                    collectorName: function () {

                        return $scope.dashboard.application.components[0].collectorItems.Build[0].collector.name;

                    },

                    collectorNiceName: function () {

                        return $scope.dashboard.application.components[0].collectorItems.Build[0].niceName;

                    }

                }

            });

        };

 

        // creates the two-color point design

        // the custom class, 'ct-point-halo' can be used to style the outline

        function draw(data) {

            if (data.type === 'bar') {

                if (data.value.y > 0) {

                    data.group.append(new Chartist.Svg('circle', {

                        cx: data.x2,

                        cy: data.y2,

                        r: 7

                    }, 'ct-slice-pie'));

                    data.y2 -= 7;

                }

            }

 

            if (data.type === 'point') {

                data.group.append(new Chartist.Svg('circle', {

                    cx: data.x,

                    cy: data.y,

                    r: 3

                }, 'ct-point-halo'), true);

            }

        }

 

        //region Processing API Response

        function processResponse(data) {

            var worker = {

                    averageBuildDuration: averageBuildDuration,

                    buildsPerDay: buildsPerDay,

                    latestBuilds: latestBuilds,

                    setDisplayToErrorState: setDisplayToErrorState,

                    totalBuilds: totalBuilds

                };

 

            //region web worker method implementations

            function averageBuildDuration(data, buildThreshold, cb) {

 ctrl.ad=data;

                cb({

                    series: getSeries()

                });

 

                function getSeries() {

                    var result = getPassFail(simplify(group(filter(data))));

 

                    return [

                        result.passed,

                        result.failed

                    ];

                }

 

                // filter to successful builds in the last 15 days

                function filter(data) {

                    return _.filter(data, function (item) {

                        return item.buildStatus == 'Success' && Math.floor(moment(item.endTime).endOf('day').diff(moment(new Date()).endOf('day'), 'days')) >= -15;

                    });

                }

 

                function group(data) {

                    return _.groupBy(data, function (item) {

                        return moment(item.endTime).format('L');

                    });

                }

 

                function simplify(data) {

                    // create array with date as the key and build duration times in an array

                    var simplifiedData = {};

                    _.forEach(data, function (buildDay, key) {

                        if (!simplifiedData[key]) {

                            simplifiedData[key] = [];

                        }

 

                        _.forEach(buildDay, function (build) {

                            var duration = moment(build.endTime).diff(moment(build.startTime), 'seconds') / 60;

                            simplifiedData[key].push(duration);

                        });

                    });

 

                    return simplifiedData;

                }

 

                function getPassFail(simplifiedData) {

                    // loop through all days in the past two weeks in case there weren't any builds

                    // on that date

                    var passed = [], failed = [];

                    for (var x = 0; x <= 14; x++) {

                        var date = moment(new Date()).subtract(x, 'days').format('L');

                        var data = simplifiedData[date];

 

                        // if date has no builds, add 0,0

                        if (!data || !data.length) {

                            passed.push(0);

                            failed.push(0);

                        }

                        else {

                            // calculate average and put in proper

                            var avg = _(data).reduce(function(a,b) {

                                    return a + b;

                                }) / data.length;

 

                            if (avg > buildThreshold) {

                                passed.push(0);

                                failed.push(avg);

                            }

                            else {

                                passed.push(avg);

                                failed.push(0);

                            }

                        }

                    }

 

                    return {

                        passed: passed.reverse(),

                        failed: failed.reverse()

                    };

                }

            }

            function buildsPerDay(data, cb) {

                var fifteenDays = toMidnight(new Date());

                fifteenDays.setDate(fifteenDays.getDate() - 14);

            /*    ctrl.LLOO=data[0].log;
       
                var Passarray=[];
                var Failarray=[];
                var passoutput = []; 
                var failoutput = []; 
                
                for (var t=0;t<data.length;t++)
                {
                   var g=data[t].log;
                   ctrl.rrr=data[t].log;
                  // ctrl.jj=g.split("<table ")[3].split("<tr>")[2].split("<td ")[3].split(">")[1].slice(0,-4);
                   passoutput[t]=g.split("<table ")[3].split("<tr>")[2].split("<td ")[7].split(">")[1].slice(0,-4);
                   failoutput[t]=g.split("<table ")[3].split("<tr>")[2].split("<td ")[3].split(">")[1].slice(0,-4);
                   Passarray.push(passoutput[t]);
                   Failarray.push(failoutput[t]);
                   //Passarray.push(output[0]);

                }
             
*/
                cb({

                    passed: countBuilds(all(data)),

                    failed: countBuilds(failed(data)),
                    
  //                  PassedTest:Passarray,
    //                FailedTest:Failarray

                });

 
                function all(data) {

                    return _.filter(data, function (build) {

                        return build.endTime >= fifteenDays.getTime() && (build.buildStatus !== 'InProgress');

                    });

                }

 

                function failed(data) {

                    return _.filter(data, function (build) {

                        return build.endTime >= fifteenDays.getTime() && (build.buildStatus !== 'Success') && (build.buildStatus !== 'InProgress');

                    });

                }

 

                function countBuilds(data) {

                    var counts = [];

                    var dt = new Date(fifteenDays.getTime());

                    var grouped = _.groupBy(data, function (build) {

                        return toMidnight(new Date(build.endTime)).getTime();

                    });

 

                    _.times(15, function () {

                        var count = grouped[dt.getTime()] ? grouped[dt.getTime()].length : 0;

                        counts.push(count);

                        dt.setDate(dt.getDate() + 1);

                    });

 

                    return counts;

                }

 

 

                function toMidnight(date) {

                    date.setHours(0, 0, 0, 0);

                    return date;

                }

            }

 

            function latestBuilds(data, cb) {

                // order by end time and limit to last 5

                data = _.sortBy(data, 'endTime').reverse();

                /*.slice(0, 5)*/

 

                // loop and convert time to readable format

                data = _.map(data, function (item) {

                    return {

                        status : item.buildStatus.toLowerCase(),

                        number: item.number,

                        endTime: item.endTime,

                        url: item.buildUrl

                    };

                });

 

                cb(data);

                ctrl.mydd=data;

            }

 

            function setDisplayToErrorState(data, failureThreshold, cb) {

                // order by end time and limit to last 5

                data = _.sortBy(data, 'endTime').reverse().slice(0, failureThreshold);

                data = _.filter(data, function (item) {

                    return (item.buildStatus.toLowerCase() != 'success') &&  (item.buildStatus.toLowerCase() != 'inprogress') ;

                });

 

                cb(data && data.length >= failureThreshold);

            }

/*Dora Changing the code here*/

            $scope.testTotalBuilds= function(data){
                ctrl.arp = data;
                var today = toMidnight(new Date());
                var sevenDays = toMidnight(new Date());
                var fourteenDays = toMidnight(new Date());
                sevenDays.setDate(sevenDays.getDate() - 7);
                fourteenDays.setDate(fourteenDays.getDate() - 14);
                /*console.log(data);*/
                ctrl.dfg=countfourteenDayscontentyy(data);
                 /*console.log("Function Called");
                 console.log(data);
                 */
            
                 function calcupass(data) {
                	 ctrl.len=data.length;
                     var myarray = [];
                     var result = 0;
                     var resultfail = 0;
                     for (var i = 0; i <= data.length - 1; i++) {
                         if (data[i].buildStatus == "Success") {
                        	 
                             result += 1;
                         }


                         if (data[i].buildStatus == "Aborted" || data[i].buildStatus == "Failure") {
                             resultfail += 1;
                         }
                     }
                     var newval = 0;
                     var newvalfailed = 0;
                     newval = (result / (data.length)) * 100;
                     newvalfailed = (resultfail / (data.length)) * 100;
                     myarray.push(newval);
                     myarray.push(newvalfailed);
                     
                     return myarray
 }
                 function countfourteenDayscontentyy() {

                     return _.filter(data, function (build) {

                          return build.endTime >= fourteenDays.getTime();

                      });

                 }

                 function toMidnight(date) {
                     date.setHours(0, 0, 0, 0);
                     return date;
                 }
                 
             }        

     
            function totalBuilds(data, cb) {

            	ctrl.testtotal=data.length;

                var today = toMidnight(new Date());

                var sevenDays = toMidnight(new Date());

                var fourteenDays = toMidnight(new Date());
                sevenDays.setDate(sevenDays.getDate() - 7);

                fourteenDays.setDate(fourteenDays.getDate() - 14);

               

                ctrl.kkk=calcupass(countTodaycontent());

                ctrl.jjj=calcupass(countsevencontent());

               

                ctrl.hhh=calcupass(countfourteenDayscontent());

                cb({

                    today: countToday(),

                    sevenDays: countSevenDays(),

                    fourteenDays: countFourteenDays()

                });

                

                function calcupass(data){

                  var myarray=[];

                   var result = 0;

                   var resultfail = 0;

                   

                   

                     for (var i = 0; i <= data.length-1; i++){

                         if(data[i].buildStatus=="Success")

                               {

                         result += 1;

                               }

                         if(data[i].buildStatus=="Aborted" || data[i].buildStatus=="Failure")

                         {

                               resultfail += 1;

                         }

                               

                     }

                     var  newval=0;

                     var  newvalfailed=0;

                   

                         newval=(result/(data.length))*100;

                         newvalfailed=(resultfail/(data.length))*100; 

                   

                     

                     myarray.push(newval);

                     myarray.push(newvalfailed);

                     return myarray      

                }

               

                /*Dora  Changing the code end here*/

                function countTodaycontent() {

                    return _.filter(data, function (build) {
                    	ctrl.filtertodaydata=data;

                        return build.endTime >= today.getTime();

                    });

                }

                function countsevencontent() {

                   return _.filter(data, function (build) {

                         return build.endTime >= sevenDays.getTime();

                       

                     });

                }

                function countfourteenDayscontent() {

                   return _.filter(data, function (build) {

                        return build.endTime >= fourteenDays.getTime();

                       

                    });

               }

                function countToday() {

                    return _.filter(data, function (build) {

                        return build.endTime >= today.getTime();

                    }).length;

                }

 

                function countSevenDays() {

                    return _.filter(data, function (build) {

                        return build.endTime >= sevenDays.getTime();

                    }).length;

                }

 

                function countFourteenDays() {

                    return _.filter(data, function (build) {

                        return build.endTime >= fourteenDays.getTime();

                    }).length;

                }

 

                function toMidnight(date) {

                    date.setHours(0, 0, 0, 0);

                    return date;

                }

            }

            //endregion

 

            //region web worker calls

            // call to webworker methods nad set the controller variables with the processed values

            worker.buildsPerDay(data, function (data) {

                //$scope.$apply(function () {

 

                var labels = [];

                _(data.passed).forEach(function() {

                    labels.push(1);

                });

 

                ctrl.lineData = {

                    labels: labels,

                    series: [{

                        name: 'success',

                        data: data.passed

                    }, {

                        name: 'failures',

                        data: data.failed

                    }]

                };

               

                ctrl.lineDatacvs = {

                        labels: labels,

                        series: [{

                            name: 'success',

                           // data: data.PassedTest
                            data: data.passed

                        }, {

                            name: 'failures',

                          //  data: data.FailedTest
                            data: ["3","2","4","5"]

                        }]

                    };

                //});

            });

 

            worker.latestBuilds(data, function (buildsToDisplay) {

                //$scope.$apply(function () {

                    ctrl.recentBuilds = buildsToDisplay;

                //});

            });

 

            worker.averageBuildDuration(data, $scope.widgetConfig.options.buildDurationThreshold, function (buildDurationData) {

                //$scope.$apply(function () {

                var labels = [];

                _(buildDurationData.series[0]).forEach(function() {

                    labels.push('');

                });

                buildDurationData.labels = labels;

                //_(buildDurationData.series).forEach

                ctrl.buildDurationData = buildDurationData;

                //});

            });

 

            worker.setDisplayToErrorState(data, $scope.widgetConfig.options.consecutiveFailureThreshold, function (displayAsErrorState) {

                //$scope.$apply(function () {

                    $scope.display = displayAsErrorState ? DisplayState.ERROR : DisplayState.DEFAULT;

                //});

            });

 

            worker.totalBuilds(data, function (data) {

                //$scope.$apply(function () {

                  ctrl.ggg=data;

                    ctrl.totalBuildsYesterday = data.today;

                    ctrl.totalBuildsLastWeek = data.sevenDays;

                    ctrl.totalBuildsLastMonth = data.fourteenDays;

                //});

            });

            //endregion

        }

        //endregion

    }

})();